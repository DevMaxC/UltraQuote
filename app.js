const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var mode = "Drag";
var scale = 1;
var scaleUnit = "Px";
//how many pixels per real unit

document.getElementById('priceConversionText').innerHTML = "£/" + scaleUnit + "²";

var uiElements = [];
var layers = [];
var selectedLayer = null;
var scaleEnabled = false;
var measureEnabled = false;
var dragEnabled = false;
var moveEnabled = false;
var resizeEnabled = null;
var previousSize
var firstX;
var firstY;
//canvas.height = 1001;
//canvas.width = 1001;
zoom = 1;

var keysdown = [];
mouseDown = false;
mouseX = 0;
mouseY = 0;

canvas.addEventListener('mousemove', function (event) {
  mouseX = event.offsetX / zoom;
  mouseY = event.offsetY / zoom;
});
canvas.addEventListener('mousedown', function (event) {
  mouseDown = true;
});
canvas.addEventListener('mouseup', function (event) {
  mouseDown = false;
});
document.addEventListener('keydown', function (event) {
  var count = 0
  for (i = 0; i < keysdown.length; i++) {
    if (keysdown[i] == event.key) {
      count++
      break;
    }
  }
  if (count == 0) {
    keysdown.push(event.key);
  }
});
document.addEventListener('keyup', function (event) {
  for (i = 0; i < keysdown.length; i++) {
    if (keysdown[i] == event.key) {
      keysdown.splice(i, 1);
    }
  }
});

function changeZoom(multiplier) {
  ctx.scale(multiplier, multiplier)
  zoom *= multiplier
};

function changeMode(newMode) {
  mode = newMode;
  if (newMode == "Measure" || newMode == "Scale") {
    canvas.style.cursor = "crosshair"
  }
  if (newMode == "Drag") {
    canvas.style.cursor = "pointer"
  }
  if (newMode == "Move") {
    canvas.style.cursor = "move"
  }
};

/// BEGIN   CODE ADAPTED FROM https://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5/43364730 BY GMAN
function resizeCanvasToDisplaySize(canvas) {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  // If it's resolution does not match change it
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.scale(zoom, zoom)
    return true;
  }

  return false;
}
///END

function layerRemove(index) {
  //removes a layer
  if (index != null) {
    layers.splice(index, 1)
  }
  selectedLayer = null;
};

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) //uses multiplication instead of math.pow as it is faster according to https://i.stack.imgur.com/AjRF6.jpg
};

function upload() {
  var reader = new FileReader(); //creates a file reader object
  img = new Image(); //creates an image object
  reader.onload = function (e) {
    img.src = e.target.result; //creates an src
  };
  reader.readAsDataURL(document.getElementById("inputFile").files[0]);
  document.getElementById("inputFile").value = "";
  img.onload = function (e) {
    layers.push(new myImage(img, "Image"))
    selectedLayer = layers.length - 1;
  }
};

function changeLayer(diff) {
  if (selectedLayer + diff >= 0 && selectedLayer + diff < layers.length) {
    var layer = layers[selectedLayer];
    layers.splice(selectedLayer, 1);
    layers.splice(selectedLayer + diff, 0, layer);
    selectedLayer = selectedLayer + diff
  }
};

function newRect(height = 100, width = 100) {
  //sets the width of the game to 4 Metres as is the standard roll width
  if (scaleUnit[0] == "M") {
    width = 4 * scale
  }
  if (scaleUnit == "CM") {
    width = 400 * scale
  }
  //creates an object containing the width and height of the rectangle, this is similar to the image object so we can reuse lots of code.
  obj = {
    height: height,
    width: width
  }
  layers.push(new Rectangle(obj, "Rect"));
  selectedLayer = layers.length - 1; //sets the selected layer to the layer that has just been created. so the new rectangle is selected.
};

function calculateTotalGrassArea() {
  var totalArea = 0
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type == "Rect") {
      totalArea += layers[i].area()
    } // finds all the rectangles (ignores Images), gets their areas and adds them to a total.
  }
  return Math.round(totalArea) // returns the total area, which is rounded to the nearest number, so that it isnt influenced by precise decimal sizes of rectangles.
};

