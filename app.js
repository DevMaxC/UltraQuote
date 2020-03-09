const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var mode = "Drag";
var scale = 1;
var scaleUnit = "Px";
//how many pixels per real unit

document.getElementById('priceConversionText').innerHTML = "£/" + scaleUnit + "²";

var layers = []; //all the layer objects are put into this array
var selectedLayer = null; // tracks which layer is selected
var scaleEnabled = false; // holds a scaling drag is currently ongoing so that it can properly draw a line
var measureEnabled = false; // Holds if the user has started a measurement so that lines can be drawn properly
var dragEnabled = false; // Holds if the user is currently dragging
var moveEnabled = false; // Holds if the user is dragging the whole screen
var resizeEnabled = null; // Holds which direction the user is scaling the selectedLayer

var previousSize; // holds the previous size of the layer so that it knows how big the resize should be
var firstX; // holds the first x coordinate of mouse so that lines can be drawn
var firstY; // holds the first y coordinate of mouse so that lines can be drawn
var zoom = 1; // the zoom level of the canvas, useful for translating mouse position to a zoomed canvas

var mouse = {
  mouseDown: false,
  x: 0,
  y: 0
}; // holds the information about the mouse, so that all function can see it

//creates the visual elements on the screen
var UiElements = [new Slider("Opacity", "opacityBox", "Opacity", "Opacity", 0, 100, 1).show(), new checkBox("Dimensions", "dimensionsBox", "Dimensions", "Show Dimensions").show(), new Button("Colour", "colourSetter", "ColourButton", "🎨", function () {
  document.getElementById('Colour').click()
}).show(), new checkBox("background", "backgroundOptionsBox", "Background", "Background").show(), new Slider("Rotation", "rotationBox", "Rotation", "Rotation", -360, 360, 1).show(), new Button("LayerUp", "layerPosBox", "layerUp", "🔺").show(), new Button("LayerDown", "layerPosBox", "layerDown", "🔻").show(), new Button("Trash", "layerPosBox", "TrashCan", "🗑️", function () {
  layers.splice(selectedLayer, 1);
  selectedLayer = null;
}).show(), new Button("Duplicate", "layerPosBox", "Dupe", "➕", function () {
  duplicateLayer(layers[selectedLayer])
}).show(), new Button("Clear", "layerPosBox", "ClearButton", "💣", function () {
  layers = [];
  selectedLayer = null;
}).show()]


