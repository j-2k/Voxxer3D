import Time from './time-manager';
import * as glMatrix from "gl-matrix";
import ShaderUtilites from './renderer-utils';
import Materials from './shader-materials';


function EngineRenderer(gl : WebGLRenderingContext)
{
    RenderingSettings(gl);
    
    Start(gl);

    UpdateCore(gl);
}

class GlobalWebGLItems{
    public static samplerUniformLocation : WebGLUniformLocation | null = null;
    public static grassTexture : WebGLTexture | null = null;
    public static modelMatrixUniformLocation : WebGLUniformLocation | null = null;
}


function Start(gl : WebGLRenderingContext)
{
    //Create Shader Program
    const shaderProgram = ShaderUtilites.CreateShaderMaterial(gl, Materials.Unlit.vertexShader, Materials.Unlit.fragmentShader);
    if (!shaderProgram) {
        console.error("Failed to create shader program in the start function of the renderer...");
        return;
    }
    gl.useProgram(shaderProgram);

    //Create Position Buffer
    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);

    //Create Vertex Array
    const vertexPosData = new Float32Array([
        -0.5,  0.5, 0.0,  // Top-left
        -0.5, -0.5, 0.0,  // Bottom-left
         0.5, -0.5, 0.0,  // Bottom-right
    
         0.5, -0.5, 0.0,  // Bottom-right
         0.5,  0.5, 0.0,  // Top-right
        -0.5,  0.5, 0.0   // Top-left
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPosData, gl.STATIC_DRAW);

    // --- Set up Vertex Attribute for Positions ---
    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Create Color Buffer
    const vertexColBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);

    //Create Vertex Colors Array
    const uvPosData = new Float32Array([
        0.0, 1.0,   // Top-left (u, v)
        0.0, 0.0,   // Bottom-left (u, v)
        1.0, 0.0,   // Bottom-right (u, v)
    
        1.0, 0.0,   // Bottom-right (u, v)
        1.0, 1.0,   // Top-right (u, v)
        0.0, 1.0    // Top-left (u, v)
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, uvPosData, gl.STATIC_DRAW);

    // --- Set up Vertex Attribute for Colors ---
    const colorAttributeLocation = gl.getAttribLocation(shaderProgram, "a_color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);    //I missed this and it gave me some big issues! Buffers must be binded before setting up the vertex attributes.
    gl.vertexAttribPointer(colorAttributeLocation, 2, gl.FLOAT, false, 0, 0);


    //Create Texture Loader
    const grassTexture = gl.createTexture();
    GlobalWebGLItems.grassTexture = grassTexture; 
    
    const grassImage = new Image();
    grassImage.src = "/grassblock/Faithful-x64/side-faithful-grass.png";

    grassImage.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, grassTexture);

        // Flip the image's Y axis to match WebGL's coordinate system
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grassImage);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Unbind the texture
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // Bind the texture before drawing
    gl.activeTexture(gl.TEXTURE0);  // Activate texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);

    // Get the location of the sampler uniform in the fragment shader
    const samplerUniformLocation = gl.getUniformLocation(shaderProgram, "u_texture");
    GlobalWebGLItems.samplerUniformLocation = samplerUniformLocation;
    // Set the texture unit (0 in this case)
    gl.uniform1i(samplerUniformLocation, 0);



    //Create Uniforms
    const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const colorUniformLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorUniformLocation, [1.0, 0.0, 0.0, 1.0]);

    //Create Model Matrix
    let modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]);

    let modelMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "u_modelMatrix");
    GlobalWebGLItems.modelMatrixUniformLocation = modelMatrixUniformLocation;
    gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);

}

function Update(gl: WebGLRenderingContext,)
{
    console.log("Update Call...");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Bind the texture
    gl.bindTexture(gl.TEXTURE_2D, GlobalWebGLItems.grassTexture);

    //Aspect Ratio
    const aspectRatio = gl.canvas.width / gl.canvas.height;
    let projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.ortho(projectionMatrix, -aspectRatio, aspectRatio, -1, 1, -1, 1);


    let modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [Math.cos(Time.time*2)*0.5, Math.sin(Time.time*2)*0.5, 0.0]);
    glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, Time.time*2);

    //gl.uniformMatrix4fv(GlobalWebGLItems.modelMatrixUniformLocation, false, modelMatrix);

    let finalMatrix = glMatrix.mat4.create();
    glMatrix.mat4.multiply(finalMatrix, projectionMatrix, modelMatrix);
    gl.uniformMatrix4fv(GlobalWebGLItems.modelMatrixUniformLocation, false, finalMatrix);
    

    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}











function UpdateCore(gl: WebGLRenderingContext) {
    requestAnimationFrame(function() {
        Time.CalculateTimeVariables();

        Update(gl);

        UpdateCore(gl);
    });
}

function RenderingSettings(gl : WebGLRenderingContext)
{
     // Set the viewport to match the canvas size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //Set Clear Color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    //Enable Backface Culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);

    //Enable Depth Testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
}

export {
    EngineRenderer
}