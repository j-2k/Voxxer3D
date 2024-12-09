precision mediump float;
 
uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;
uniform float u_time;                          // Time for animation (e.g., moving sun or clouds).
uniform vec3 u_sunDirection;                   // Direction of the sun in world space.
 
varying vec4 v_position;

float SquareDistance(float x, float y, float sunSize){
    // Square distance calculation
    vec2 d = abs(vec2(x, y)) - vec2(sunSize);
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}



// Hash function for pseudo-random generation
float hash(vec2 p) {
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

// Noise function for smoother randomness
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(hash(i + vec2(0.0, 0.0)), 
                   hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), 
                   hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

vec3 SquareSunTest(vec3 viewDir, vec3 sunDir) {
    // Normalize the input directions
    viewDir = normalize(viewDir);
    sunDir = normalize(sunDir);

    // Sun parameters
    float sunSize = 0.12; // Size of the sun
    
    // Create a local coordinate system aligned with the sun direction
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(sunDir, up));
    up = normalize(cross(right, sunDir));

    // Project view direction onto the plane perpendicular to sunDir
    vec3 projectedView = viewDir - dot(viewDir, sunDir) * sunDir;
    
    // Calculate local coordinates relative to sun center
    float x = dot(projectedView, right);
    float y = dot(projectedView, up);

    // Smooth edges for the sun
    float sqDist = SquareDistance(x, y, sunSize*0.8);
    float sqDistOL = SquareDistance(x, y, sunSize);
    float sunMask = smoothstep(0.001, 0. , sqDist*0.8);
    float sunMaskOL = smoothstep(0.001, 0. , sqDistOL);

    // Color for the sun
    vec3 sunColor;
    vec3 sunColorInner = vec3(1.0) * sunMask;
    vec3 sunColorOuter = vec3(1.0, 1.0, 0.0) * sunMaskOL;

    sunColor = sunColorInner + sunColorOuter;

    // Combine sky and square sun
    return sunColor;
}

void main() {
  float compiler = 0.;
  vec4 texCubemap;
  vec3 viewDir;

  {
    vec4 t = u_viewDirectionProjectionInverse * v_position;
    viewDir = normalize(t.xyz / t.w);
    texCubemap = textureCube(u_skybox, viewDir);
    compiler = (texCubemap.x + u_time + u_sunDirection.x + 0.0) * 0.0;    //only exists to stop compiler from optimizing out the texture lookup & giving compiling errors
  }
  
  //vec3 sunDir = normalize(vec3(0.0, cos(u_time), sin(u_time)));
  vec3 sunDir = vec3(0.0, 0.0, 2.0);
  vec3 sun = SquareSunTest(viewDir, sunDir);
  float n = (noise(viewDir.xy * 100.0 + u_time)*2.0);
  sun *= n;
  //if (n < 0.) {discard;}

  // Simple sky gradient
  float horizonBlend = smoothstep(-0.1, 0.3, viewDir.y);
  vec3 skyColor = mix(vec3(0.2, 0.4, 0.8), vec3(0.0, 0.0, 0.2), horizonBlend);

  gl_FragColor = vec4(vec3(sun + skyColor),1.0) + compiler;//skybox cubemap
}


