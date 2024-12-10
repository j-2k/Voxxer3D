// In your vertex shader
uniform mat4 u_MVP;
attribute vec3 a_position;      // Vertex position

void main() {
    // Transform the vertex position to clip space
    gl_Position = u_MVP * vec4(a_position.xyz, 1.0);
}
