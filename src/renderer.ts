import Time from './time-manager';
import * as glMatrix from "gl-matrix";
import Materials from './shader-materials';
import { Cube3D } from './shapes-data';
import { CameraManager } from './camera';
import { Shader } from './shader-master';
import Draw from './shapes-draw';
import { WorldChunkManager } from './voxel-engine/chunk-system';
import { ExtraDebugCanvas } from "./debug-canvas";
import debug from './debug-mode';

function EngineRenderer(gl : WebGLRenderingContext)
{
    GlobalWebGLItems.GL = gl;

    RenderingSettings(gl);
    
    Start(gl);
    
    UpdateCore(gl);
    
    ExtraDebugCanvas();
    StartDebuggers();
}

class GlobalWebGLItems{
    public static samplerUniformLocation : WebGLUniformLocation | null = null;
    public static modelMatrixUniformLocation : WebGLUniformLocation | null = null;

    public static Camera = {
        cameraPosition: new Float32Array([0, 8, -3]),  // Initial camera position
        cameraTarget: new Float32Array([0, 0, 0]),    // Camera target //CHECK THE CAMERA SCRIPT, THE YAW IS STARTING ON -90 DEGREES TO POINT IN THE -Z DIRECTION
        upDirection: new Float32Array([0, 1, 0]),      // Up direction
        viewMatrix : glMatrix.mat4.create(),
        projectionMatrix : glMatrix.mat4.create()
    };

    public static GL : WebGLRenderingContext;

    
    public static Shader2 : Shader | null;
    public static ShaderChunk : Shader;
    public static ShaderChunkBoundDebug: Shader;

    public static GrassBlock = {
        shader : null as Shader | null,
        vertexPosBuffer : null as WebGLBuffer | null,
        vertexColBuffer : null as WebGLBuffer | null,
    }

    //public static debugChunk = new Chunk(0,0);
    public static chunkManager : WorldChunkManager;// = new WorldChunkManager(10, 10); 
    public static atlasTextureToBind : WebGLTexture | null = null;


    public static SkyboxShader : Shader;
    public static skyboxVertBuffer : WebGLBuffer | null = null;
}

function TextureLoader(gl : WebGLRenderingContext){//, shaderProgram : WebGLProgram){
    GlobalWebGLItems.GrassBlock.shader?.use();

    //Create Texture Loader
    const grassTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);

    const grassImage = new Image();
    //grassImage.src = "/grassblock/Faithful-x64/side-faithful-grass.png";
    grassImage.src = "/grassblock/grass-atlas/GrassAtlas-256.png";

    grassImage.onload = () => 
    {
        gl.bindTexture(gl.TEXTURE_2D, grassTexture);

        // Flip the image's Y axis to match WebGL's coordinate system
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grassImage);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    // Bind the texture before drawing
    gl.activeTexture(gl.TEXTURE1);  // Activate texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    GlobalWebGLItems.GrassBlock.shader?.setUniform1i("u_texture", 1);
}

function AtlasTextureBinder(gl : WebGLRenderingContext){
    GlobalWebGLItems.ShaderChunk = new Shader(gl, Materials.Texture.vertexShader, Materials.Texture.fragmentShader);
    GlobalWebGLItems.ShaderChunk.use();

    const atlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);

    GlobalWebGLItems.atlasTextureToBind = atlasTexture;
    
    const atlasImageData = new Image();
    atlasImageData.src = "/datlastest_flip_y.png"

    atlasImageData.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);

        // Flip the image's Y axis to match WebGL's coordinate system
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // Upload the texture data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasImageData);

        // Configure texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        console.log("Atlas Texture Loaded...");
    }

    //GlobalWebGLItems.atlasTextureToBind = atlasTexture;
    // Bind the texture before drawing
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    GlobalWebGLItems.ShaderChunk.setUniform1i("u_texture", 2);
}

