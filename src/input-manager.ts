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
            //canvas.requestPointerLock(); // Lock the pointer on mouse down
        });

        // Listen for pointer lock change events
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                console.log('Pointer is locked');
            } else {
                console.log('Pointer is unlocked');
            }
        });

        textOverlay5.textContent = "IsMouseDown : " + InputManager.mouse.isPressed;

        // Initialize previous mouse position
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if(!InputManager.mouse.isPressed) {
                textOverlay5.textContent = "IsMouseDown : " + this.mouse.isPressed;
                return;
            }
            const rect = canvas.getBoundingClientRect();

            textOverlay5.textContent = "IsMouseDown : " + this.mouse.isPressed;

            InputManager.mouse.x = event.clientX - rect.left;
            InputManager.mouse.y = event.clientY - rect.top;

            // Calculate mouse delta
            InputManager.mouse.deltaX = event.movementX*0.5; // New way to get delta
            InputManager.mouse.deltaY = event.movementY*0.5; // So I removed the other garbage that was used to calc delta the old way
        });

        canvas.addEventListener('mouseleave', (event: MouseEvent) => {
            // Handle mouse leaving the canvas
            textOverlay5.textContent = "Mouse left the canvas";
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


function InitializeInputManager(canvas: HTMLCanvasElement) {
    InputManager.init(canvas);
}

const textOverlay3 = document.getElementById('textOverlay3') as HTMLElement;
textOverlay3.textContent = "textOverlay3";

const textOverlay4 = document.getElementById('textOverlay4') as HTMLElement;
textOverlay4.textContent = "textOverlay4";

const textOverlay5 = document.getElementById('textOverlay5') as HTMLElement;
textOverlay5.textContent = "textOverlay5";

export { InitializeInputManager, InputManager };
