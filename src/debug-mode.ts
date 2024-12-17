class DebugConsole{
    debugItems = [];

    constructor(){
        console.log("DebugConsole constructor");

        const divElement: HTMLDivElement = document.createElement("div");
        const pElement : HTMLParagraphElement = document.createElement("p");
        
        divElement.style.bottom = "0";
        divElement.style.position = "fixed";

        pElement.textContent = "DebugConsole initialized";
        divElement.appendChild(pElement);
        document.body.appendChild(divElement);


        
        //this is the garbage i did before going to change it now
        document.body.innerHTML += `
        <!-- Debugging Purposes--> 
        <div style="
                display: transparent;
                width: 100%;
                position: fixed;
                top: 0;
                padding: 5px;
                padding-left: 30px;
                background-color: rgb(0, 0, 0,0.5);
                border: 2px solid rgb(0, 0, 0);">
            <div>
                <p id="textOverlay3">textOverlay3</p>
            </div>
            <div >
                <p id="textOverlay3">textOverlay3</p>
                <style>p {font-size: 20px; margin: -5px;}</style>
                <p id="textOverlay1">textOverlay1</p>
                <p id="textOverlay2">textOverlay2</p>
                <p id="textOverlay4">textOverlay4</p>
                <p id="textOverlay5">textOverlay5</p>
                <p id="textOverlay6">textOverlay6</p>
            </div> 
        </div>
        <!-- Debugging Purposes-->'`

        
    }

    public log(message: string){
        console.log("DebugConsole log: " + message);
    }

    public error(message: string){
        console.error("DebugConsole error: " + message);
    }

    public warn(message: string){
        console.warn("DebugConsole warn: " + message);
    }
}

export const debugConsole = new DebugConsole();