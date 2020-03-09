class Component {
    constructor(name, locatorId, elementId, label) {
        this.name = name; //Name of the component
        this.locatorId = locatorId; //Locator of where it should be put
        this.elementId = elementId; //Id which will be put into the element
        this.label = label //Label which will be displayed to the user
        this.hidden = true; //tracks if its hidden
    }

    hide() {
        if (!this.hidden) {
            this.hidden = true;
            document.getElementById(this.elementId).remove();
        }
    }

    isHidden = () => this.hidden;
}

class Slider extends Component {
    constructor(name, locatorId, elementId, label, min, max, step) {
        super(name, locatorId, elementId, label)

        this.min = min
        this.max = max
        this.step = step
    }

    show() {
        this.hidden = false;
        var sliderElement = document.createElement("Input")
        var newElement = document.createElement("label")

        sliderElement.type = "range"
        sliderElement.max = this.max
        sliderElement.min = this.min
        sliderElement.step = this.step

        newElement.name = this.name
        newElement.id = this.elementId
        newElement.innerHTML = this.label
        newElement.appendChild(sliderElement)

        document.getElementById(this.locatorId).appendChild(newElement)
    }

    value = () =>  document.getElementById(this.locatorId).value
}

class Button extends Component {
    constructor(name, locatorId, elementId, label, onclick) {
        super(name, locatorId, elementId, label)
        this.onclick = onclick
    }
    show() {
        this.hidden = false;
        var newElement = document.createElement("button")

        newElement.innerHTML = this.label
        newElement.id = this.elementId
        newElement.addEventListener("click", this.onclick);

        document.getElementById(this.locatorId).appendChild(newElement)
    }
}

class numberInput extends Component{
    constructor(name, locatorId, elementId, label) {
        super(name, locatorId, elementId, label)
    }

    show() {
        this.hidden = false;
        var inputElement = document.createElement("Input")
        var newElement = document.createElement("label")

        inputElement.type = "number"

        newElement.name = this.name
        newElement.id = this.elementId
        newElement.innerHTML = this.label
        newElement.appendChild(sliderElement)

        document.getElementById(this.locatorId).appendChild(newElement)
    }

    value = () => document.getElementById(this.locatorId).value
}

class checkBox extends Component {
    constructor(name, locatorId, elementId, label){
        super(name, locatorId, elementId, label)
    }
    show() {
        this.hidden = false;
        var inputElement = document.createElement("Input")
        var newElement = document.createElement("label")

        inputElement.type = "checkbox"

        newElement.name = this.name
        newElement.id = this.elementId
        newElement.innerHTML = this.label
        newElement.appendChild(inputElement)

        document.getElementById(this.locatorId).appendChild(newElement)
    }
    value = () => document.getElementById(this.locatorId).value
}