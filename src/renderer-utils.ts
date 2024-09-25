//Shader compiler takes 
//(WEBGL context, GLSL shader, Shader type (VERTEX or FRAGMENT))
//returns a WebGLShader object
function CompileShaderSource(gl: WebGLRenderingContext, shaderSrc: string, shaderType: number) : WebGLShader | null {
    
    //Create shader object
    const shader = gl.createShader(shaderType) as WebGLShader | null;
    if (!shader) {
        console.error("Failed to create shader inside the CreateShader function...");
        return null;
    }

    //Connect GLSL code to our shader object & compile it
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);
    const compileStatus : boolean = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (compileStatus) {
        return shader;
    }

    //If compilation failed, print error message
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
}

//Linking vertex & fragment shader to a shader program it takes
//(WEBGL context, vertex shader, fragment shader)
//returns a shader program object (material?)
function CreateShaderProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) : WebGLProgram | null {
    
    //Create shader program object
    const shaderProgram = gl.createProgram() as WebGLProgram | null;
    if (!shaderProgram || !vertexShader || !fragmentShader) {
        console.error("Failed to create shader program inside the CreateProgram function...");
        return null;
    }

    //Attach vertex & fragment shader to this shader program
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    //Linking the shader program
    gl.linkProgram(shaderProgram);
    const linkStatus : boolean = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
    if (linkStatus) {
        return shaderProgram;
    }

    //If linking failed, print error message
    console.error(gl.getProgramInfoLog(shaderProgram));
    gl.deleteProgram(shaderProgram);
    return null;
}

//Create a shader material in 1 function call
function CreateShaderMaterial(gl: WebGLRenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string) : WebGLProgram | null {
    const vertexShader = CompileShaderSource(gl, vertexShaderSrc, gl.VERTEX_SHADER);
    const fragmentShader = CompileShaderSource(gl, fragmentShaderSrc, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
        console.error("Failed to compile vertex or fragment shader inside the CreateShaderMaterial function...");
        return null;
    }
    return CreateShaderProgram(gl, vertexShader, fragmentShader);
}

const ShaderUtilites = {
    CompileShaderSource,
    CreateShaderProgram,
    CreateShaderMaterial
}

export default ShaderUtilites;
