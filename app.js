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
})
canvas.addEventListener('mousedown',function(event){
  mouseDown=true;
})
canvas.addEventListener('mouseup',function(event){
  mouseDown=false;
})
document.addEventListener('keydown',function(event){
  keysdown=event.key;
  console.log(keysdown);
});
  
function changeZoom(multiplier) {
  zoom=zoom*multiplier
}

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
}

function collide(sx,sy,dx,dy,x,y){
  //used to detect if a mouse is inside a square
  //sx/sy is the origin x/y of square, dx / dy is the size
  //x/y is mouse position
  return (x>sx && y>sy && x<sx+dx && y<sy+dy);
};

function distance(x1,y1,x2,y2){
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
}

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

function drawImage(){
  ctx.drawImage(layers[i].obj,layers[i].x,layers[i].y,layers[i].obj.width,layers[i].obj.height);
  if (selectedLayer==i){
    ctx.beginPath();
    ctx.lineWidth =10;
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
}



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
		drawImage();
    }
}

if (mode=="Drag"){
    canvas.style.cursor = "hand"
    //if the mode is drag
    for (i=layers.length-1;i>=0;i--){
        //go through all the layers
		if (mouseDown){
			if (collide(layers[i].x,layers[i].y,layers[i].obj.width, layers[i].obj.height,mouseX,mouseY)){
				if (selectedLayer==null){
					//initiate a selection
					selectedLayer = i;
					//offsetX=mouseX-layers[i].x;
					//offsetY=mouseY-layers[i].y;
					//once we have found our clicked layer dont look for any more!
					break;
				}
			}else{
				selectedLayer=null;
			}
		}
	}
	if (dragEnabled==false&&selectedLayer!=null){
		dragEnabled=true;
		offsetX=mouseX-layers[selectedLayer].x;
		offsetY=mouseY-layers[selectedLayer].y;
	}
	else if(dragEnabled==true){
		layers[selectedLayer].x=mouseX-offsetX;
		layers[selectedLayer].y=mouseY-offsetY;
	}
	if (!mouseDown){
		dragEnabled=false;
        offsetX=null;
        offsetY=null;
		if (keysdown=="Delete"){
			layerRemove(selectedLayer);
		}
        if (keysdown=="ArrowDown"){
          layers[i].y+=1;
        }
        if (keysdown=="ArrowUp"){
          layers[i].y-=1;
        }
        if (keysdown=="ArrowLeft"){
          layers[i].x-=1;
        }
        if (keysdown=="ArrowRight"){
          layers[i].x+=1;
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
}

setInterval(update,0)