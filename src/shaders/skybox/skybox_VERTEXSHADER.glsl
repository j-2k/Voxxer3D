attribute vec4 a_position;
attribute vec3 a_normal;

varying vec3 normal;
varying vec2 v_uv;
varying vec4 v_position;
void main() {
  v_position = a_position;
  gl_Position = a_position;
  gl_Position.z = 1.0;
}