function duplicateLayer(targetLayer) {
  if (targetLayer.type == "Rect") {
    layers.push(new Rectangle({
      width: targetLayer.obj.width,
      height: targetLayer.obj.height
    }, targetLayer.type, targetLayer.x, targetLayer.y, targetLayer.showDimensions, targetLayer.rotation, targetLayer.opacity, targetLayer.colour, targetLayer.background))
  } else if (targetLayer.type == "Image") {
    var img = new Image()
    img.width = targetLayer.obj.width
    img.height = targetLayer.obj.height
    img.src = targetLayer.obj.src
    layers.push(new myImage(img, targetLayer.type, targetLayer.x, targetLayer.y, targetLayer.showDimensions, targetLayer.rotation, targetLayer.opacity, targetLayer.colour, targetLayer.background))
  }
};

function update() {
  document.getElementById('totalArea').innerHTML = calculateTotalGrassArea() + " " + scaleUnit + "²"
  document.getElementById('indicator').innerHTML = zoom * 100 + "% ";
  document.getElementById("priceConversionTotal").innerHTML = "Total = £" + (calculateTotalGrassArea() * Number(document.getElementById("priceConversion").value));

  ctx.strokeStyle = "Black";
  ctx.fillStyle = "#323232";
  resizeCanvasToDisplaySize(canvas)
  ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);
  ctx.fill();

  //draw
  for (i = 0; i < layers.length; i++) {
    layers[i].draw(i)
    if (layers[i].showDimensions&&!layers[i].background) {
      layers[i].drawDimensions();
    }
  }
  if (selectedLayer != null) {
    layers[selectedLayer].drawOuterBox()
  }

  if (mode == "Drag") {
    if (dragEnabled == false && selectedLayer != null) {
      //Drawing and checking if the resize Dots are being clicked by the mouse
      if (!layers[selectedLayer].background) { //we dont want to show the dots when it is a background as they are considered locked and should not be resized
        layers[selectedLayer].drawDots();
        if (mouseDown&&resizeEnabled==null){
          resizeEnabled = layers[selectedLayer].dotClicked();
          firstX = mouseX;
          firstY = mouseY;
          previousSize={width:layers[selectedLayer].obj.width,height:layers[selectedLayer].obj.height};
        }
      }
    }
    if (resizeEnabled != null) { //since there has been a resize change detected then start with the resize process
      if (mouseDown) {
        switch (resizeEnabled) {
          case "left":
            layers[selectedLayer].setWidth(previousSize.width + firstX - mouseX)
            layers[selectedLayer].setPosition(mouseX,layers[selectedLayer].y)
            break

          case "right":
            layers[selectedLayer].setWidth(previousSize.width - firstX + mouseX)
            break

          case "up":
            layers[selectedLayer].setHeight(previousSize.height + firstY - mouseY)
            layers[selectedLayer].setPosition(layers[selectedLayer].x,mouseY)
            break

          case "down":
            layers[selectedLayer].setHeight(previousSize.height - firstY + mouseY)
            break
        }
      }
      else{
        resizeEnabled = null;
        firstX=null;
        firstY=null;
      }
    } else {
      if (mouseDown) { //main series of moving the selected item by mouse
        if (selectedLayer == null) {
          for (var i = 0; i < layers.length; i++) {
            if (layers[i].isTouchingMouse()) { //if the mouse is down and the mouse is over the layer, then
              selectedLayer = i;
              document.getElementById("Opacity").value = layers[selectedLayer].opacity
              document.getElementById("Colour").value = layers[selectedLayer].colour
              document.getElementById("Dimensions").checked = layers[selectedLayer].showDimensions
              document.getElementById("Background").checked = layers[selectedLayer].background
            }
          }
        } else {
          if (dragEnabled == false) {
            if (layers[selectedLayer].isTouchingMouse()) {
              dragEnabled = true;
              offsetX = mouseX - layers[selectedLayer].x;
              offsetY = mouseY - layers[selectedLayer].y;
            } else {
              selectedLayer = null;
            }
            for (var i = layers.length - 1; i > -1; i--) {
              if (layers[i].isTouchingMouse()) {
                selectedLayer = i;
                document.getElementById("Opacity").value = layers[selectedLayer].opacity
                document.getElementById("Colour").value = layers[selectedLayer].colour
                document.getElementById("Dimensions").checked = layers[selectedLayer].showDimensions
                document.getElementById("Background").checked = layers[selectedLayer].background
                dragEnabled = true;
                offsetX = mouseX - layers[selectedLayer].x;
                offsetY = mouseY - layers[selectedLayer].y;
                break;
              }
            }
          } else {
            if (!layers[selectedLayer].background) {
              layers[selectedLayer].setPosition(mouseX - offsetX, mouseY - offsetY);
            }
          }
        }
      } else {
        dragEnabled = false;
      }
    }
    if (selectedLayer != null) {
      document.getElementById("layerPosBox").hidden = false;
    } else {
      document.getElementById("layerPosBox").hidden = true;
    }
    if (selectedLayer != null && layers[selectedLayer].type == "Rect") {
      //things which should show on bar when it is operating on a rectangle
      document.getElementById("opacityBox").hidden = false;
      document.getElementById("colourSetter").hidden = false;
      document.getElementById("dimensionsBox").hidden = false;
      layers[selectedLayer].opacity = document.getElementById("Opacity").value;
      layers[selectedLayer].colour = document.getElementById("Colour").value;
      layers[selectedLayer].showDimensions = document.getElementById("Dimensions").checked;
    } else {
      document.getElementById("opacityBox").hidden = true;
      document.getElementById("colourSetter").hidden = true;
      document.getElementById("dimensionsBox").hidden = true;
    }
    if (selectedLayer != null && layers[selectedLayer].type == "Image") {
      //things which should show on bar when it is operating on an image
      document.getElementById("backgroundOptionsBox").hidden = false
      layers[selectedLayer].background = (document.getElementById("Background").checked)

      if (layers[selectedLayer].background) {
        document.getElementById("rotationBox").hidden = false
        layers[selectedLayer].rotation = Number(document.getElementById("Rotation").value)
      } else {
        document.getElementById("rotationBox").hidden = true
      }
    } else {
      document.getElementById("backgroundOptionsBox").hidden = true
      document.getElementById("rotationBox").hidden = true
    }

  }
  if (mode == "Move") {
    if (mouseDown) {
      if (moveEnabled == false) {
        moveEnabled = true;
        firstX = mouseX;
        firstY = mouseY;
      }
      if (moveEnabled) {
        for (i = 0; i < layers.length; i++) {
          layers[i].x = layers[i].x + (mouseX - firstX);
          layers[i].y = layers[i].y + (mouseY - firstY);
        }
        firstX = mouseX;
        firstY = mouseY;
      }
    } else {
      moveEnabled = false;
    }
  }
  if (mode == "Scale") {
    if (mouseDown) {
      if (scaleEnabled) {
        ctx.beginPath();
        ctx.moveTo(firstX, firstY);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = "red";
        ctx.linewidth = 20;
        ctx.stroke();
        ctx.closePath();
      } else {
        scaleEnabled = true;
        firstX = mouseX;
        firstY = mouseY;
      }
    } else if (scaleEnabled) {
      var input = window.prompt(Math.round(distance(firstX, firstY, mouseX, mouseY)) + " pixels equates to how many units?")
      if (input == null || input == "") {
        alert("Fail, please put in a number, i.e. 4   (meaning that n pixels equate to 4 units)")
        scaleEnabled = false;
      } else {
        scale = distance(firstX, firstY, mouseX, mouseY) / input
        scaleUnit = window.prompt("What units are these? i.e. Metres,Inches,CM")
        document.getElementById('priceConversionText').innerHTML = "£/" + scaleUnit + "²";
        scaleEnabled = false;
      }
    }
  }
  if (mode == "Measure") {
    if (scale != null) {
      if (mouseDown) {
        if (measureEnabled) {
          ctx.beginPath();
          ctx.moveTo(firstX, firstY);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = "red";
          ctx.linewidth = 20;
          ctx.stroke();
          ctx.closePath();
        } else {
          measureEnabled = true;
          firstX = mouseX;
          firstY = mouseY;
        }
      } else if (measureEnabled) {
        alert(Math.round(distance(firstX, firstY, mouseX, mouseY) / scale) + " " + scaleUnit)
        measureEnabled = false;
      }
    } else {
      alert("Scale Not Set! Click scale to set!")
    }
  }
};

setInterval(update, 0)