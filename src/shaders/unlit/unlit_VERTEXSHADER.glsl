attribute vec3 a_position;  // Attribute to hold the position of the vertex
attribute vec2 a_color;     // Attribute to hold the color of the vertex

varying vec2 v_color;       // Pass the color to the fragment shader

uniform mat4 u_modelMatrix; // Model transformation matrix
uniform vec2 u_resolution;  // Resolution of the canvas to normalize the position if canvas size changes/is not 1:1

void main() {
    
    v_color = a_color;

    //vec2 scaledAspectRatio = a_position.xy * vec2(u_resolution.y / u_resolution.x,1.0);
    //gl_Position = u_modelMatrix * vec4(scaledAspectRatio.xy,a_position.z, 1.0);

    gl_Position = u_modelMatrix * vec4(a_position, 1.0);
}

/* 
//WebGL 2.0 Shader Implementation
#version 300 es
precision mediump float;

// Attribute to hold vertex positions
in vec3 a_position;

// Uniforms
uniform mat4 u_modelMatrix;  // Model transformation matrix
uniform vec2 u_resolution;   // Resolution of the canvas

// Pass to fragment shader
void main() {
    // Transform the vertex position by the model matrix
    vec4 transformedPosition = u_modelMatrix * vec4(a_position, 1.0);
    
    // Convert the transformed position to clip space
    // Clip space is from (-1, 1) in both x and y, so we normalize the positions
    vec2 clipSpace = (transformedPosition.xy / u_resolution) * 2.0 - 1.0;
    
    // Output the position in clip space
    gl_Position = vec4(clipSpace, 0.0, 1.0);
}

// WebGL 1.0 Shader Implementation
attribute vec3 a_position;
uniform mat4 u_modelMatrix;
uniform vec2 u_resolution;

void main() {
    vec4 transformedPosition = u_modelMatrix * vec4(a_position, 1.0);
    vec2 clipSpace = (transformedPosition.xy / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace, 0.0, 1.0);
}
*/

