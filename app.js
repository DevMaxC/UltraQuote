const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); 

var mode="Drag";
var scale=1;
var scaleUnit="Px";
//how many pixels per real unit

document.getElementById('priceConversionText').innerHTML ="£/"+scaleUnit;

var layers = [];
var selectedLayer= null;
var scaleEnabled=false;
var measureEnabled=false;
var dragEnabled=false;
var moveEnabled= false;
var resizeEnabled = false;
var setRotationEnabled= false;
var previousSize
var points=[];
var firstX;
var firstY;
var firstRotation;
//canvas.height = 1001;
//canvas.width = 1001;
zoom=1;

var keysdown=[];
mouseDown=false;
mouseX=0;
mouseY=0;

canvas.addEventListener('mousemove',function(event){
  mouseX=event.offsetX/zoom;
  mouseY=event.offsetY/zoom;
});
canvas.addEventListener('mousedown',function(event){
  mouseDown=true;
});
canvas.addEventListener('mouseup',function(event){
  mouseDown=false;
});
document.addEventListener('keydown',function(event){
  var count=0
  for (i=0;i<keysdown.length;i++){
    if (keysdown[i]==event.key){
      count++
      break;
    }
  }
  if (count==0){
    keysdown.push(event.key);
    console.log(keysdown);
  }
});
document.addEventListener('keyup',function(event){
  for (i=0;i<keysdown.length;i++){
    if (keysdown[i]==event.key){
      keysdown.splice(i,1);
    }
  }
  console.log(keysdown);
});
  
function changeZoom(multiplier) {
  ctx.scale(multiplier, multiplier)
  zoom*=multiplier
};

function changeMode(newMode){
  mode=newMode;
  if (newMode!="setRotation"){
    selectedLayer=null;
  }
  if (newMode=="Measure"||newMode=="Scale"){
    canvas.style.cursor="crosshair"
  }
  if (newMode=="Drag"){
    canvas.style.cursor="pointer"
  }
  if (newMode=="Move"){
    canvas.style.cursor="move"
  }
};

function askColor() {
    var ui = window.prompt("Choose a color to set.")
    if (isColor(ui)) {

    }
}


/// BEGIN   CODE BY GMAN FROM https://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5/43364730
function resizeCanvasToDisplaySize(canvas) {
  // look up the size the canvas is being displayed
  const realwidth = canvas.clientWidth;
  const realheight = canvas.clientHeight;

  // If it's resolution does not match change it
  if (canvas.width*zoom !== realwidth || canvas.height*zoom !== realheight) {
    canvas.width = realwidth;
    canvas.height = realheight;
    return true;
  }

  return false;
}

///END


//BEGIN   CODE BY DAN DAVIS FROM https://stackoverflow.com/questions/48484767/javascript-check-if-string-is-valid-css-color
function isColor(strColor) {
    var s = new Option().style;
    s.color = strColor;
    return s.color == strColor;
}
//END


class Layer {
  constructor(obj, x = (canvas.width - obj.width) / 2, y = (canvas.height - obj.height) / 2, showDimensions = false, rotation = 0, colour = "Green", background = false){
    this.obj=obj;
    this.x=x;
    this.y=y;
    this.showDimensions=showDimensions;
    this.background=background;
    this.rotation=rotation;
    this.colour=colour;
  }
  draw(i){
    ctx.save();
    if (this.background) {
      //detected as a background
      ctx.translate((this.x*2+this.obj.width)/2,(this.y*2+this.obj.height)/2);
      ctx.rotate(this.rotation* Math.PI / 180);
      ctx.drawImage(this.obj,-1*this.obj.width/2,-1*this.obj.height/2,this.obj.width,this.obj.height);
    }
    else if (Object.keys(this.obj).length === 2) {
      //detected as a rect
      ctx.fillStyle=this.colour;
      ctx.fillRect(this.x,this.y,this.obj.width,this.obj.height);
    }
    else {
      //detected as a image
      ctx.drawImage(this.obj, this.x, this.y, this.obj.width, this.obj.height);
      }
    if (selectedLayer == i && !this.background) {
      //draw box around selected object
      ctx.beginPath();
      ctx.lineWidth =3;
      ctx.rect(this.x, this.y, this.obj.width, this.obj.height);
      ctx.strokeStyle="Red"
      ctx.stroke();
    }
    if (this.showDimensions) {
      ctx.font = (this.obj.width / 12 + "px sans-serif")
      ctx.fillStyle = "Black"
      ctx.textAlign = "center";
      ctx.fillText((this.obj.width / scale).toFixed(2) + " x " + (this.obj.height / scale).toFixed(2) + " " + scaleUnit, (this.obj.width + 2 * this.x) / 2, (this.obj.height + 2 * this.y) / 2)
    }
    ctx.restore()
  }

}

