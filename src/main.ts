import { initializeCanvas } from "./canvas";
import { StartMessages } from "./messages";
import { EngineRenderer } from "./renderer";
import { InitializeInputManager } from "./input-manager";
import { ExtraDebugCanvas } from "./debug-canvas";

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

  CanvasHandler(canvas);

  console.log("WebGL is available, Voxxer3D is starting with initalization then rendering...");
  StartMessages(canvas, "Voxel Rendering Engine");//, false);
  InitializeInputManager(canvas);
  EngineRenderer(gl);

  ExtraDebugCanvas();
}

function CanvasHandler(canvas: HTMLCanvasElement) {
  canvas.width = 900;
  canvas.height = 600;
  //width="900" height="600"
  //canvas.width = window.innerWidth;
  //canvas.height = window.innerHeight;
}

// Call the main function to start the application
main();

