const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); 

var mode="Drag";
var scale=1;
var scaleUnit="Px";
//how many pixels per real unit

document.getElementById('priceConversionText').innerHTML ="£/"+scaleUnit+"²";

var layers = [];
var selectedLayer= null;
var scaleEnabled=false;
var measureEnabled=false;
var dragEnabled=false;
var moveEnabled= false;
var resizeEnabled = false;
var setRotationEnabled= false;
var previousSize
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
  }
});
document.addEventListener('keyup',function(event){
  for (i=0;i<keysdown.length;i++){
    if (keysdown[i]==event.key){
      keysdown.splice(i,1);
    }
  }
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

/// BEGIN   CODE ADAPTED FROM https://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5/43364730 BY GMAN
function resizeCanvasToDisplaySize(canvas) {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  // If it's resolution does not match change it
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.scale(zoom,zoom)
    return true;
  }

  return false;
}
///END

function binToStr(binText) {
  bintext.split(" ")
  var newText=""
  for (i=0; i<binText.length; i++) {
    newText+=chr(bintext[i])
  }

}

function save(){
  savetext=""
  for (i=0;i<layers.length;i++){
    savetext+="@"; //adds a seperator to save text so that layers can be distinguished and seperated
    savetext+=layers[i].toText() //gets the text version of the layer and adds it to the save text
  }
  return savetext;
}

function load(savetext){
  selectedLayer=null;
  layers=[] //removes all layers before the load.

  //splits the combined string into individual layers in string format

  var loadtext=savetext.split("@");
  loadtext.shift(); // removes the first result since currently this isnt being used for anything, this could be used for non layer data, i.e. selectedLayer, but this seems unnececary and complicated


  for (i=0;i<loadtext.length;i++){
    var properties=loadtext[i].split(" ")

    //turning each property back into the data type it should be

    properties[1]=Number(properties[1])//x
    properties[2]=Number(properties[2])//y
    properties[3]=(properties[3]==true)//showDimensions
    properties[4]=(properties[4]==true)//background
    properties[5]=Number(properties[5])//rotation
    properties[6]=Number(properties[6])//colour
    properties[8]=Number(properties[8])//width
    properties[9]=Number(properties[9])//height

    // recreating each layer and adding it back into the array of layers
    if (properties[0]=="Rect"){
      layers.push(new Layer({width:properties[8],height:properties[9]},properties[0],x=properties[1],y=properties[2],showDimensions=properties[3],rotation=properties[5],opacity=properties[6],colour=properties[7],background=properties[4]))
    }else if (properties[0]=="Image"){
      var img=new Image(); //constructs an image type and sets the individual properties.
      img.src=properties[10] 
      img.width=properties[8]
      img.height=properties[9]
      layers.push(new Layer(img,properties[0],x=properties[1],y=properties[2],showDimensions=properties[3],rotation=properties[5],opacity=properties[6],color=properties[7],background=properties[4]))
    }
  }
}

function loadFile(){

}

class Component {
  constructor(name,locatorId,elementId,label){
    this.name=name; //Name of the component
    this.locatorId = locatorId; //Locator of where it should be put
    this.elementId = elementId; //Id which will be put into the element
    this.label = label //Label which will be displayed to the user
    this.hidden=true; //tracks if its hidden
  }

  hide(){
    if (!this.hidden){
      this.hidden=true;
      document.getElementById(this.elementId).remove();
    }
  }

  isHidden= () => this.hidden;
}

class Slider extends Component {
  constructor(name,locatorId,elementId,label,min,max,step,value){
    super(name,locatorId,elementId,label)

    this.min = min
    this.max = max
    this.step = step
    this.value = value
  }

  show(){
    this.hidden = false;
    var sliderElement = document.createElement("Input")
    var newElement = document.createElement("label")

    sliderElement.type="range"
    sliderElement.max=this.max
    sliderElement.min=this.min
    sliderElement.step=this.step

    newElement.name=this.name
    newElement.id=this.elementId
    newElement.innerHTML = this.label
    newElement.appendChild(sliderElement)

    document.getElementById(this.locatorId).appendChild(newElement)
  }

  value = () => this.value
}

class Button extends Component {
  constructor(name,locatorId,elementId,label,onclick){
    super(name,locatorId,elementId,label)
    this.onclick=onclick
  }
  show(){
    this.hidden = false;
    var newElement = document.createElement("button")

    newElement.innerHTML = this.label
    newElement.id = this.elementId
    newElement.addEventListener("click", this.onclick());

    document.getElementById(this.locatorId).appendChild(newElement)
  }
}

class Layer {
  constructor(obj,type, x = (canvas.width - obj.width) / 2, y = (canvas.height - obj.height) / 2, showDimensions = false, rotation = 0,opacity = 100, colour = "#008000", background = false){
    this.obj=obj;
    this.type=type;
    this.x=x;
    this.y=y;
    this.showDimensions=showDimensions;
    this.background=background;
    this.rotation=rotation;
    this.opacity=opacity;
    this.colour=colour;
  }
  draw(i){
    ctx.save();
    ctx.globalAlpha=this.opacity/100;
    if (this.background==true) {
      //detected as a background
      ctx.translate((this.x*2+this.obj.width)/2,(this.y*2+this.obj.height)/2); //translates to the center of the image so that in rotation we are rotating around the center rather than from 0,0
      ctx.rotate(this.rotation* Math.PI / 180); //applies the rotation
      ctx.drawImage(this.obj,-1*this.obj.width/2,-1*this.obj.height/2,this.obj.width,this.obj.height); //draws the image in the correct position, shifted based on where the canvas translated to
    }
    else if (this.type =="Rect") {
      //detected as a rect
      ctx.fillStyle=this.colour;
      ctx.fillRect(this.x,this.y,this.obj.width,this.obj.height);
    }
    else if (this.type=="Image"){
      //detected as a image
      ctx.drawImage(this.obj, this.x, this.y, this.obj.width, this.obj.height);
      }
    if (selectedLayer == i && !this.background) {
      //draw box around selected object
      ctx.beginPath();
      ctx.globalAlpha=1;
      ctx.linejoin='miter';
      ctx.lineWidth =3/zoom;
      ctx.rect(this.x, this.y, this.obj.width, this.obj.height);
      ctx.strokeStyle="White"
      ctx.stroke();
    }
    if (this.showDimensions) {
      ctx.font = (this.obj.width / 12 + "px sans-serif") //sets the font size to an appropriate size to fit in the box horizontally.
      ctx.fillStyle = "Black";
      ctx.textAlign = "center";
      ctx.fillText((this.obj.width / scale).toFixed(2) + " x " + (this.obj.height / scale).toFixed(2) + " " + scaleUnit, (this.obj.width + 2 * this.x) / 2, (this.obj.height + 2 * this.y) / 2) //only shows the size to 2 decimat places
    }
    ctx.restore()
  }

  area(){
    return this.obj.width/scale * this.obj.height/scale //calculates area of perimiter
  }

  perimiter(){
    return this.obj.width*2 + this.obj.height*2 //calculates perimiter of layer
  }

  isTouchingMouse(){
    return (mouseX>this.x&&mouseY>this.y&&mouseX<this.x+this.obj.width&&mouseY<this.y+this.obj.height)
  }

  toText(){
    return this.type+" "+this.x+" "+this.y+" "+this.showDimensions+" "+this.background+" "+this.rotation+" "+this.opacity+" "+this.colour+" "+this.obj.width+" "+this.obj.height+" "+this.obj.src //turns the properties of the layer to a string so that it can be saved
  }

  setPostition(x,y){
    if (!isNaN(x) || !isNaN(y)){
      this.x=x
      this.y=y
    }
  }
};

function layerRemove(index) {
  //removes a layer
  if (index!=null){
    layers.splice(index, 1)
  }
  selectedLayer=null;
};

function distance(x1,y1,x2,y2){
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) //uses multiplication instead of math.pow as it is faster according to https://i.stack.imgur.com/AjRF6.jpg
};

