attribute vec3 a_position;  // Attribute to hold the position of the vertex
attribute vec2 a_color;     // Attribute to hold the color of the vertex

varying vec2 v_color;       // Pass the color to the fragment shader

uniform mat4 u_modelMatrix; // Model transformation matrix
//uniform vec2 u_resolution;  // Resolution of the canvas to normalize the position if canvas size changes/is not 1:1

void main() {
    
    v_color = a_color;

    //gl_pos excepts clip space, which is from -1 to 1 in x and y
    //gl_Position = (projectionMatrix * viewMatrix * modelMatrix) * vec4(position, 1.0);
    //The above enclosed brackets with the MVP matricies are all in u_modelMatrix already!
    gl_Position = u_modelMatrix * vec4(a_position, 1.0);
}