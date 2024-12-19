import { GlobalWebGLItems } from './renderer';
import { WorldChunkManager } from './voxel-engine/chunk-system';

const CHUNK_WIDTH = 32;
const CHUNK_DEPTH = 32;
const treeNoiseScale = 0.15;
let noiseContext: CanvasRenderingContext2D | null = null;
let debugCanvas: HTMLCanvasElement | null = null;
let isRunning = false; // Keeps track of whether the debug canvas is active
let renderLoopId: number | null = null;

function ExtraDebugCanvas() {
    if (isRunning) return; // If already running, do nothing
    isRunning = true;

    // Create the canvas if it doesn't already exist
    if (!debugCanvas) {
        debugCanvas = document.createElement('canvas');
        debugCanvas.width = CHUNK_WIDTH;
        debugCanvas.height = CHUNK_DEPTH;
        noiseContext = debugCanvas.getContext('2d');

        if (!noiseContext) {
            console.error('Failed to get canvas context');
            return;
        }

        debugCanvas.id = 'noiseCanvas';
        document.body.appendChild(debugCanvas);

        // Add CSS styling
        const style = document.createElement('style');
        style.textContent = `
            #noiseCanvas {
                all: unset;
                position: absolute;
                bottom: 200px;
                right: 0;
                width: 256px;
                height: 256px;
                z-index: 5;
                background-color: rgba(0, 0, 0, 0.5);
            }
        `;
        document.head.appendChild(style);
    }

    // Start the render loop
    RenderLoopCanvas();
}

function RenderLoopCanvas() {
    if (!isRunning || !noiseContext) return;

    // Render the noise texture on the canvas
    for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let z = 0; z < CHUNK_DEPTH; z++) {
            const noiseValue = WorldChunkManager.noise3D(
                (x + GlobalWebGLItems.Camera.cameraPosition[0] * CHUNK_WIDTH) * treeNoiseScale,
                0,
                (z + GlobalWebGLItems.Camera.cameraPosition[2] * CHUNK_DEPTH) * treeNoiseScale
            );

            const color = Math.floor(noiseValue * 255);
            noiseContext.fillStyle = `rgba(${color}, ${color}, ${color}, 1.0)`;
            noiseContext.fillRect(x, z, 1, 1);
        }
    }

    // Schedule the next frame if still running
    if (isRunning) {
        renderLoopId = requestAnimationFrame(RenderLoopCanvas); // Use `requestAnimationFrame` for smoother rendering
    }
}

function StopDebugCanvas() {
    if (!isRunning) return; // If not running, do nothing
    isRunning = false;

    // Stop the rendering loop
    if (renderLoopId !== null) {
        cancelAnimationFrame(renderLoopId);
        renderLoopId = null;
    }

    // Remove the canvas from the DOM
    if (debugCanvas) {
        debugCanvas.remove();
        debugCanvas = null;
    }

    noiseContext = null;
}

function ToggleDebugCanvas() {
    if (isRunning) {
        StopDebugCanvas(); // Turn off the canvas
    } else {
        ExtraDebugCanvas(); // Turn it back on
    }
}

export { ExtraDebugCanvas, StopDebugCanvas, ToggleDebugCanvas };
