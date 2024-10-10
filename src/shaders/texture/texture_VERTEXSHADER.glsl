attribute vec3 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;
attribute vec2 a_uv;

varying vec2 v_uv;
//varying vec4 v_color;
varying vec3 v_normal;

uniform mat4 u_MVP;
void main() {
    //v_color = a_color;
    v_normal = a_normal;
    v_uv = a_uv; // Pass UVs to fragment shader
    vec3 vertex_positions = a_position;
    //mat4 MVP = mat4(1);

    gl_Position = u_MVP * vec4(vertex_positions, 1.0);
}
