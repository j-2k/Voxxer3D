precision mediump float;

varying vec3 v_normal;  // Interpolated normal from vertex shader
varying vec2 v_uv;      // Interpolated UV coordinates

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture; // Texture atlas
uniform vec2 u_texOffset;    // UV offset for the current block type
uniform vec2 u_texScale;     // UV scale for atlas cells (e.g., 1/number_of_columns, 1/number_of_rows)

void main() {
    float compiler = u_time + u_resolution.x + v_normal.x + u_texOffset.x; compiler = 0.0;

    //Calculate the final UV coordinates
    //Im so fuckin dumb i stacked offsets from cpu side already
    vec2 uv = (v_uv * (u_texScale));// + vec2(0.0,0.25);

    //uv.y = 1.0 - uv.y;

    // Sample the texture atlas
    vec4 texColor = texture2D(u_texture, uv);

    //texColor.xyz *= (sin(u_time*2.) + 1.5);

    // Apply lighting or other effects (optional)
    gl_FragColor = vec4(texColor.xyz , 1.);
}