canvas.addEventListener('mousemove', function (event) {
  mouse.X = event.offsetX / zoom;
  mouse.Y = event.offsetY / zoom;
});
canvas.addEventListener('mousedown', function (event) {
  mouse.mouseDown = true;
});
canvas.addEventListener('mouseup', function (event) {
  mouse.mouseDown = false;
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

function resizeCanvas(canvas) {
  // look up the size the canvas is being displayed
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  // If its resolution does not match then change it
  if (width !== canvas.width || height !== canvas.height) {
    ctx.scale(zoom, zoom) //adjust scale to ensure view stays correct.
    canvas.width = width;
    canvas.height = height;
  }
}

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

  //UI updating
  document.getElementById('totalArea').innerHTML = calculateTotalGrassArea() + " " + scaleUnit + "²"
  document.getElementById('indicator').innerHTML = zoom * 100 + "% ";
  document.getElementById("priceConversionTotal").innerHTML = "Total = £" + (calculateTotalGrassArea() * Number(document.getElementById("priceConversion").value));

  //Check if canvas needs to be resized and clear the last frame
  ctx.strokeStyle = "Black";
  ctx.fillStyle = "#323232";
  resizeCanvas(canvas)
  ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);
  ctx.fill();

  //drawing all layers and the outer box
  for (i = 0; i < layers.length; i++) {
    layers[i].draw(i)
    if (layers[i].showDimensions && !layers[i].background) {
      layers[i].drawDimensions();
    }
  }
  if (selectedLayer != null) {
    layers[selectedLayer].drawOuterBox()
  }

  // code for all 4 modes
  if (mode == "Drag") {
    if (dragEnabled == false && selectedLayer != null) {
      //Drawing and checking if the resize Dots are being clicked by the mouse
      if (!layers[selectedLayer].background) { //we dont want to show the dots when it is a background as they are considered locked and should not be resized
        layers[selectedLayer].drawDots();

        if (mouse.mouseDown && resizeEnabled == null) {
          resizeEnabled = layers[selectedLayer].dotClicked();
          previousSize = {
            width: layers[selectedLayer].obj.width,
            height: layers[selectedLayer].obj.height
          };
          firstX = mouse.X;
          firstY = mouse.Y;
        }
      }
    }
    if (resizeEnabled != null) { //since there has been a resize change detected then start with the resize process
      if (mouse.mouseDown) {
        switch (resizeEnabled) {
          case "left":
            layers[selectedLayer].setWidth(previousSize.width + firstX - mouse.X)
            layers[selectedLayer].setPosition(mouse.X, layers[selectedLayer].y)
            break

          case "right":
            layers[selectedLayer].setWidth(previousSize.width - firstX + mouse.X)
            break

          case "up":
            layers[selectedLayer].setHeight(previousSize.height + firstY - mouse.Y)
            layers[selectedLayer].setPosition(layers[selectedLayer].x, mouse.Y)
            break

          case "down":
            layers[selectedLayer].setHeight(previousSize.height - firstY + mouse.Y)
            break
        }
      } else {
        resizeEnabled = null;
        firstX = null;
        firstY = null;
      }
    } else {
      if (mouse.mouseDown) { //main series of moving the selected item by mouse
        if (selectedLayer == null) {
          for (var i = 0; i < layers.length; i++) {
            if (layers[i].isTouchingMouse()) { //if the mouse is down and the mouse is over the layer, then
              selectedLayer = i;

              //when the UI is shown then set the value to the
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
              offsetX = mouse.X - layers[selectedLayer].x;
              offsetY = mouse.Y - layers[selectedLayer].y;
            } else {
              selectedLayer = null;
            }
            for (var i = layers.length - 1; i > -1; i--) { //if a layer has been selected check again incase we are dragging a different layer
              if (layers[i].isTouchingMouse()) {
                selectedLayer = i;
                dragEnabled = true;
                offsetX = mouse.X - layers[selectedLayer].x;
                offsetY = mouse.Y - layers[selectedLayer].y;

                document.getElementById("Opacity").value = layers[selectedLayer].opacity
                document.getElementById("Colour").value = layers[selectedLayer].colour
                document.getElementById("Dimensions").checked = layers[selectedLayer].showDimensions
                document.getElementById("Background").checked = layers[selectedLayer].background
                break;
              }
            }
          } else {
            if (!layers[selectedLayer].background) { //cannot move a background layer
              layers[selectedLayer].setPosition(mouse.X - offsetX, mouse.Y - offsetY); // Set the position of the layer to the mouse position (with offsets)
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
    if (mouse.mouseDown) {
      if (moveEnabled == false) {
        moveEnabled = true;
        firstX = mouse.X;
        firstY = mouse.Y;
      }
      if (moveEnabled) {
        for (i = 0; i < layers.length; i++) {
          layers[i].x = layers[i].x + (mouse.X - firstX);
          layers[i].y = layers[i].y + (mouse.Y - firstY);
        }
        firstX = mouse.X;
        firstY = mouse.Y;
      }
    } else {
      moveEnabled = false;
    }
  }
  if (mode == "Scale") {
    if (mouse.mouseDown) {
      if (scaleEnabled) {
        ctx.beginPath();
        ctx.moveTo(firstX, firstY);
        ctx.lineTo(mouse.X, mouse.Y);
        ctx.strokeStyle = "red";
        ctx.linewidth = 20;
        ctx.stroke();
        ctx.closePath();
      } else {
        scaleEnabled = true;
        firstX = mouse.X;
        firstY = mouse.Y;
      }
    } else if (scaleEnabled) {
      var input = window.prompt(Math.round(distance(firstX, firstY, mouse.X, mouse.Y)) + " pixels equates to how many units?")
      if (input == null || input == "") {
        alert("Fail, please put in a number, i.e. 4   (meaning that n pixels equate to 4 units)")
        scaleEnabled = false;
      } else {
        scale = distance(firstX, firstY, mouse.X, mouse.Y) / input
        scaleUnit = window.prompt("What units are these? i.e. Metres,Inches,CM")
        document.getElementById('priceConversionText').innerHTML = "£/" + scaleUnit + "²";
        scaleEnabled = false;
      }
    }
  }
  if (mode == "Measure") {
    if (scale != null) {
      if (mouse.mouseDown) {
        if (measureEnabled) {
          ctx.beginPath();
          ctx.moveTo(firstX, firstY);
          ctx.lineTo(mouse.X, mouse.Y);
          ctx.strokeStyle = "red";
          ctx.linewidth = 20;
          ctx.stroke();
          ctx.closePath();
        } else {
          measureEnabled = true;
          firstX = mouse.X;
          firstY = mouse.Y;
        }
      } else if (measureEnabled) {
        alert(Math.round(distance(firstX, firstY, mouse.X, mouse.Y) / scale) + " " + scaleUnit)
        measureEnabled = false;
      }
    } else {
      alert("Scale Not Set! Click scale to set!")
    }
  }
};

setInterval(update, 0)