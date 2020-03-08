function save(layerList) {
    savetext = ""
    for (i = 0; i < layerList.length; i++) {
        savetext += "@"; //adds a seperator to save text so that layers can be distinguished and seperated
        savetext += layerList[i].toText() //gets the text version of the layer and adds it to the save text
    }
    var myBlob = new Blob([savetext])
    saveData(myBlob,"myFile.uq")
}

function saveData(blob, fileName) {
    var a = document.createElement("a"); //creates new hyperlink element
    document.body.appendChild(a); //puts this element on the page
    a.style = "display:none"; //makes sure the user cant see it
    var link = window.URL.createObjectURL(blob); //creates a file url for the blob input
    a.download = fileName; //sets the download name to the filename
    a.href = link; //sets the href of the element to this file url
    a.click(); //clicks the element to start the download
}

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

function load(savetext) {

    //splits the combined string into individual layers in string format

    var loadtext = savetext.split("@");
    loadtext.shift(); // removes the first result since currently this isnt being used for anything, this could be used for non layer data, i.e. selectedLayer, but this seems unnececary and complicated


    for (i = 0; i < loadtext.length; i++) {
        var properties = loadtext[i].split(" ")

        //turning each property back into the data type it should be

        properties[1] = Number(properties[1]) //x
        properties[2] = Number(properties[2]) //y
        properties[3] = (properties[3] == true) //showDimensions
        properties[4] = (properties[4] == true) //background
        properties[5] = Number(properties[5]) //rotation
        properties[6] = Number(properties[6]) //colour
        properties[8] = Number(properties[8]) //width
        properties[9] = Number(properties[9]) //height

        // recreating each layer and adding it back into the array of layers
        if (properties[0] == "Rect") {
            layers.push(new Rectangle({
                width: properties[8],
                height: properties[9]
            }, properties[0], x = properties[1], y = properties[2], showDimensions = properties[3], rotation = properties[5], opacity = properties[6], colour = properties[7], background = properties[4]))
        } else if (properties[0] == "Image") {
            var img = new Image(); //constructs an image type and sets the individual properties.
            img.src = properties[10]
            img.width = properties[8]
            img.height = properties[9]
            layers.push(new myImage(img, properties[0], x = properties[1], y = properties[2], showDimensions = properties[3], rotation = properties[5], opacity = properties[6], color = properties[7], background = properties[4]))
        }
    }
}

function fullLoad(){
    var reader = new FileReader(); //creates a file reader object
    reader.onload = function (e) {
       load(e.target.result); //creates an src
    };
    layers=[]
    selectedLayer=null;
    reader.readAsText(document.getElementById("loadFile").files[0]);
    document.getElementById("loadFile").value = "";
}