function StartBinders(gl : WebGLRenderingContext){//, shaderProgram : WebGLProgram){
    GlobalWebGLItems.GrassBlock.shader = GrassShaderInstance(gl);
    function GrassShaderInstance  (gl : WebGLRenderingContext)  {
        const grassShader : Shader = new Shader(gl, Materials.Unlit.vertexShader, Materials.Unlit.fragmentShader);
        if(grassShader == null){console.error("Failed to create grass shader in the start function of the renderer...");return null;}
        grassShader.use();
        const grassRef = GlobalWebGLItems.GrassBlock
    
        //Position Buffer
        grassRef.vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, grassRef.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Cube3D.vertexPosData, gl.STATIC_DRAW);
        grassShader.enableAttrib("a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, grassRef.vertexPosBuffer);
        grassShader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);
        
        //Color Buffer
        grassRef.vertexColBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, grassRef.vertexColBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Cube3D.uvPosData, gl.STATIC_DRAW);
        grassShader.enableAttrib("a_color");
        gl.bindBuffer(gl.ARRAY_BUFFER, grassRef.vertexColBuffer);    //I missed this and it gave me some big issues! Buffers must be binded before setting up the vertex attributes.
        grassShader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);
        return grassShader;
    }
    
    GlobalWebGLItems.Shader2 = Shader2Instance(gl);
    function Shader2Instance  (gl : WebGLRenderingContext)  {
        const shader : Shader = new Shader(gl, Materials.TestShader.vertexShader, Materials.TestShader.fragmentShader);
        if(!shader){console.error("Failed to create shader2 in the start function of the renderer...");return null;}
        shader.use();
        
        
        /*//MVP
        let modelMatrix = glMatrix.mat4.create();
        //glMatrix.mat4.translate(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(0.0, 0.0, -.1));
        //glMatrix.mat4.scale(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(0.2, 0.2, 0.2));
        GlobalWebGLItems.Shader2?.setUniformMatrix4fv("u_MVP", modelMatrix);
        //*/

        //Position Buffer
        const vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.6, 0.9, 0.0,  // Top vertex
        0.6, 0.6, 0.0,  // Bottom-left vertex
        0.9, 0.6, 0.0,   // Bottom-right vertex
        
        0.6, 0.9, 0.0,  // Top vertex
        0.9, 0.6, 0.0,   // Bottom-right vertex
        0.9, 0.9, 0.0,  // Top-right vertex
        ]), gl.STATIC_DRAW);

        // Set up position attribute pointers for the mesh
        //const positionAttributeLocation = grassShader.getAttribLocation("a_position");
        shader.enableAttrib("a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        shader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

        //Color Buffer
        const vertexColBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 1.0, 0.0, 1.0,  // Top vertex
            0.0, 0.0, 0.0, 1.0, // Bottom-left vertex
            1.0, 0.0, 0.0, 1.0, // Bottom-right vertex

            0.0, 1.0, 0.0, 1.0,  // Top-Left vertex
            1.0, 0.0, 0.0, 1.0, // Bottom-right vertex
            1.0, 1.0, 0.0, 1.0, // Top-right vertex
        ]), gl.STATIC_DRAW);

        // Set up color attribute pointers for the mesh
        shader.enableAttrib("a_color");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);    //I missed this and it gave me some big issues! Buffers must be binded before setting up the vertex attributes.
        shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

        GlobalWebGLItems.Shader2?.disableAttrib("a_position");
        GlobalWebGLItems.Shader2?.disableAttrib("a_color");
        return shader;
    }

    //const chunk = new Chunk();
    //chunk.Render(gl, GlobalWebGLItems.Shader2);

        
    /*
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
    */
}

function ShaderUniforms(gl : WebGLRenderingContext){//, shaderProgram : WebGLProgram){
    GlobalWebGLItems.GrassBlock.shader?.use();
    //Create Model Matrix
    let modelMatrix = glMatrix.mat4.create();
    const getModelUniform = GlobalWebGLItems.GrassBlock.shader?.getUniformLocation("u_modelMatrix")
    if (getModelUniform !== undefined) {
        GlobalWebGLItems.modelMatrixUniformLocation = getModelUniform;
    }
    GlobalWebGLItems.GrassBlock.shader?.setUniformMatrix4fv("u_modelMatrix", modelMatrix);
}

