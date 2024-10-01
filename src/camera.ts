import { GlobalWebGLItems } from "./renderer";
import Time from "./time-manager";
import * as glMatrix from "gl-matrix";
import { InputManager } from "./input-manager";

// Variables to hold mouse movement data
let mouseSensitivity = 30; // Adjust this for sensitivity
let yaw = -90; // Rotation around the Y-axis based on the X-axis of the mouse
let pitch = 0; // Rotation around the X-axis based on the Y-axis of the mouse

function CameraManager() {
  // Update camera position based on input
  const cameraSpeed = 5 * Time.deltaTime; // Define camera speed

  // Calculate the camera's "right" and "forward" vectors based on yaw
  const front = new Float32Array([
    Math.cos(glMatrix.glMatrix.toRadian(yaw)) * Math.cos(glMatrix.glMatrix.toRadian(pitch)),
    Math.sin(glMatrix.glMatrix.toRadian(pitch)),
    Math.sin(glMatrix.glMatrix.toRadian(yaw)) * Math.cos(glMatrix.glMatrix.toRadian(pitch))
  ]);
  glMatrix.vec3.normalize(GlobalWebGLItems.Camera.cameraTarget, front);

  // Calculate the right vector (perpendicular to the front vector)
  const right = glMatrix.vec3.create();
  glMatrix.vec3.cross(right, front, GlobalWebGLItems.Camera.upDirection);
  glMatrix.vec3.normalize(right, right);

  // Move the camera forward/backward relative to the front vector
  if (InputManager.isKeyPressed("w")) {
    const moveForward = glMatrix.vec3.create();
    glMatrix.vec3.scale(moveForward, front, cameraSpeed);
    glMatrix.vec3.add(GlobalWebGLItems.Camera.cameraPosition, GlobalWebGLItems.Camera.cameraPosition, moveForward);
  }
  if (InputManager.isKeyPressed("s")) {
    const moveBackward = glMatrix.vec3.create();
    glMatrix.vec3.scale(moveBackward, front, -cameraSpeed);
    glMatrix.vec3.add(GlobalWebGLItems.Camera.cameraPosition, GlobalWebGLItems.Camera.cameraPosition, moveBackward);
  }

  // Move the camera left/right relative to the right vector
  if (InputManager.isKeyPressed("a")) {
    const moveLeft = glMatrix.vec3.create();
    glMatrix.vec3.scale(moveLeft, right, -cameraSpeed);
    glMatrix.vec3.add(GlobalWebGLItems.Camera.cameraPosition, GlobalWebGLItems.Camera.cameraPosition, moveLeft);
  }
  if (InputManager.isKeyPressed("d")) {
    const moveRight = glMatrix.vec3.create();
    glMatrix.vec3.scale(moveRight, right, cameraSpeed);
    glMatrix.vec3.add(GlobalWebGLItems.Camera.cameraPosition, GlobalWebGLItems.Camera.cameraPosition, moveRight);
  }

  // Move the camera up/down
  if (InputManager.isKeyPressed("q")) {
    GlobalWebGLItems.Camera.cameraPosition[1] += cameraSpeed; // Move up
  }
  if (InputManager.isKeyPressed("e")) {
    GlobalWebGLItems.Camera.cameraPosition[1] -= cameraSpeed; // Move down
  }

  // Use mouse delta to update yaw and pitch for camera rotation
  yaw += InputManager.mouse.deltaX * mouseSensitivity * Time.deltaTime;
  pitch -= InputManager.mouse.deltaY * mouseSensitivity * Time.deltaTime;
  //For some time, I was experiencing very inconsistent camera sensitivity movement when moving the mouse,
  //but I never bothered multiplying by deltatime because I know it's wrong to do that, but apparently I might need
  //to do it here beause the mouse delta that is returned from event.movement is not consistent???
  //Then Multiplying by delta time seems to "fix" the issue, however I'm still not fond of this but whatever.

  // Clamp pitch to prevent flipping
  pitch = Math.max(-89, Math.min(89, pitch));

  // Recalculate front vector using updated yaw and pitch
  front[0] = Math.cos(glMatrix.glMatrix.toRadian(yaw)) * Math.cos(glMatrix.glMatrix.toRadian(pitch));
  front[1] = Math.sin(glMatrix.glMatrix.toRadian(pitch));
  front[2] = Math.sin(glMatrix.glMatrix.toRadian(yaw)) * Math.cos(glMatrix.glMatrix.toRadian(pitch));
  glMatrix.vec3.normalize(GlobalWebGLItems.Camera.cameraTarget, front);
  
  const finalFront = glMatrix.vec3.add(glMatrix.vec3.create(), GlobalWebGLItems.Camera.cameraPosition, front);

  // View matrix (camera transformation)
  let viewMatrix = GlobalWebGLItems.Camera.viewMatrix; // Retrieve the camera view matrix
  glMatrix.mat4.lookAt(
    viewMatrix,
    GlobalWebGLItems.Camera.cameraPosition,
    finalFront,
    GlobalWebGLItems.Camera.upDirection
  );

  // Reset mouse delta after applying
  InputManager.mouse.deltaX = 0;
  InputManager.mouse.deltaY = 0;
  //This is also really important!
  //It combats the issue of the camera moving on its own when the mouse is not moving & fights the stupid jittery-ness in the camera movement.
}

export {
  CameraManager
};
