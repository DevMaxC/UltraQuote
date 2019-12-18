const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); 

var mode="Select";

var layers=[];
canvas.height = 1000;
canvas.width = 1000;
zoom=1;

clicked=false;
mouseX=0;
mouseY=0;

canvas.addEventListener('mousemove',function(event){
  mouseX=event.offsetX;
  mouseY=event.offsetY;
})
canvas.addEventListener('mousedown',function(event){
  clicked=true;
})
canvas.addEventListener('mouseup',function(event){
  clicked=false;
})
  
function changeZoom(multiplier) {
  zoom=zoom*multiplier
  for (i=0;i<layers.length;i++) {
    layers[i].x*zoom;
    layers[i].y*zoom;
  }
}

function changeMode(newMode){
mode=newMode
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

function collide(sx,sy,dx,dy,x,y){
  //used to detect if a mouse is inside a square
  //sx/sy is the origin x/y of square, dx / dy is the size
  //x/y is mouse position
  return (x>sx && y>sy && x<sx+dx && y<sy+dy);
}

function upload(){
  var reader = new FileReader();
  img=new Image();
  reader.onload = function(e){
    img.src = e.target.result;
  };
  reader.readAsDataURL(document.getElementById("inputFile").files[0]);
  layerAdd("Image",img);
};

function update(){

  document.getElementById('indicator').innerHTML = mode;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle ="black";
  ctx.fill();

  for (i=0;i<layers.length;i++){
    switch (layers[i].type){
      case "Image":
        if (layers[i].visible){
          ctx.drawImage(layers[i].obj,layers[i].x,layers[i].y,layers[i].obj.width,layers[i].obj.height);
        }
        if (mode=="Select" && layers[i].visible && !(layers[i].beingDragged) && clicked && collide(layers[i].x,layers[i].y,layers[i].obj.width, layers[i].obj.height,mouseX,mouseY)){
          //sees if the image is being Dragged
          layers[i].offsetX=mouseX - layers[i].x;
          layers[i].offsetY=mouseY - layers[i].y;
          layers[i].beingDragged=true;
        }
        if (layers[i].beingDragged){
          //performs the actions if the layer is being dragged
          if (layers[i].visible && clicked && mode=="Select"){
            layers[i].x=mouseX-layers[i].offsetX;
            layers[i].y=mouseY-layers[i].offsetY;
          }
          else{
            //if the layer is not being dragged or becomes invisible it is set to false
            layers[i].beingDragged=false;
          }
        }
        if (mode=="Move")
        break;
    }
  }

  

}

setInterval(update,1)