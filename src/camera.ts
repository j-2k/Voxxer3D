import { GlobalWebGLItems } from "./renderer";
import Time from "./time-manager";
import * as glMatrix from "gl-matrix";
import { InputManager } from "./input-manager";

function CameraManager()
{
  // Update camera position based on input
  // Variables to hold mouse movement data
  let mouseSensitivity = 0.01; // Adjust this for sensitivity
  let yaw = 0; // Rotation around the Y-axis
  let pitch = 0; // Rotation around the X-axis
  const cameraSpeed = 5 * Time.deltaTime; // Define camera speed
  if (InputManager.isKeyPressed("w")) {
    GlobalWebGLItems.Camera.cameraPosition[2] -= cameraSpeed; // Move front
  }
  if (InputManager.isKeyPressed("s")) {
    GlobalWebGLItems.Camera.cameraPosition[2] += cameraSpeed; // Move back
  }
  if (InputManager.isKeyPressed("a")) {
    GlobalWebGLItems.Camera.cameraPosition[0] -= cameraSpeed; // Move left
  }
  if (InputManager.isKeyPressed("d")) {
    GlobalWebGLItems.Camera.cameraPosition[0] += cameraSpeed; // Move right
  }
  if (InputManager.isKeyPressed("q")) {
    GlobalWebGLItems.Camera.cameraPosition[1] += cameraSpeed; // Move up
  }
  if (InputManager.isKeyPressed("e")) {
    GlobalWebGLItems.Camera.cameraPosition[1] -= cameraSpeed; // Move down
  }

  // Use mouse delta to update yaw and pitch for camera rotation
  GlobalWebGLItems.Camera.cameraTarget[0] += InputManager.mouse.deltaX * mouseSensitivity;
  //GlobalWebGLItems.Camera.cameraTarget[1] -= InputManager.mouse.deltaY * mouseSensitivity;

  // Clamp pitch to prevent flipping
  //pitch = Math.max(-89, Math.min(89, pitch)); // Limit pitch to prevent flipping

  // View matrix (camera transformation)
  let viewMatrix = GlobalWebGLItems.Camera.viewMatrix; // Retrieve the camera view matrix
  glMatrix.mat4.lookAt(
    viewMatrix,
    GlobalWebGLItems.Camera.cameraPosition,
    GlobalWebGLItems.Camera.cameraTarget,
    GlobalWebGLItems.Camera.upDirection
  );
}

export {
  CameraManager
}


