precision mediump float;      // Required for WebGL 1.0 to set float precision

uniform vec4 u_color;          // Solid color (RGBA)

void main() {
    // Output the final color
    gl_FragColor = u_color;
}
