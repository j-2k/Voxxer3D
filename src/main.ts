import { initializeCanvas } from "./canvas";
import { StartMessages } from "./messages";
import { EngineRenderer } from "./renderer";
import { InitializeInputManager } from "./input-manager";

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

  console.log("WebGL is available, Voxxer3D is starting with initalization then rendering...");
  StartMessages(canvas, "Voxel Rendering Engine");
  InitializeInputManager(canvas);
  EngineRenderer(gl);
}

// Call the main function to start the application
main();

