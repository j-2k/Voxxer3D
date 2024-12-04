attribute vec3 a_position;
uniform mat4 u_MVP;
uniform float u_time;
varying vec3 v_Position;

void main() {
    v_Position = a_position;
    vec4 pos = u_MVP * vec4(a_position, 1.0);
    gl_Position = pos.xyww;
}