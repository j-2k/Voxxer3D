precision mediump float;

varying vec3 v_normal;  // Interpolated normal from vertex shader
varying vec2 v_uv;      // Interpolated UV coordinates

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture; // Texture atlas
uniform vec2 u_texOffset;    // UV offset for the current block type
uniform vec2 u_texScale;     // UV scale for atlas cells (e.g., 1/number_of_columns, 1/number_of_rows)

void main() {
    float compiler = u_time + u_resolution.x + v_normal.x; compiler = 0.0;

    // Calculate the final UV coordinates
    vec2 uv = v_uv * u_texScale + u_texOffset;

    // Sample the texture atlas
    vec4 texColor = texture2D(u_texture, uv);

    

    // Apply lighting or other effects (optional)
    gl_FragColor = texColor;
}