function upload(){
  var reader = new FileReader(); //creates a file reader object
  img=new Image(); //creates an image object
  reader.onload = function(e){
    img.src = e.target.result; //creates an src
  };
  reader.readAsDataURL(document.getElementById("inputFile").files[0]);
  document.getElementById("inputFile").value = "";
  img.onload = function(e) {
    layers.push(new Layer(img,"Image"))
    selectedLayer=layers.length-1;
  }
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
  //sets the width of the game to 4 Metres as is the standard roll width
  if (scaleUnit[0]=="M"){
    width=4*scale
  }
  if (scaleUnit=="CM"){
    width=400*scale
  }
  //creates an object containing the width and height of the rectangle, this is similar to the image object so we can reuse lots of code.
  obj={height:height,width:width}
  layers.push(new Layer(obj,"Rect"));
  selectedLayer=layers.length-1;//sets the selected layer to the layer that has just been created. so the new rectangle is selected.
};

function calculateTotalGrassArea(){
  var totalArea = 0
  for (var i = 0; i <layers.length;i++){
    if (layers[i].type == "Rect"){totalArea+=layers[i].area()} // finds all the rectangles (ignores Images), gets their areas and adds them to a total.
  }
  return Math.round(totalArea) // returns the total area, which is rounded to the nearest number, so that it isnt influenced by precise decimal sizes of rectangles.
};

