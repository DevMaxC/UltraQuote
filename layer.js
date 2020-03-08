class Layer {
    constructor(type, x = canvas.width/ 2, y = canvas.height / 2, showDimensions = false, rotation = 0, opacity = 100, colour = "#008000", background = false) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.showDimensions = showDimensions;
        this.background = background;
        this.rotation = rotation;
        this.opacity = opacity;
        this.colour = colour;
    }

    drawOuterBox() { //draws the outline for when the layer is selected
        ctx.save()
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 3 / zoom;
        ctx.rect(this.x, this.y, this.obj.width, this.obj.height);
        ctx.strokeStyle = "White"
        ctx.stroke();
        ctx.restore()
    }

    drawDots(){
        ctx.save()
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.lineWidth = 7 / zoom

        //code for drawing each dot on the layer, must be done individually (seperated by begin and end path), since otherwise it connects all the dots together, looking awful.
        ctx.beginPath();
        ctx.arc(this.x, (2 * this.y + this.obj.height) / 2, 10 / zoom, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.x + this.obj.width, (2 * this.y + this.obj.height) / 2, 10 / zoom, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc((2 * this.x + this.obj.width) / 2, this.y, 10 / zoom, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc((2 * this.x + this.obj.width) / 2, this.y + this.obj.height, 10 / zoom, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.stroke();
        ctx.fill();
        
        ctx.restore()
    }

    dotClicked(){ //checks if any of the layer's dots are clicked
        if(distance(this.x, (2 * this.y + this.obj.height) / 2, mouse.X, mouse.Y) < 10 / zoom){ //checks left dot
            return "left"
        }
        else if(distance(this.x + this.obj.width, (2 * this.y + this.obj.height) / 2, mouse.X, mouse.Y) < 10 / zoom){ //checks right dot
            return "right"
        }
        else if(distance((2 * this.x + this.obj.width) / 2, this.y, mouse.X, mouse.Y) < 10 / zoom){//checks top dot
            return "up"
        }
        else if(distance((2 * this.x + this.obj.width) / 2, this.y + this.obj.height, mouse.X, mouse.Y) < 10 / zoom){ //checks bottom dot
            return "down"
        }
        else {
            return null
        }
    }

    drawDimensions() { // shows the width and height of layer in real units, on top of the layer.
        ctx.save()
        ctx.font = (this.obj.width / 12 + "px sans-serif") //sets the font size to an appropriate size to fit in the box horizontally.
        ctx.fillStyle = "Black";
        ctx.textAlign = "center";
        ctx.fillText((this.obj.width / scale).toFixed(2) + " x " + (this.obj.height / scale).toFixed(2) + " " + scaleUnit, (this.obj.width + 2 * this.x) / 2, (this.obj.height + 2 * this.y) / 2)
        //only shows the size to 2 decimal places
        ctx.restore()
    }

    area() {
        return this.obj.width / scale * this.obj.height / scale //calculates area of layer
    }

    perimiter() {
        return this.obj.width * 2 + this.obj.height * 2 //calculates perimiter of layer
    }

    isTouchingMouse() {
        return (mouse.X > this.x && mouse.Y > this.y && mouse.X < this.x + this.obj.width && mouse.Y < this.y + this.obj.height)
    }

    toText() {
        //converts all layer attributes to string, used for saving
        return this.type + " " + this.x + " " + this.y + " " + this.showDimensions + " " + this.background + " " + this.rotation + " " + this.opacity + " " + this.colour + " " + this.obj.width + " " + this.obj.height + " " + this.obj.src
        //turns the properties of the layer to a string so that it can be saved
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setWidth(width) {
        if (width >= 0){
            this.obj.width = width;
        }
    }

    setHeight(height) {
        if (height >= 0){
            this.obj.height = height;
        }
    }
};

class myImage extends Layer { //image class which inherits from Layer class
    constructor(obj, type, x, y, showDimensions, rotation, opacity, colour, background) {
        super(type, x, y, showDimensions, rotation, opacity, colour, background)
        this.obj = obj
    }
    draw() {
        ctx.save()
        ctx.translate((this.x*2+this.obj.width)/2,(this.y*2+this.obj.height)/2); //translates to the center of the image so that in rotation we are rotating around the center rather than from 0,0
        ctx.rotate(this.rotation* Math.PI / 180); //applies the rotation
        ctx.drawImage(this.obj,-1*this.obj.width/2,-1*this.obj.height/2,this.obj.width,this.obj.height);
        ctx.restore()
    }
};

class Rectangle extends Layer { // rectangle class which inherits from Layer class
    constructor(obj, type, x, y, showDimensions, rotation, opacity, colour, background) {
        super(type, x, y, showDimensions, rotation, opacity, colour, background)
        this.obj = obj
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity / 100;
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.obj.width, this.obj.height);
        ctx.restore()
    }
};