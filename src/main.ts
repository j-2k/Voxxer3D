import { initializeCanvas } from "./canvas";
import { StartMessages } from "./messages";
import { EngineRenderer, GlobalWebGLItems } from "./renderer";
import { InitializeInputManager } from "./input-manager";
import * as glMatrix from "gl-matrix";
import { CMDBox } from "./chatbox";

import debug from "./debug-mode";

function main() {
  const canvasId = "webglCanvas";
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  
  const gl = initializeCanvas(canvas);
  //const gl = false;

  if (!gl) {
    console.warn("WebGL context not available. Renderer will not start.");
    StartMessages(canvas, "⚠️ CHECK CONSOLE! ⚠️ GL IS FALSE! ⚠️");
    return; // Early return if gl is null
  }

  CanvasHandler(canvas, gl);


  console.log("WebGL is available, Voxxer3D is starting with initalization then rendering...");
  StartMessages(canvas, "Voxel Rendering Engine", false, false);
  CMDBox();
  InitializeInputManager(canvas);
  EngineRenderer(gl);
}

function CanvasHandler(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
  //canvas.width = 900;
  //canvas.height = 600;
  //width="900" height="600"
  //canvas.width = window.innerWidth;
  //canvas.height = window.innerHeight;

  //uncomment the formatter side to see how it changes the debug shown for canvas size 
  debug.Watch("Canvas Size", () => canvas, { type: "vec2xy" , formatter: (c) => 
  `<span style="color: #FF0000">x: ${JSON.parse(JSON.stringify(c.width))}</span>, ` +
  `<span style="color: #4CAF50">y: ${JSON.parse(JSON.stringify(c.height))}</span> ps. I prob handled canvas "incorrectly"` });

  setupResize();
  resizeCanvas();

  function setupResize() {
    // Resize when window is resized
    window.addEventListener('resize', () => {
        resizeCanvas();
        updateProjectionMatrix();
    });
  }
  
  function resizeCanvas() {
    // Make canvas fill the entire window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    // Update WebGL viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function updateProjectionMatrix() {
    // Recalculate projection matrix with new aspect ratio
    const aspectRatio = gl.canvas.width / gl.canvas.height;
    const fovRADIAN = 70 * Math.PI / 180;

    // Update the projection matrix in the GlobalWebGLItems
    glMatrix.mat4.perspective(
      GlobalWebGLItems.Camera.projectionMatrix, 
      fovRADIAN, 
      aspectRatio, 
      0.1, 
      100.0
    );
  }
}




// Call the main function to start the application
main();

