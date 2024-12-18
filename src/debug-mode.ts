class DebugConsole{
    private watchedVariables: Map<string, {
        value: any;
        type: string;
        formatter?: (value: any) => string;
      }> = new Map();

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
        if(this.debugElement.style.display === 'none') return;

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
        this.intervalId = window.setInterval(() => {
          this.UpdateValues();
          this.RenderDebug();
        }, this.updateRate);
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
      if (!this.debugElement) return;

      const debugContent = Array.from(this.watchedVariables.entries())
        .map(([name, variable]) => {

            const formattedDisplayValue = variable.formatter
                ? variable.formatter(variable.value)  // Dynamically apply formatter
                : this.formatValue(variable.value, variable.type);
    
            return `<div>
            <strong>${name}</strong>: 
            <span style="color: ${this.getColorForType(variable.type)}">${formattedDisplayValue}</span>
            </div>`;
        })
        .join('');

      this.debugElement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,1)">
          Debug Watcher v1.0.0 (f3 to toggle)
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
        if (type === 'vec3') {
            const parsedJSON = JSON.parse(JSON.stringify(variable));
          return `
            <span style="color: #FF0000">x: ${parsedJSON[0].toFixed(2)}</span>, 
            <span style="color: #4CAF50">y: ${parsedJSON[1].toFixed(2)}</span>, 
            <span style="color: #2196F3">z: ${parsedJSON[2].toFixed(2)}</span>,
          `;
        }
      
        // Default formatting
        return JSON.stringify(variable);
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

    public ToggleConsole() {
        this.debugElement.style.display = this.debugElement.style.display === 'none' ? 'block' : 'none';
    }
}

const debugConsole = new DebugConsole();
export default debugConsole;
