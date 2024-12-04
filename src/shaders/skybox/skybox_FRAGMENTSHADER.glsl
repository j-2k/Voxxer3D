precision mediump float;
uniform float u_time;
varying vec3 v_Position;

void main() {
    float compiler = (u_time*0.0);

    vec3 skyColor = vec3(0.5, 0.7, 0.9) + compiler; // Sky blue
    gl_FragColor = vec4(skyColor, 1.0);
}