class InputManager {
    static keys: { [key: string]: boolean } = {};
    static mouse: {
        x: number,
        y: number,
        isPressed: boolean
    } = { x: 0, y: 0, isPressed: false };

    static init(canvas: HTMLCanvasElement) {
        // Keyboard event listeners
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            InputManager.keys[event.key] = true;
        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            InputManager.keys[event.key] = false;
        });

        // Mouse event listeners
        canvas.addEventListener('mousedown', () => {
            InputManager.mouse.isPressed = true;
        });

        canvas.addEventListener('mouseup', () => {
            InputManager.mouse.isPressed = false;
        });

        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            InputManager.mouse.x = event.clientX - rect.left;
            InputManager.mouse.y = event.clientY - rect.top;
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

function InitializeInputManager(canvas: HTMLCanvasElement)
{
    InputManager.init(canvas);
}

export { InitializeInputManager, InputManager };
