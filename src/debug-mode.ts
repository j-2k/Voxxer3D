import { ToggleDebugCanvas } from "./debug-canvas";

class DebugConsole{
    private watchedVariables: Map<string, {
        value: any;
        type: string;
        formatter?: (value: any) => string;
    }> = new Map();

    private isActive : boolean = true;

    private debugElement: HTMLDivElement = document.createElement("div");

    private updateRate : number = 10; // ms
    private intervalId: number | null = null;

    constructor(){
        console.log("DebugConsole constructor");
        this.ToggleKeyDown();
        this.CreateDebugElement();
        const pElement : HTMLParagraphElement = document.createElement("p");
        pElement.textContent = "You should not be seeing this message... Unless your canvas explodes :D";
        this.debugElement.appendChild(pElement);

        this.StartWatching(); //Start watching at initialization, not really needed but whatever (it already does w/o it).
    }


    //Getting from a param??? this is crazy, explanation of "getter: () => T" Defines a function that will be called to get the current value, so once we do value: getter() it will call the function and get the value
    public Watch<T>(
        variableName: string, 
        getter : () => T, 
        options : { 
            type?: string,
            formatter?: (value: T) => string;
        } = {})
    {
        if (!this.isActive) return; // Do nothing if the debug console is inactive

        this.watchedVariables.set(variableName, {
          value: getter(),
          type: options.type || typeof getter(),
          formatter: options.formatter, //fixed to keep user-defined formatter
        });

        // Start updating if not already running
        if (!this.intervalId) {
            this.StartWatching();
        }
      
        return this;
    }

    private StartWatching() {
        if (!this.isActive) return; // Only start watching if the console is active
        this.intervalId = window.setInterval(() => {
          this.UpdateValues();
          this.RenderDebug();
        }, this.updateRate);
    }

