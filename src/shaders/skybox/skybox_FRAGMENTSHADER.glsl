precision mediump float;
 
uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;
uniform float u_time;                          // Time for animation (e.g., moving sun or clouds).
uniform vec3 u_sunDirection;                   // Direction of the sun in world space.
 
varying vec4 v_position;

vec3 SunTest(vec3 viewDir, vec3 sunDir) {
  
  // Simple sky gradient
  float horizonBlend = smoothstep(-0.1, 0.3, viewDir.y); // Blend based on viewDir.y
  vec3 skyColor = mix(vec3(0.2, 0.4, 0.8), vec3(0.0, 0.0, 0.2), horizonBlend);

  // Sun glow
  float sunIntensity = max(dot(viewDir, normalize(sunDir)), 0.0);
  vec3 sunColor = vec3(1.0, 0.8, 0.6) * pow(sunIntensity, 256.0); // Sun with falloff

  // Combine sky and sun
  return sunColor + skyColor;

  /*
  float sunIntensity = max(dot(viewDir, normalize(sunDir)), 0.0);
  return vec3(1.0, 0.8, 0.6) * pow(sunIntensity, 256.0);
  */
}

void main() {

  vec4 t = u_viewDirectionProjectionInverse * v_position;

  // Reconstruct view direction
  vec3 viewDir = normalize(t.xyz / t.w);
  
  vec4 tc = textureCube(u_skybox, viewDir);

  float compiler = (tc.x + u_time + u_sunDirection.x + 0.0) * 0.0;    //only exists to stop compiler from optimizing out the texture lookup & giving compiling errors

  vec3 sunDir = vec3(
    sin(u_time) * 0.5 + 0.5,
    cos(u_time) * 0.5 + 1.,
    0.0
  );//normalize(u_sunDirection);

  vec3 sunTester = SunTest(viewDir, sunDir);

  gl_FragColor = vec4(sunTester,1.0) + compiler;

  //gl_FragColor = vec4(tc.xyz, 1.0) + compiler;//skybox cubemap
}


