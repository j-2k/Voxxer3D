attribute vec3 a_position;
attribute vec3 a_color;

varying vec3 v_color;

uniform mat4 u_modelMatrix;
uniform vec2 u_resolution;

void main() {
    /*
    vec4 transformedPosition = u_modelMatrix * vec4(a_position, 1.0);
    vec2 clipSpace = (transformedPosition.xy / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    */

    v_color = a_color;

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

