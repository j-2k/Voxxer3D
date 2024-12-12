import { GlobalWebGLItems } from './renderer';
import { WorldChunkManager } from './voxel-engine/chunk-system';

const CHUNK_WIDTH = 32;
const CHUNK_DEPTH = 32;
const treeNoiseScale = 0.15;
let noiseContext : CanvasRenderingContext2D;

function ExtraDebugCanvas()
{
    // Create a canvas element to render the noise texture
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = CHUNK_WIDTH;
    noiseCanvas.height = CHUNK_DEPTH;
    const getNoiseContext = noiseCanvas.getContext('2d');
    if(getNoiseContext === null) { return;}
    noiseContext = getNoiseContext;
    
    // Render the noise texture on the canvas
    for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let z = 0; z < CHUNK_DEPTH; z++) {
            // Calculate the noise value at this position
            const noiseValue = WorldChunkManager.noise3D(
                (x + GlobalWebGLItems.Camera.cameraPosition[0] * CHUNK_WIDTH) * treeNoiseScale,
                0,
                (z + GlobalWebGLItems.Camera.cameraPosition[2] * CHUNK_DEPTH) * treeNoiseScale
            );

            // Map the noise value to a color
            const color = Math.floor(noiseValue * 255);
            noiseContext.fillStyle = `rgba(${color}, ${color}, ${color}, 1.0)`;
            noiseContext.fillRect(x, z, 1, 1);
        }
    }

    noiseCanvas.id = 'noiseCanvas';
    document.body.appendChild(noiseCanvas);

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


    callFunctionRecursively();
}

function RenderLoopCanvas(){
    // Render the noise texture on the canvas
    for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let z = 0; z < CHUNK_DEPTH; z++) {
            // Calculate the noise value at this position
            const noiseValue = WorldChunkManager.noise3D(
                (x + GlobalWebGLItems.Camera.cameraPosition[0] * CHUNK_WIDTH) * treeNoiseScale,
                0,
                (z + GlobalWebGLItems.Camera.cameraPosition[2] * CHUNK_DEPTH) * treeNoiseScale
            );

            // Map the noise value to a color
            const color = Math.floor(noiseValue * 255);
            noiseContext.fillStyle = `rgba(${color}, ${color}, ${color}, 1.0)`;
            noiseContext.fillRect(x, z, 1, 1);
        }
    }
}


function callFunctionRecursively() {
    RenderLoopCanvas();
    // Schedule the next call after 0.25 seconds (250 ms)
    setTimeout(callFunctionRecursively, 100);
}

export { ExtraDebugCanvas };