function toggleDimensions(layerNumber){
  console.log(layerNumber)
  layers[layerNumber].showDimensions=!layers[layerNumber].showDimensions
};

function toggleBackground(layerNumber){
  layers[layerNumber].background=!layers[layerNumber].background
  dragEnabled=null;
};

function layerRemove(index) {
  if (index!=null){
    layers.splice(index, 1)
  }
  selectedLayer=null;
};

function deselect(){
  selectedLayer=null;
};

function collide(sx,sy,dx,dy,x,y){
  //used to detect if a mouse is inside a square
  //sx/sy is the origin x/y of square, dx / dy is the size
  //x/y is mouse position
  return (x>sx && y>sy && x<sx+dx && y<sy+dy);
};

function distance(x1,y1,x2,y2){
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
};

function upload(){
  var reader = new FileReader();
  img=new Image();
  reader.onload = function(e){
    img.src = e.target.result;
  };
  reader.readAsDataURL(document.getElementById("inputFile").files[0]);
  document.getElementById("inputFile").value = "";
  layers.push(new Layer(img))
};

function changeLayer(diff){
  if (selectedLayer+diff>=0&&selectedLayer+diff<layers.length){
    var layer=layers[selectedLayer];
    layers.splice(selectedLayer,1);
    layers.splice(selectedLayer+diff,0,layer);
    selectedLayer=selectedLayer+diff
  }
};

function newRect(height=100,width=100){
  if (scaleUnit[0]=="M"){
    width=4*scale
  }
  if (scaleUnit=="CM"){
    width=400*scale
  }
  obj={height:height,width:width}
  layers.push(new Layer(obj));
};

function calculateTotalGrassArea(){
  var totalArea = 0
  for (var i = 0; i <layers.length;i++){
    if (layers[i].type =="rect")totalArea+=layers[i].obj.width*layers[i].obj.height
  }
  return Math.round(totalArea)
}

