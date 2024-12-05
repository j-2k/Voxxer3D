precision mediump float;
 
uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;
 
varying vec4 v_position;
void main() {
  vec4 t = u_viewDirectionProjectionInverse * v_position;
  //vec4 tc = textureCube(u_skybox, normalize(t.xyz / t.w));
  //gl_FragColor = vec4(0.,1.,0.,1.) + ((tc + t) * 0.);//textureCube(u_skybox, normalize(t.xyz / t.w));
  gl_FragColor = textureCube(u_skybox, normalize(t.xyz / t.w));
}
