import debug from './debug-mode';

class InputManager {
    static keys: { [key: string]: boolean } = {};
    static mouse: {
        x: number,
        y: number,
        deltaX: number,
        deltaY: number,
        isPressed: boolean
    } = { x: 0, y: 0, deltaX: 0, deltaY: 0, isPressed: false };

    static init(canvas: HTMLCanvasElement) {
        // Keyboard event listeners
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            InputManager.keys[event.key] = true;
        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            InputManager.keys[event.key] = false;
        });

        // Mouse event listeners
        canvas.addEventListener('mouseup', () => {
            InputManager.mouse.isPressed = false;
            this.mouse.deltaX = 0;
            this.mouse.deltaY = 0;
            //canvas.requestPointerLock(); // Lock the pointer on mouse down
        });

        canvas.addEventListener('mousedown', () => {
            InputManager.mouse.isPressed = true;
            canvas.requestPointerLock(); // Lock the pointer on mouse down
        });

        // Listen for pointer lock change events
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                console.log('Pointer is locked');
            } else {
                console.log('Pointer is unlocked');
            }
        });

        // Initialize previous mouse position
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            debug.Watch("MouseXY", () => InputManager.mouse, { type: "number", formatter: (m) => JSON.parse(JSON.stringify(m.x + ", " + m.y + " >> Check Console for DOM Exception!")) } );

            if(!InputManager.mouse.isPressed) {
                debug.Watch("IsMouseDown", () => this.mouse.isPressed);
                return;
            }

            const rect = canvas.getBoundingClientRect();
            debug.Watch("IsMouseDown", () => this.mouse.isPressed);

            InputManager.mouse.x = event.clientX - rect.left;
            InputManager.mouse.y = event.clientY - rect.top;

            // Calculate mouse delta
            InputManager.mouse.deltaX = event.movementX; // New way to get delta
            InputManager.mouse.deltaY = event.movementY; // So I removed the other garbage that was used to calc delta the old way
        });

        canvas.addEventListener('mouseleave', (event: MouseEvent) => {
            // Handle mouse leaving the canvas
            debug.Watch("MouseExitCanvas", () => this.mouse.isPressed);
            InputManager.mouse.isPressed = false; // Optionally reset mouse pressed state
            InputManager.mouse.deltaX = 0;
            InputManager.mouse.deltaY = 0;
        });
    }

    static isKeyPressed(key: string): boolean {
        return !!InputManager.keys[key];
    }

    static getMousePosition(): { x: number, y: number } {
        return { x: InputManager.mouse.x, y: InputManager.mouse.y };
    }

    static isMousePressed(): boolean {
        return InputManager.mouse.isPressed;
    }
}

//Funny function please dont kill me for this
function InitializeInputManager(canvas: HTMLCanvasElement) {
    InputManager.init(canvas); 
}

export { InitializeInputManager, InputManager };