function update(){
  ctx.strokeStyle="Black";
  document.getElementById('totalArea').innerHTML=calculateTotalGrassArea()+" "+scaleUnit+"²"
  document.getElementById('indicator').innerHTML =zoom*100 + "% ";
  ctx.fillStyle ="#323232";
  ctx.fillRect(0,0,canvas.width/zoom,canvas.height/zoom);
  ctx.fill();
  resizeCanvasToDisplaySize(canvas)

  //draw
  for (i=0;i<layers.length;i++){
      layers[i].draw(i)
  }

  if (mode=="Drag"){
    if (dragEnabled==false&&selectedLayer!=null){
      //Drawing and checking of the resize Dots
      ctx.strokeStyle = "black";
      ctx.fillStyle = "red";
      ctx.lineWidth = "7"
      for (i = 0; i < 4; i++) {
        ctx.beginPath();
        if (i == 0&&!layers[selectedLayer].background) {
          //left
          ctx.arc(layers[selectedLayer].x, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, 10, 0, 2 * Math.PI);
          if (distance(layers[selectedLayer].x, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, mouseX, mouseY) < 10&&resizeEnabled==null) {
            if (mouseDown) {
              resizeEnabled="left"
              firstX=mouseX
              previousSize=layers[selectedLayer].obj.width
            }
          }
        }
        else if (i == 1&&!layers[selectedLayer].background) {
          //right
          ctx.arc(layers[selectedLayer].x + layers[selectedLayer].obj.width, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, 10, 0, 2 * Math.PI);
          if (distance(layers[selectedLayer].x + layers[selectedLayer].obj.width, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, mouseX, mouseY) < 10&&resizeEnabled==null) {
            if (mouseDown) {
              resizeEnabled="right"
              firstX=mouseX
              previousSize=layers[selectedLayer].obj.width
            }
          }
        }
        else if (i == 2&&!layers[selectedLayer].background) {
          //up
          ctx.arc((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y, 10, 0, 2 * Math.PI);
          if (distance((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y, mouseX, mouseY) < 10&&resizeEnabled==null) {
            if (mouseDown) {
              resizeEnabled="up"
              firstY=mouseY
              previousSize=layers[selectedLayer].obj.height
            }
          }
        }
        else if (i == 3&&!layers[selectedLayer].background) {
          //down
          ctx.arc((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y + layers[selectedLayer].obj.height, 10, 0, 2 * Math.PI);
          if (distance((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y + layers[selectedLayer].obj.height, mouseX, mouseY) < 10&&resizeEnabled==null) {
            if (mouseDown) {
              resizeEnabled="down"
              firstY=mouseY
              previousSize=layers[selectedLayer].obj.height
            }
          }
        }
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      }
    }
    if (resizeEnabled!=null){
      if (mouseDown){
        if (resizeEnabled=="left"){
          layers[selectedLayer].obj.width=previousSize+firstX-mouseX
          layers[selectedLayer].x=mouseX
        }
        if (resizeEnabled=="right"){
          layers[selectedLayer].obj.width=previousSize-firstX+mouseX
        }
        if (resizeEnabled=="up"){
          layers[selectedLayer].obj.height=previousSize+firstY-mouseY
          layers[selectedLayer].y=mouseY
        }
        if (resizeEnabled=="down"){
          layers[selectedLayer].obj.height=previousSize-firstY+mouseY
        }
      }
      else{
        resizeEnabled=null
        firstX=null
        firstY=null
      }
    }
    else{
      if (mouseDown){
        if (selectedLayer==null){
          for(var i=0;i<layers.length;i++){
            if (collide(layers[i].x,layers[i].y,layers[i].obj.width, layers[i].obj.height,mouseX,mouseY)){
              selectedLayer=i;
            }
          }
        }
        else{
          if (dragEnabled==false){
            if (collide(layers[selectedLayer].x,layers[selectedLayer].y,layers[selectedLayer].obj.width, layers[selectedLayer].obj.height,mouseX,mouseY)){
              dragEnabled=true;
              offsetX=mouseX-layers[selectedLayer].x;
              offsetY=mouseY-layers[selectedLayer].y;
            }
            else{
              selectedLayer=null;
            }
            for(var i=layers.length-1;i>-1;i--){
              if (collide(layers[i].x,layers[i].y,layers[i].obj.width, layers[i].obj.height,mouseX,mouseY)){
                selectedLayer=i;
                dragEnabled=true;
                offsetX=mouseX-layers[selectedLayer].x;
                offsetY=mouseY-layers[selectedLayer].y;
                break;
              }
            }
          }
          else{
            if(!layers[selectedLayer].background){
              layers[selectedLayer].x=mouseX-offsetX;
              layers[selectedLayer].y=mouseY-offsetY;
            }
          }
        }
      }
      else{
        dragEnabled=false;
      }
    }
  }
  if (mode=="Move"){
    if (mouseDown){
      if (moveEnabled==false){
        moveEnabled=true;
        firstX=mouseX;
        firstY=mouseY;
      }
      if (moveEnabled){
        for (i=0;i<layers.length;i++){
          layers[i].x=layers[i].x+(mouseX-firstX);
          layers[i].y=layers[i].y+(mouseY-firstY);
        }
        firstX=mouseX;
        firstY=mouseY;
      }
    }else{
      moveEnabled=false;
    }
  }
  if (mode=="Scale"){
    if (mouseDown){
      if (scaleEnabled){
        ctx.beginPath();
        ctx.moveTo(firstX,firstY);
        ctx.lineTo(mouseX,mouseY);
        ctx.strokeStyle="red";
        ctx.linewidth=20;
        ctx.stroke();
        ctx.closePath();
      }else{
        scaleEnabled=true;
        firstX=mouseX;
        firstY=mouseY;
      }
    }
    else if (scaleEnabled){
      var input = window.prompt(Math.round(distance(firstX, firstY,mouseX,mouseY)) + " pixels equates to how many units?")
      if (input == null||input==""){
        alert("Fail, please put in a number, i.e. 4   (meaning that n pixels equate to 4 units)")
        scaleEnabled=false;
      }
      else{
        scale=distance(firstX, firstY,mouseX,mouseY)/input
        scaleUnit=window.prompt("What units are these? i.e. Metres,Inches,CM")
        document.getElementById('priceConversionText').innerHTML ="£/"+scaleUnit;
        scaleEnabled=false;
      }
    }
  }
  if (mode=="Measure"){
    if (scale!=null){
      if (mouseDown){
        if (measureEnabled){
          ctx.beginPath();
          ctx.moveTo(firstX,firstY);
          ctx.lineTo(mouseX,mouseY);
          ctx.strokeStyle="red";
          ctx.linewidth=20;
          ctx.stroke();
          ctx.closePath();
        }else{
          measureEnabled=true;
          firstX=mouseX;
          firstY=mouseY;
        }
      }
      else if (measureEnabled){
        alert(Math.round(distance(firstX, firstY,mouseX,mouseY)/scale)+" "+scaleUnit)
        measureEnabled=false;
      }
    }
    else{
      alert("Scale Not Set! Click scale to set!")
    }
  }
  if (mode=="setRotation"){
    if (layers[selectedLayer].background){
      if (mouseDown){
        if(setRotationEnabled){
          layers[selectedLayer].rotation=firstRotation+(mouseX-firstX)*360/canvas.width
          ctx.beginPath();
          ctx.moveTo(firstX,firstY);
          ctx.lineTo(mouseX,firstY);
          ctx.strokeStyle="red";
          ctx.linewidth=20;
          ctx.stroke();
          ctx.closePath();
        }
      }
      else{
        setRotationEnabled=true
        firstRotation=layers[selectedLayer].rotation
        firstX=mouseX
        firstY=mouseY
      }
    }
  }
};
setInterval(update,0)