function duplicateLayer(targetLayer){
  if (targetLayer.type=="Rect"){
    layers.push(new Layer({width:targetLayer.obj.width, height:targetLayer.obj.height},targetLayer.type,targetLayer.x,targetLayer.y,targetLayer.showDimensions,targetLayer.rotation,targetLayer.opacity,targetLayer.colour,targetLayer.background))
  }
  else if (targetLayer.type=="Image"){
    var img = new Image()
    img.width=targetLayer.obj.width
    img.height=targetLayer.obj.height
    img.src=targetLayer.obj.src
    layers.push(new Layer(img,targetLayer.type,targetLayer.x,targetLayer.y,targetLayer.showDimensions,targetLayer.rotation,targetLayer.opacity,targetLayer.colour,targetLayer.background))
  }
};

function update(){ 
  document.getElementById('totalArea').innerHTML=calculateTotalGrassArea()+" "+scaleUnit+"²"
  document.getElementById('indicator').innerHTML =zoom*100 + "% ";
  document.getElementById("priceConversionTotal").innerHTML="Total = £"+(calculateTotalGrassArea()*Number(document.getElementById("priceConversion").value));

  ctx.strokeStyle="Black";
  ctx.fillStyle ="#323232";
  resizeCanvasToDisplaySize(canvas)
  ctx.fillRect(0,0,canvas.width/zoom,canvas.height/zoom);
  ctx.fill();

  //draw
  for (i=0;i<layers.length;i++){
      layers[i].draw(i)
  }

  if (mode=="Drag"){
    if (dragEnabled==false&&selectedLayer!=null){
      //Drawing and checking if the resize Dots are being clicked by the mouse
      ctx.strokeStyle = "black";
      ctx.fillStyle = "white";
      ctx.lineWidth = 7/zoom
      for (i = 0; i < 4; i++) {          //since we want 4 dots, loop 4 times
        if (!layers[selectedLayer].background){ //we dont want to show the dots when it is a background as they are considered locked and should not be resized
          ctx.beginPath();
          if (i == 0) {
            //left
            //draw left dot in correct location
            ctx.arc(layers[selectedLayer].x, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, 10/zoom, 0, 2 * Math.PI);
            //check if its being clicked
            if (distance(layers[selectedLayer].x, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, mouseX, mouseY) < 10/zoom&&resizeEnabled==null) {
              if (mouseDown) {
                resizeEnabled="left"//it has been clicked so store this value for later on
                firstX=mouseX//store this value so we know the original position of the mouse and can use this to calculate what the new width should be later.
                previousSize=layers[selectedLayer].obj.width//store 
              }
            }
          }
          else if (i == 1) {
            //right
            ctx.arc(layers[selectedLayer].x + layers[selectedLayer].obj.width, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, 10/zoom, 0, 2 * Math.PI);
            if (distance(layers[selectedLayer].x + layers[selectedLayer].obj.width, (2 * layers[selectedLayer].y + layers[selectedLayer].obj.height) / 2, mouseX, mouseY) < 10/zoom&&resizeEnabled==null) {
              if (mouseDown) {
                resizeEnabled="right"
                firstX=mouseX
                previousSize=layers[selectedLayer].obj.width
              }
            }
          }
          else if (i == 2) {
            //up
            ctx.arc((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y, 10/zoom, 0, 2 * Math.PI);
            if (distance((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y, mouseX, mouseY) < 10/zoom&&resizeEnabled==null) {
              if (mouseDown) {
                resizeEnabled="up"
                firstY=mouseY
                previousSize=layers[selectedLayer].obj.height
              }
            }
          }
          else if (i == 3) {
            //down
            ctx.arc((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y + layers[selectedLayer].obj.height, 10/zoom, 0, 2 * Math.PI);
            if (distance((2 * layers[selectedLayer].x + layers[selectedLayer].obj.width) / 2, layers[selectedLayer].y + layers[selectedLayer].obj.height, mouseX, mouseY) < 10/zoom&&resizeEnabled==null) {
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
    }
    if (resizeEnabled!=null){ //since there has been a resize change detected then start with the resize process
      if (mouseDown){
        if (resizeEnabled=="left"){ // apply left resize
          layers[selectedLayer].obj.width=previousSize+firstX-mouseX //the new width is the old width plus the difference in mouse position, i.e. if the mouse has moved 20 px to the left then the shape will become 20 px wider
          if (layers[selectedLayer].obj.width<0){// if they are trying to resize smaller than zero
            layers[selectedLayer].obj.width=0}//limit it to zero
          else{
            layers[selectedLayer].x=mouseX}//otherwise set the new x to the old x, this is because canvas works from the top left being 0,0  just increasing the width without moving it left it doesnt produce the desired effect
        }
        if (resizeEnabled=="right"){
          layers[selectedLayer].obj.width=previousSize-firstX+mouseX
        }
        if (resizeEnabled=="up"){
          layers[selectedLayer].obj.height=previousSize+firstY-mouseY
          if (layers[selectedLayer].obj.height<0){
            layers[selectedLayer].obj.height=0}
          else{
            layers[selectedLayer].y=mouseY}
        }
        if (resizeEnabled=="down"){
          layers[selectedLayer].obj.height=previousSize-firstY+mouseY
        }
        if (layers[selectedLayer].obj.height<1){layers[selectedLayer].obj.height=1}
        if (layers[selectedLayer].obj.width<1){layers[selectedLayer].obj.width=1}
      }
      else{
        resizeEnabled=null
        firstX=null
        firstY=null
      }
    }
    else{
      if (mouseDown){//main series of moving the selected item by mouse
        if (selectedLayer==null){
          for(var i=0;i<layers.length;i++){
            if (layers[i].isTouchingMouse()){ //if the mouse is down and the mouse is over the layer, then
              selectedLayer=i;
              document.getElementById("Opacity").value=layers[selectedLayer].opacity
              document.getElementById("Colour").value=layers[selectedLayer].colour
              document.getElementById("Dimensions").checked=layers[selectedLayer].showDimensions
              document.getElementById("Background").checked=layers[selectedLayer].background
            }
          }
        }
        else{
          if (dragEnabled==false){
            if (layers[selectedLayer].isTouchingMouse()){
              dragEnabled=true;
              offsetX=mouseX-layers[selectedLayer].x;
              offsetY=mouseY-layers[selectedLayer].y;
            }
            else{
              selectedLayer=null;
            }
            for(var i=layers.length-1;i>-1;i--){
              if (layers[i].isTouchingMouse()){
                selectedLayer=i;
                document.getElementById("Opacity").value=layers[selectedLayer].opacity
                document.getElementById("Colour").value=layers[selectedLayer].colour
                document.getElementById("Dimensions").checked=layers[selectedLayer].showDimensions
                document.getElementById("Background").checked=layers[selectedLayer].background
                dragEnabled=true;
                offsetX=mouseX-layers[selectedLayer].x;
                offsetY=mouseY-layers[selectedLayer].y;
                break;
              }
            }
          }
          else{
            if(!layers[selectedLayer].background){
              layers[selectedLayer].setPostition(mouseX-offsetX,mouseY-offsetY);
            }
          }
        }
      }
      else{
        dragEnabled=false;
      }
    }
    if (selectedLayer!=null){
      document.getElementById("layerPosBox").hidden=false;
    }else{
      document.getElementById("layerPosBox").hidden=true;
    }
    if (selectedLayer!=null && layers[selectedLayer].type=="Rect"){
      //things which should show on bar when it is operating on a rectangle
      document.getElementById("opacityBox").hidden=false;
      document.getElementById("colourSetter").hidden=false;
      document.getElementById("dimensionsBox").hidden=false;
      layers[selectedLayer].opacity=document.getElementById("Opacity").value;
      layers[selectedLayer].colour=document.getElementById("Colour").value;
      layers[selectedLayer].showDimensions=document.getElementById("Dimensions").checked;
    }
    else{
      document.getElementById("opacityBox").hidden=true;
      document.getElementById("colourSetter").hidden=true;
      document.getElementById("dimensionsBox").hidden=true;
    }
    if (selectedLayer!=null && layers[selectedLayer].type=="Image"){
      //things which should show on bar when it is operating on an image
      document.getElementById("backgroundOptionsBox").hidden=false
      layers[selectedLayer].background=(document.getElementById("Background").checked)

      if (layers[selectedLayer].background){
        document.getElementById("rotationBox").hidden=false
        layers[selectedLayer].rotation=Number(document.getElementById("Rotation").value)
      }else{
        document.getElementById("rotationBox").hidden=true
      }
    }
    else{
      document.getElementById("backgroundOptionsBox").hidden=true
      document.getElementById("rotationBox").hidden=true
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
        document.getElementById('priceConversionText').innerHTML ="£/"+scaleUnit+"²";
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
};
setInterval(update,0)