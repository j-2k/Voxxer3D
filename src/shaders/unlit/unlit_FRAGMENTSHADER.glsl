precision mediump float;

varying vec2 v_color;           // Get the color from the vertex shader

uniform sampler2D u_texture;    // The texture uniform

void main() {
    vec2 uv = v_color;
    gl_FragColor = texture2D(u_texture, v_color);
    //gl_FragColor = vec4(uv, 0.0, 1.0);
}