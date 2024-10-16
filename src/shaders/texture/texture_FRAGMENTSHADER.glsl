precision mediump float;

//varying vec4 v_color;
varying vec3 v_normal;
varying vec2 v_uv; // Receive UVs

uniform vec2 u_resolution;
uniform float u_time;



//for some reason if you set uniforms and you dont use them in the shader
//it will not compile, im guessing because of compiler optimization???? wtf no way that is happening here...

//just asked mr AI about the thing I talked about above, and it said if its not used the compiler discards it LMFAO no idea if that is still real or not

#define snowlayers 6.
#define ITERS 6

//Dave Hoskins 1x2 hash
float hash12(vec2 p){vec3 p3  = fract(vec3(p.xyx) * .1031);p3 += dot(p3, p3.yzx + 33.33);return fract((p3.x + p3.y) * p3.z);}

//Copy of my shader on Stoy https://www.shadertoy.com/view/MXBXDG
void main() {
    //As talked about by the issues above I will keep those vars below to not make the compiler angery, dont do what I do below.
    float compiler = u_time + u_resolution.x + v_normal.x; compiler = 0.0;

    /* if the verts need to be placed better just used canvas coords or do aspect ratio calc in the vert shader.
    float aspectRatio = res.x / res.y;    */
    gl_FragColor = vec4(abs(v_normal),1.0);
    //gl_FragColor = vec4(vec2(v_uv),0.,1.0);
    /*
    vec2 uv = v_uv.xy;
    vec2 cuv = uv;
    uv.x *= u_resolution.x/u_resolution.y;
    float t = u_time * 0.05;

    float s = 0.;
    for(float i = 1.; i < snowlayers + 1.; i++)
    {
        vec2 suv = uv;
        float n = (i/snowlayers);
        suv.x -= t * ((1. + i)*1.5);
        suv.y += t * 5.;

        //make a better ramp method iuc
        float ramp = 50. * n;// - (i*20.);
        suv *= ramp;
        
        float r = hash12(floor(suv + (i * 10.)));
        
        s = r > 0.96 ? n : s;
    }
    
    s += 0.3;
    
    //float topmask = smoothstep(0.2, 0., uv.y);
    //s -= topmask / 5.;
    
    //float botsnow = smoothstep(0.2, 0., uv.y);
    //s += botsnow;
    
    vec3 snow = vec3(s,s,1);

    vec2 scaledUV = cuv * 1.1; //2.1 for icey windows!
    vec2 fractUV = fract(scaledUV);

    float bl = step(0.1, fractUV.x) * step(0.1, fractUV.y);
    float maskCopy = bl;  // Rename to better reflect the purpose

    bl = (1.0 - bl) * (0.5 + hash12(floor(cuv * 10.0)));
    vec3 sidecols = vec3(0.5, 0.7, 0.95) * bl;
    snow *= maskCopy;
    
    
    //gl_FragColor = vec4(snow+sidecols,1.0);*/
}