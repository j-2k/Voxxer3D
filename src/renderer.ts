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
    const vertexPosArray = new Float32Array([
        0.0, 0.8, 0.0,  // Top vertex
        -0.8, -0.8, 0.0,  // Bottom-left vertex
        0.8, -0.8, 0.0   // Bottom-right vertex
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPosArray, gl.STATIC_DRAW);


    
    //Create Color Buffer
    const vertexColBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);

    //Create Vertex Colors Array
    const vertexColArray = new Float32Array([
        1.0, 0.0, 0.0,  // Top vertex
        0.0, 1.0, 0.0,  // Bottom-left vertex
        0.0, 0.0, 1.0   // Bottom-right vertex
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColArray, gl.STATIC_DRAW);

    // --- Set up Vertex Attribute for Positions ---
    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    
    // --- Set up Vertex Attribute for Colors ---
    const colorAttributeLocation = gl.getAttribLocation(shaderProgram, "a_color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);    //I missed this and it gave me some big issues! Buffers must be binded before setting up the vertex attributes.
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Create Uniforms
    const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const colorUniformLocation = gl.getUniformLocation(shaderProgram, "u_color");
    gl.uniform4fv(colorUniformLocation, [1.0, 0.0, 0.0, 1.0]);

    //Create Model Matrix
    let modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]);

    let modelMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "u_modelMatrix");
    gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);

    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}



function Update(gl: WebGLRenderingContext,)
{
    console.log("Update Call...");

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