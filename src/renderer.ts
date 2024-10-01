import Time from './time-manager';
import * as glMatrix from "gl-matrix";
import ShaderUtilites from './renderer-utils';
import Materials from './shader-materials';
import { Cube3D } from './shapes-data';
import { CameraManager } from './camera';

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

    public static Camera = {
        cameraPosition: new Float32Array([0, 0, 1]),  // Initial camera position
        cameraTarget: new Float32Array([0, 0, 0]),    // Camera target
        upDirection: new Float32Array([0, 1, 0]),      // Up direction
        viewMatrix : glMatrix.mat4.create(),
    };
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


    gl.bufferData(gl.ARRAY_BUFFER, Cube3D.vertexPosData, gl.STATIC_DRAW);

    // --- Set up Vertex Attribute for Positions ---
    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Create Color Buffer
    const vertexColBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);


    gl.bufferData(gl.ARRAY_BUFFER, Cube3D.uvPosData, gl.STATIC_DRAW);

    // --- Set up Vertex Attribute for Colors ---
    const colorAttributeLocation = gl.getAttribLocation(shaderProgram, "a_color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);    //I missed this and it gave me some big issues! Buffers must be binded before setting up the vertex attributes.
    gl.vertexAttribPointer(colorAttributeLocation, 2, gl.FLOAT, false, 0, 0);


    //Create Texture Loader
    const grassTexture = gl.createTexture();
    GlobalWebGLItems.grassTexture = grassTexture; 
    
    const grassImage = new Image();
    //grassImage.src = "/grassblock/Faithful-x64/side-faithful-grass.png";
    grassImage.src = "/grassblock/grass-atlas/GrassAtlas-256.png";

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
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]); // not needed

    let modelMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "u_modelMatrix");
    GlobalWebGLItems.modelMatrixUniformLocation = modelMatrixUniformLocation;
    gl.uniformMatrix4fv(GlobalWebGLItems.modelMatrixUniformLocation, false, modelMatrix);

    //Create View Matrix
    let viewMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(viewMatrix, GlobalWebGLItems.Camera.cameraPosition, GlobalWebGLItems.Camera.cameraTarget, GlobalWebGLItems.Camera.upDirection);
    GlobalWebGLItems.Camera.viewMatrix = viewMatrix;
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
    //If orthographic view make sure the object is within the view of the camera, which is a cube between -1 and 1
    glMatrix.mat4.ortho(projectionMatrix, -aspectRatio, aspectRatio, -1, 1, -1, 1);
    
    //If prespective view make sure the object is behind the camera in the -z direction!
    const fovRADIAN = 70 * Math.PI / 180;
    glMatrix.mat4.perspective(projectionMatrix, fovRADIAN, aspectRatio, 0.1, 100.0);
    
    // View matrix (camera transformation)
    /*let viewMatrix = GlobalWebGLItems.Camera.viewMatrix;
    glMatrix.mat4.lookAt(viewMatrix, 
        GlobalWebGLItems.Camera.cameraPosition, 
        GlobalWebGLItems.Camera.cameraTarget, 
        GlobalWebGLItems.Camera.upDirection);*/
    CameraManager();

    // Model matrix (object transformation)
    let modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);//moving final pos in the world
    glMatrix.mat4.rotateX(modelMatrix, modelMatrix, (Math.sin(Time.time*2)*Math.PI*0.75)*0.25);
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, (3.14*0.3 + Time.time*0.5)*2);

    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0.5]); //First Centering offset

    // Final Model-View-Projection matrix
    let finalMatrix = glMatrix.mat4.create();
    glMatrix.mat4.multiply(finalMatrix, projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
    glMatrix.mat4.multiply(finalMatrix, finalMatrix, modelMatrix);
    gl.uniformMatrix4fv(GlobalWebGLItems.modelMatrixUniformLocation, false, finalMatrix);
    
    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6*6);

    const textOverlay = document.getElementById('textOverlay') as HTMLElement;
    textOverlay.textContent = `Camera Position: ${GlobalWebGLItems.Camera.cameraPosition[0].toFixed(2)}, ${GlobalWebGLItems.Camera.cameraPosition[1].toFixed(2)}, ${GlobalWebGLItems.Camera.cameraPosition[2].toFixed(2)}`;  
    
    const textOverlay2 = document.getElementById('textOverlay2') as HTMLElement;
    textOverlay2.textContent = `Camera Target: ${GlobalWebGLItems.Camera.cameraTarget[0].toFixed(2)}, ${GlobalWebGLItems.Camera.cameraTarget[1].toFixed(2)}, ${GlobalWebGLItems.Camera.cameraTarget[2].toFixed(2)}`;

    const textOverlay3 = document.getElementById('textOverlay3') as HTMLElement;
    textOverlay3.textContent = "FPS: " + Time.GetFPS().toFixed(2);
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
    EngineRenderer,
    GlobalWebGLItems
}