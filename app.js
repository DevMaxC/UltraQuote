const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); 

var mode="Drag";
var scale=1;
//how many pixels per real unit

var layers = [];
var selectedLayer= null;
var scaleEnabled=false;
var dragEnabled=false;
var moveEnabled= false;
var resizeEnabled = false;
var previousSize
var points=[];
var firstX;
var firstY;
canvas.height = 1001;
canvas.width = 1001;
zoom=1;

var keysdown;
mouseDown=false;
mouseX=0;
mouseY=0;

canvas.addEventListener('mousemove',function(event){
  mouseX=event.offsetX;
  mouseY=event.offsetY;
});
canvas.addEventListener('mousedown',function(event){
  mouseDown=true;
});
canvas.addEventListener('mouseup',function(event){
  mouseDown=false;
});
document.addEventListener('keydown',function(event){
  keysdown=event.key;
  console.log(keysdown);
});
  
function changeZoom(multiplier) {
  zoom=zoom*multiplier
};

function changeMode(newMode){
mode=newMode;
selectedLayer=null;
};

function layerAdd(type,obj,x=0,y=0,beingDragged=false,dragOffsetX=0,dragOffsetY=0,visible=true){
  layer={
    type:type,
    name:name,
    x:x,
    y:y,
    obj:obj,
    beingDragged:beingDragged,
    dragOffsetX:dragOffsetX,
    dragOffsetY:dragOffsetY,
    visible:visible
  }
  layers.push(layer)
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
  document.getElementById("inputFile").value="";
  layerAdd("Image",img);
};

function changeLayer(diff){
  if (selectedLayer+diff>=0&&selectedLayer+diff<layers.length){
    var layer=layers[selectedLayer];
    layers.splice(selectedLayer,1);
    layers.splice(selectedLayer+diff,0,layer);
    selectedLayer=selectedLayer+diff
  }
};

function drawImage(i){
  ctx.drawImage(layers[i].obj,layers[i].x,layers[i].y,layers[i].obj.width,layers[i].obj.height);
  if (selectedLayer==i){
    ctx.beginPath();
    ctx.lineWidth =3;
    ctx.rect(layers[i].x,layers[i].y,layers[i].obj.width,layers[i].obj.height);
    ctx.strokeStyle="Red"
    ctx.stroke();
  }
};

function drawShape(points){
  ctx.beginPath();
  ctx.moveTo(points[0].x,points[0].y);
  for (i=1; i<points.length; i++){
    ctx.lineTo(points[i].x,points[i].y)
  }
  ctx.lineTo(points[0].x,points[0].y);
  ctx.stroke();
  ctx.closePath();
};

function update(){
  ctx.strokeStyle="Black";
  drawShape([{x:0, y:0},{x:100, y:0},{x:100, y:100},{x:0,y:100}]);
  document.getElementById('indicator').innerHTML = mode + " " + zoom*100 + "% " + selectedLayer;
  ctx.fillStyle ="#323232";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fill();

  //draw
  for (i=0;i<layers.length;i++){
      if (layers[i].type=="Image"){
        drawImage(i);
      }
  }

  if (mode=="Drag"){
    if (dragEnabled==false&&selectedLayer!=null&&resizeEnabled==null){
      ctx.strokeStyle = "black";
      ctx.fillStyle = "red";
      ctx.lineWidth = "7"
      for (i = 0; i < 4; i++) {
        ctx.beginPath();
        if (i == 0) {
          //left
          ctx.arc(layers[selectedLayer].x, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, 10, 0, 2 * Math.PI);
          if (distance(layers[selectedLayer].x, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, mouseX, mouseY) < 10) {
            if (mouseDown) {
              console.log("left")
              resizeEnabled="left"
              firstX=mouseX
              previousSize=layers[selectedLayer].obj.width
            }
          }
        }
        else if (i == 1) {
          //right
          ctx.arc(layers[selectedLayer].x + layers[selectedLayer].obj.width, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, 10, 0, 2 * Math.PI);
          if (distance(layers[selectedLayer].x + layers[selectedLayer].obj.width, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, mouseX, mouseY) < 10) {
            if (mouseDown) {
              console.log("right")
              resizeEnabled="right"
              firstX=mouseX
              previousSize=layers[selectedLayer].obj.width
            }
          }
        }
        else if (i == 2) {
          //up
          ctx.arc((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y, 10, 0, 2 * Math.PI);
          if (distance((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y, mouseX, mouseY) < 10) {
            if (mouseDown) {
              console.log("up")
              resizeEnabled="up"
              firstY=mouseY
              previousSize=layers[selectedLayer].obj.height
            }
          }
        }
        else if (i == 3) {
          //down
          ctx.arc((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y + layers[selectedLayer].obj.height, 10, 0, 2 * Math.PI);
          if (distance((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y + layers[selectedLayer].obj.height, mouseX, mouseY) < 10) {
            if (mouseDown) {
              console.log("down")
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
            layers[selectedLayer].x=mouseX-offsetX;
            layers[selectedLayer].y=mouseY-offsetY;
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
          scaleEnabled=false;
        }
      }
    }
  keysdown="";
};
setInterval(update,0)