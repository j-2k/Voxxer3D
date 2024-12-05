precision mediump float;
 
uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;
uniform float u_time;                          // Time for animation (e.g., moving sun or clouds).
uniform vec3 u_sunDirection;                   // Direction of the sun in world space.
 
varying vec4 v_position;

// SD BOX
float sdBox( in vec2 p, in vec2 b )
{
  vec2 d = abs(p)-b;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdCircleFromViewDir(vec3 viewDir, vec3 sunDir, float radius) {
    // Normalize the input directions
    viewDir = normalize(viewDir);
    sunDir = normalize(sunDir);

    // Project view direction onto the plane of the sun's position
    vec3 sunPlane = viewDir - sunDir * dot(viewDir, sunDir); // Remove the sunDir component
    float distance = length(sunPlane) - radius;             // Distance from the center of the circle

    return distance;
}

vec3 SunTest(vec3 viewDir, vec3 sunDir) {
    // Normalize the input directions
    viewDir = normalize(viewDir);
    sunDir = normalize(sunDir);

    // Sun parameters
    float sunRadius = 0.2;

    // Signed distance to the circular sun
    float circle = sdCircleFromViewDir(viewDir, sunDir, sunRadius);

    // Smooth edges for the sun
    float circleIntensity = step(0.,-circle);//smoothstep(0.01, -0.01, circle); // Smooth falloff for the edges

    // Color for the sun
    vec3 sunColor = vec3(1.0, 0.85, 0.65) * circleIntensity;

    // Debug: Output the circle intensity as a color to verify if it’s being calculated
    // Uncomment this line to see the intensity as a grayscale debug
    return vec3(circleIntensity);

    // Simple sky gradient
    float horizonBlend = smoothstep(-0.1, 0.3, viewDir.y); // Blend based on viewDir.y
    vec3 skyColor = mix(vec3(0.2, 0.4, 0.8), vec3(0.0, 0.0, 0.2), horizonBlend);

    // Combine sky and circular sun
    return sunColor + skyColor;
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
  
  vec3 sunDir = normalize(vec3(sin(u_time), cos(u_time), 0.0));
  vec3 sun = SunTest(viewDir, sunDir);

  gl_FragColor = vec4(sun, 1.0) + compiler;//skybox cubemap
}