    public StopWatching() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
        return this;
    }

    private UpdateValues() {
        for (const [name, variable] of this.watchedVariables.entries()) {
          // Re-fetch the current value
          const currentValue = this.GetVariableValue(name);
          variable.value = currentValue;
        }
    }

    // Render debug information
    private RenderDebug() {
        if (!this.isActive || !this.debugElement) return; // Skip rendering if inactive
        const debugContent = Array.from(this.watchedVariables.entries())
        .map(([name, variable]) => {

            //If there is a pre-defined formatter, use it, otherwise use the default formatter
            const formattedDisplayValue = variable.formatter
                ? variable.formatter(variable.value)  // This is the user-defined formatter
                : this.formatValue(variable.value, variable.type); // This is the default formatter
            //I thought the user-defined formatter would be useless but I found 1 case where I had use for it, but you can check
            //how the canvas sizes are being retrieved, passing the canvas interface wont actually update the canvas in real time
            //even passing it into a object didnt work, so I had to pass the canvas element and then use a formatter
            //to get the width and height of the canvas in real time, so I guess it has its uses. The custom formatter implementation might not be 
            //"good" but I think it does a decent job for now.
    
            return `<div>
            <strong>${name}</strong>: 
            <span style="color: ${this.getColorForType(variable.type)}">${formattedDisplayValue}</span>
            </div>`;
        })
        .join('');

      this.debugElement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,1)">
          Debug Watcher v1.0.0 (f3 to toggle)
          <div style="font-weight: 300;">
                Watching ${this.GetWatchedVars().size} variables${this.Dots()}
          </div>
        </div>
        ${debugContent}
      `;
    }

    // Color code based on type
    private getColorForType(type: string): string {
        const typeColors: {[key: string]: string} = {
        'number': '#4CAF50',   // Green
        'string': '#2196F3',   // Blue
        'boolean': '#FF9800',  // Orange
        'object': '#9C27B0',   // Purple
        'function': '#FFFF00',  // Yellow
        };
        return typeColors[type] || '#FFFFFF';
    }

    private formatValue(variable: any, type: string): string {
        // Convert incoming var to array if it's an object
        let parsed: any;
    
        if (Array.isArray(variable)) {
            parsed = variable; // Already an array
        } else if (typeof variable === 'object') {
            parsed = Object.values(variable); // Convert object to array
        } else {
            // Fallback to a generic structure
            return JSON.stringify(variable, null, 2);
        }
    
        // Handle the parsed structure consistently
        if (type === 'vec3' && parsed.length >= 3) {
            return `
                <span style="color: #FF0000">x: ${parsed[0].toFixed(2)}</span>, 
                <span style="color: #4CAF50">y: ${parsed[1].toFixed(2)}</span>, 
                <span style="color: #2196F3">z: ${parsed[2].toFixed(2)}</span>
            `;
        } else if (type === 'vec2xz' && parsed.length >= 2) {
            return `
                <span style="color: #FF0000">x: ${parsed[0]}</span>, 
                <span style="color: #2196F3">z: ${parsed[1]}</span>
            `;
        } else if (type === 'vec2xy' && parsed.length >= 2) {
            return `
                <span style="color: #FF0000">x: ${parsed[0]}</span>, 
                <span style="color: #4CAF50">y: ${parsed[1]}</span>
            `;
        }
    
        // Default fallback for unhandled cases
        return JSON.stringify(parsed, null, 2); // Pretty-print as a JSON string
    }

    private GetVariableValue(name: string): any {
        const variable = this.watchedVariables.get(name);
        return variable ? (typeof variable.value === 'function' ? variable.value() : variable.value) : undefined;
    }

    private CreateDebugElement() {
        this.debugElement = document.createElement('div');
        this.debugElement.style.position = 'fixed';
        this.debugElement.style.top = '0px';
        this.debugElement.style.left = '0px';
        this.debugElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.debugElement.style.color = 'white';
        this.debugElement.style.padding = '10px';
        this.debugElement.style.fontFamily = 'monospace';
        this.debugElement.style.zIndex = '1000';
        this.debugElement.style.maxWidth = '50%';
        this.debugElement.style.overflow = 'auto';
        document.body.appendChild(this.debugElement);
    }

    public ToggleKeyDown(){
        document.addEventListener('keydown', (event) => {
            if(event.key === 'F3'){
                this.ToggleConsole();
            }
        });
    }

    private easteregg : HTMLDivElement = document.createElement("div");
    private EasterEgg(state : boolean = false){
        
        if(state){
            this.easteregg = document.createElement("div");
            this.easteregg.innerHTML = `<p> 
            hey you why did u enable the paused debugger??? u tryna judge my code ik you
            </p>`;
            this.debugElement.appendChild(this.easteregg);
        }else{
            this.easteregg.innerHTML = '';
            this.easteregg.remove();
        }
    }


    public ToggleConsole() {
        this.isActive = !this.isActive; // Toggle the active state
        this.debugElement.style.display = this.isActive ? 'block' : 'none';

        if (this.isActive) {
            this.EasterEgg(false);
            this.StartWatching(); // Resume background tasks
            ToggleDebugCanvas(); // Resume the canvas
        } else {
            this.EasterEgg(true)
            this.StopWatching(); // Stop background tasks
            this.ClearDots(); // Stop dots rendering
            ToggleDebugCanvas(); // Pause the canvas
        }
    }
    
    // Clear all watched variables
    public ClearWatchedVariables() {
        this.watchedVariables.clear();
        this.StopWatching();
        if (this.debugElement) {
          this.debugElement.innerHTML = '';
        }
        return this;
    }

    public GetWatchedVars(){
        return this.watchedVariables;
    }


    //Trying to learn a little about setinterval & clearinterval, very useful functions including timeout!
    private str = "";
    private dotInterval : any = null;
    public Dots() : string {
        if (!this.isActive || !this.dotInterval) {
            if (!this.dotInterval) {
                this.dotInterval = setInterval(() => {
                    this.str += ".";
                    if(this.str.length > 3){
                        this.str = "";
                    }
                }, (333));
            }
        }
        return this.str;
    }

    public ClearDots() {
        clearInterval(this.dotInterval);
        this.dotInterval = null;
        this.str = "";
    }

    public ShowDebugCanvas(){
        ToggleDebugCanvas();
    }

    //A reminder to not forget that function declarations are not actually ran,
    //but arrow functions are, a small note for myself since this is crazy to me, pretty cool though.
    /*
    public clearAllFunction() : void
    {
        const clearAll = setTimeout(() => {
            this.ClearDots();
            this.ClearWatchedVariables();
            console.log("Stopped all intervals using the Clear All Delcaration Function");
        }, 3000);
    }
    //This is the same as the above function, but it is ran immediately, the above function is not ran until it is called.
    public clearAll = setTimeout(() => {
            this.ClearDots();
            this.ClearWatchedVariables();
            console.log("Stopped all intervals by set arrow function");
    }, 3000);
    */

}


const debugConsole = new DebugConsole();
export default debugConsole;
