precision mediump float;

varying vec2 v_color;           // Get the color from the vertex shader

uniform vec4 u_color;           // The color uniform (UV)
uniform sampler2D u_texture;    // The texture uniform
void main() {
    //gl_FragColor = u_color;

    //gl_FragColor = vec4(v_color,0.0,1.0);
    
    vec2 uv = v_color;
    gl_FragColor = texture2D(u_texture, uv);
}




/*
//WebGL 2.0 Shader Implementation
#version 300 es
precision mediump float;

// Uniforms
uniform vec4 u_color;  // The color uniform

// Output fragment color
out vec4 outColor;

void main() {
    // Set the output color to the uniform color
    outColor = u_color;
}

//WebGL 1.0 Shader Implementation
precision mediump float;
uniform vec4 u_color;
void main() {
    gl_FragColor = u_color;
}
*/