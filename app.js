const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); 

var layers=[]

function resize() {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth-155;
}

layerAdd=function(type,obj,x=155,y=0){
  layer={
    type:type,
    name:name,
    x:x,
    y:y,
    obj:obj
  }
  layers.push(layer)
}

function upload(){
  var reader = new FileReader();
  img=new Image(500,500);
  reader.onload = function(e){
    img.src = e.target.result;
  };
  reader.readAsDataURL(document.getElementById("inputFile").files[0]);
  layerAdd("Image",img)
};

function update(){
  for (i=0;i<layers.length;i++){
    switch (layers[i].type){
      case "Image":
        ctx.drawImage(layers[i].obj,layers[i].x,layers[i].y);
        break;
    }
  }
}

setInterval(update,1000)
window.addEventListener('resize', resize);

resize();