function Start(gl : WebGLRenderingContext)
{
    //Bind Buffers
    StartBinders(gl);

    SkyboxStart(gl);

    //Load Textures
    //const atlasTex = await LoadTexturePromise(gl, "/datlastest.png");
    //const grassTex = await LoadTexturePromise(gl, "/grassblock/grass-atlas/GrassAtlas-256.png");
    AtlasTextureBinder(gl);
    TextureLoader(gl);


    //Create Uniforms
    ShaderUniforms(gl);

    //Camera Uniforms
    CameraUniforms(gl);

    //Create Chunk Manager
    ChunkSetup(gl);
}

function ChunkSetup(gl: WebGLRenderingContext){
    GlobalWebGLItems.ShaderChunkBoundDebug = new Shader(gl, Materials.ChunkboundShader.vertexShader, Materials.ChunkboundShader.fragmentShader);
    //Moved to start binder
    GlobalWebGLItems.ShaderChunk = new Shader(gl, Materials.Texture.vertexShader, Materials.Texture.fragmentShader);
    if(GlobalWebGLItems.ShaderChunk == null) {console.error("Failed to create chunk shader in the Chunk Setup function of the renderer...");return;}
    const userInputSeed = "MyCustomSeed123";
    GlobalWebGLItems.chunkManager = new WorldChunkManager(4, userInputSeed);
    console.log('Your Seed is: [' + userInputSeed +']'+ '\n' + 'The Hashed world generation seed:', GlobalWebGLItems.chunkManager.seed );
}


function Update(gl: WebGLRenderingContext)
{
    console.log("Update Call...");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    CameraManager();

    RenderSkybox(gl);
    
    GrassRenderingManager(gl);

    
    {
        GlobalWebGLItems.Shader2?.use();
        // Setup uniforms
        GlobalWebGLItems.Shader2?.setUniform2f("u_resolution", gl.canvas.width, gl.canvas.height);
        GlobalWebGLItems.Shader2?.setUniform1f("u_time", Time.time);

        //Position Buffer
        const vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.4, 0.9, 0.0,  // Top vertex
        0.4, 0.4, 0.0,  // Bottom-left vertex
        0.9, 0.4, 0.0,   // Bottom-right vertex
        
        0.4, 0.9, 0.0,  // Top vertex
        0.9, 0.4, 0.0,   // Bottom-right vertex
        0.9, 0.9, 0.0,  // Top-right vertex
        ]), gl.STATIC_DRAW);

        // Set up position attribute pointers for the mesh
        //const positionAttributeLocation = grassShader.getAttribLocation("a_position");
        GlobalWebGLItems.Shader2?.enableAttrib("a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        GlobalWebGLItems.Shader2?.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

        //Color Buffer
        const vertexColBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 1.0, 0.0, 1.0,  // Top vertex
            0.0, 0.0, 0.0, 1.0, // Bottom-left vertex
            1.0, 0.0, 0.0, 1.0, // Bottom-right vertex

            0.0, 1.0, 0.0, 1.0,  // Top-Left vertex
            1.0, 0.0, 0.0, 1.0, // Bottom-right vertex
            1.0, 1.0, 0.0, 1.0, // Top-right vertex
        ]), gl.STATIC_DRAW);

        // Set up color attribute pointers for the mesh
        GlobalWebGLItems.Shader2?.enableAttrib("a_color");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);
        GlobalWebGLItems.Shader2?.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

        //MVP Matrix
        let modelMatrix = glMatrix.mat4.create();

        //Model Space TRS to world space
        const s = Math.abs(Math.sin(Time.time*2)*.5 + 1.0);
        glMatrix.mat4.translate(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(2.5, .5, -1.0)); //final pos
        glMatrix.mat4.scale(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(s,s,s));
        glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.sin(Time.time*4)*(3.14*0.25)+Math.PI);
        glMatrix.mat4.translate(modelMatrix,modelMatrix, glMatrix.vec3.fromValues(-0.4-0.25,-0.9+ 0.275, 0.0)); // offset
        //You can try putting model matrix in the uniform itself to see it move in clipspace

        //Final MVP Matrix
        let mvpMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mvpMatrix, GlobalWebGLItems.Camera.projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
        glMatrix.mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

        GlobalWebGLItems.Shader2?.setUniformMatrix4fv("u_MVP", mvpMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 6*1);

        //this isnt actually needed because the same exact attributes are being used in the grass shader, but i will keep it here for reference
        //GlobalWebGLItems.Shader2?.disableAttrib("a_position");
        //GlobalWebGLItems.Shader2?.disableAttrib("a_color");
    }

    GlobalWebGLItems.chunkManager.Render(gl, GlobalWebGLItems.ShaderChunk);

    DebugMode(true);
}


