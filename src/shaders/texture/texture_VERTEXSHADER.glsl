attribute vec3 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;

varying vec4 v_color;
varying vec3 v_normal;

uniform mat4 u_MVP;
void main() {
    v_color = a_color;
    v_normal = a_normal;
    vec3 vertex_positions = a_position;
    //mat4 MVP = mat4(1);

    gl_Position = u_MVP * vec4(vertex_positions, 1.0);
}
