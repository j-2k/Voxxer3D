function initializeCanvas(canvasId: string): WebGLRenderingContext | null {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
        console.error(`Canvas with id '${canvasId}' not found`);
        return null;
    }

    const gl = canvas.getContext("webgl");
    //const gl = false; //For testing purposes
    
    if (!gl) {
        console.warn("WebGL not supported, falling back to 2D context");
        const context = canvas.getContext('2d');
        if (context) {
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);
            console.info("Canvas set to black using 2D context");
        } else {
            console.error("Neither WebGL nor 2D context is supported");
            handleNoCanvasSupport(canvas);
        }
        return null;
    }

    return gl;
}

function handleNoCanvasSupport(canvas: HTMLCanvasElement) {
    const errorMessage = document.createElement('div');
    errorMessage.textContent = 'Your browser does not support canvas. Please try a different browser.';
    errorMessage.style.color = 'red';
    canvas.insertAdjacentElement('afterend', errorMessage);
    //canvas.style.display = 'none'; // can show a img here instead!
}

export {
    initializeCanvas
}