const GrassRenderingManager = (gl : WebGLRenderingContext) : void => {
    const grassRef = GlobalWebGLItems.GrassBlock;
    grassRef.shader?.use();
    
    //Position Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, grassRef.vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Cube3D.vertexPosData, gl.STATIC_DRAW);
    grassRef.shader?.enableAttrib("a_position");
    grassRef.shader?.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

    //Color Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, grassRef.vertexColBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Cube3D.uvPosData, gl.STATIC_DRAW);
    grassRef.shader?.enableAttrib("a_color");
    grassRef.shader?.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    Draw.DrawRotatingGrassBlock(gl, GlobalWebGLItems.Camera.projectionMatrix, glMatrix.vec3.fromValues(0, 0, 0));
    Draw.Draw4x4GrassBlocks(gl, GlobalWebGLItems.Camera.projectionMatrix);

    //I hope this is correct, the logic is after i finishing drawing I disable the attribs to set new ones in the new coming shader
    grassRef.shader?.disableAttrib("a_position");
    grassRef.shader?.disableAttrib("a_color");
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
    gl.depthFunc(gl.LESS);
    //gl.depthFunc(gl.LEQUAL);
}


function StartDebuggers(){
    const debugChunkCoords = GlobalWebGLItems.chunkManager.getPlayerChunkCoords(GlobalWebGLItems.Camera.cameraPosition);
    debug.Watch("Camera Chunk Position XZ", () => debugChunkCoords, { type: "number" ,formatter: (c) => JSON.parse(JSON.stringify(c[0] + " | " + c[1])) } );
    debug.Watch("Camera Position XYZ", () => GlobalWebGLItems.Camera.cameraPosition, { type: "number" ,formatter: (c) => JSON.parse(JSON.stringify(c[0].toFixed(2) + " | " + c[1].toFixed(2) + " | " + c[2].toFixed(2)) ) } );
    debug.Watch("Camera Target From Position XYZ", () => GlobalWebGLItems.Camera.cameraTarget, { type: "number" ,formatter: (c) => JSON.parse(JSON.stringify(c[0].toFixed(2) + " | " + c[1].toFixed(2) + " | " + c[2].toFixed(2)) ) } );
}

let futureTime = 0;
function DebugMode(showChunkBoundaries : boolean = false, fpsUpdateRate : number = 0.25)
{
    if (showChunkBoundaries) {GlobalWebGLItems.chunkManager.RenderChunkBoundaries(GlobalWebGLItems.GL, GlobalWebGLItems.ShaderChunkBoundDebug);}
    const fps = Time.GetFPS().toFixed(0);//.toFixed(2);
    
    if(futureTime < Time.time){
        futureTime = Time.time + fpsUpdateRate;
        debug.Watch("FPS (.25 update)", () => fps, {type: "number", formatter: (c) => JSON.parse(JSON.stringify(c))});
    }
    debug.Watch("Time.time", () => Time.time, {type: "number", formatter: (c) => JSON.parse(JSON.stringify(c.toFixed(2)))});
    //debug.Watch("FPS", () => fps, {type: "function", formatter: (c) => JSON.parse(JSON.stringify(c))});
}




