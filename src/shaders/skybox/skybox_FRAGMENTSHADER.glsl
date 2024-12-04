precision mediump float;

uniform float u_time;
varying vec3 v_Position;

void main() {
    // Simple gradient sky color
    vec3 skyColor1 = vec3(0.529, 0.808, 0.922);  // Light blue
    vec3 skyColor2 = vec3(0.153, 0.502, 0.678);  // Darker blue

    // Create a vertical gradient
    float t = (v_Position.y + 1.0) * 0.5;  // Map y from [-1,1] to [0,1]
    vec3 finalColor = mix(skyColor2, skyColor1, t);

    // Optional: Add a subtle time-based color variation
    finalColor += vec3(sin(u_time * 0.1) * 0.05);

    gl_FragColor = vec4(finalColor, 1.0);
}