export {
    EngineRenderer,
    GlobalWebGLItems
}

function CameraUniforms(gl: WebGLRenderingContext) {
        //Create View Matrix
        glMatrix.mat4.lookAt(GlobalWebGLItems.Camera.viewMatrix, GlobalWebGLItems.Camera.cameraPosition, GlobalWebGLItems.Camera.cameraTarget, GlobalWebGLItems.Camera.upDirection);
    
        //Prespective Projection
        const aspectRatio = gl.canvas.width / gl.canvas.height;
        const fovRADIAN = 70 * Math.PI / 180;
        glMatrix.mat4.perspective(GlobalWebGLItems.Camera.projectionMatrix, fovRADIAN, aspectRatio, 0.1, 100.0);
}

//old

/*
function LoadDebugChunk(gl : WebGLRenderingContext)
{
    GlobalWebGLItems.ShaderChunk?.use();
    const chunkDebug = GlobalWebGLItems.debugChunk;
    const chunkMesh = buildChunkMesh(chunkDebug);//CHUNK BUILDER IS NOW HAPPENING IN THE CHUNK INSTANCE ITSELF!
    GlobalWebGLItems.debugChunk.Render(gl, GlobalWebGLItems.ShaderChunk);
}
*/

function SkyboxStart(gl: WebGLRenderingContext) {
    GlobalWebGLItems.SkyboxShader = new Shader(gl, Materials.SkyboxShader.vertexShader, Materials.SkyboxShader.fragmentShader);
    GlobalWebGLItems.SkyboxShader.use();

    
  // Create a buffer for positions
  GlobalWebGLItems.skyboxVertBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, GlobalWebGLItems.skyboxVertBuffer);
    var positions = new Float32Array(
        [
          -1, -1, 
           1, -1, 
          -1,  1, 
          -1,  1,
           1, -1,
           1,  1,
        ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: 'cubemap/pos-x.jpg',
        },
        {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: 'cubemap/neg-x.jpg',
        },
        {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: 'cubemap/pos-y.jpg',
        },
        {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: 'cubemap/neg-y.jpg',
        },
        {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: 'cubemap/pos-z.jpg',
        },
        {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: 'cubemap/neg-z.jpg',
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512;
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        
        image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

function RenderSkybox(gl: WebGLRenderingContext) {
    if (!GlobalWebGLItems.SkyboxShader) return;
    GlobalWebGLItems.SkyboxShader.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, GlobalWebGLItems.skyboxVertBuffer);
    GlobalWebGLItems.SkyboxShader.enableAttrib("a_position");
    GlobalWebGLItems.SkyboxShader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    //I FIXED THE PREVIOUS CLUSTER FUCK LES GOOO
    //APPARENTLY ITS ALREADY INVERSED??????? WTF HOW 
    let copyViewMatrix = glMatrix.mat4.clone(GlobalWebGLItems.Camera.viewMatrix);

    // Remove translation by setting the translation components to zero
    copyViewMatrix[12] = 0;
    copyViewMatrix[13] = 0;
    copyViewMatrix[14] = 0;
    
    let viewDirectionProjectionMatrix = glMatrix.mat4.multiply(
        glMatrix.mat4.create(), 
        GlobalWebGLItems.Camera.projectionMatrix, 
        copyViewMatrix
    );
    
    let viewDirectionProjectionInverseMatrix = glMatrix.mat4.invert(
        glMatrix.mat4.create(), 
        viewDirectionProjectionMatrix
    );
    
    // Set the uniforms
    GlobalWebGLItems.SkyboxShader.setUniformMatrix4fv("u_viewDirectionProjectionInverse", viewDirectionProjectionInverseMatrix);

    // Tell the shader to use texture unit 0 for u_skybox
    // This is raising a uniform warning in the inspector idfk what to do about this so im leaving it commented out for now
    //GlobalWebGLItems.SkyboxShader.setUniform1f("u_skybox", 0);

    GlobalWebGLItems.SkyboxShader.setUniform1f("u_time", Time.time);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    gl.depthFunc(gl.LESS);
}