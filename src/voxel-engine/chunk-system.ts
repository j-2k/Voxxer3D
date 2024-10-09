import { GlobalWebGLItems } from '../renderer';
import { Shader } from '../shader-master';
import Time from '../time-manager';
import { Block, BlockType } from './block';
import * as glMatrix from 'gl-matrix'

const CHUNK_WIDTH: number = 16;
const CHUNK_HEIGHT: number = 64;
const CHUNK_DEPTH: number = 16;

// Vertex data structure for the mesh
interface Vertex {
    position: [number, number, number];
    normal: [number, number, number];
}

// List of possible face directions
const FaceDirections = {
    front: [0, 0, -1],
    back: [0, 0, 1],
    left: [-1, 0, 0],
    right: [1, 0, 0],
    top: [0, 1, 0],
    bottom: [0, -1, 0]
}

class Chunk {
    private chunkBlocks: Block[][][];

    constructor() {
        // Create the blocks
        this.chunkBlocks = this.generateChunk();
    }

    generateChunk(): Block[][][] {
        const chunk = [];
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const plane = [];
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                const column = [];
                for (let z = 0; z < CHUNK_DEPTH; z++) {
                    if (y < 50) {
                        column.push(new Block(BlockType.Grass));  // Add solid block up to a certain height
                    } else {
                        column.push(new Block(BlockType.Air));    // Above that height, it's air
                    }
                }
                plane.push(column);
            }
            chunk.push(plane);
        }
        return chunk;
    }

    // Update method with delta time (dt)
    public Update(dt: number): void {
        // Update logic for the chunk, potentially involving block updates (isDirtyBoolean)
    }

    public Render(gl: WebGLRenderingContext, shader: Shader | null): void {
        if(shader == null) {console.error("Hey monkey, the shader is null in the chunk.render function"); return;}
        shader.use();

        // Setup uniforms
        shader.setUniform2f("u_resolution", gl.canvas.width, gl.canvas.height);
        shader.setUniform1f("u_time", Time.time);

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

        //MVP Matrix
        let modelMatrix = glMatrix.mat4.create();

        //Model Space TRS to world space
        const s = Math.abs(Math.sin(Time.time*2)*.1 + 1.0);
        //glMatrix.mat4.translate(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(.5, .5, .5)); //final pos
        glMatrix.mat4.scale(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(s,s,s));
        glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.sin(Time.time*4)*(3.14*0.1));
        glMatrix.mat4.translate(modelMatrix,modelMatrix, glMatrix.vec3.fromValues(-0.4-0.25,-0.9+ 0.275, 0.0)); // offset
        //You can try putting model matrix in the uniform itself to see it move in clipspace

        //Final MVP Matrix
        let mvpMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mvpMatrix, GlobalWebGLItems.Camera.projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
        glMatrix.mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

        shader.setUniformMatrix4fv("u_MVP", mvpMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        shader.disableAttrib("a_position");
        shader.disableAttrib("a_color");
    }
}

// Function to check if a face should be generated
function shouldGenerateFace(blockType: BlockType, neighborType: BlockType): boolean {
    return blockType !== BlockType.Air && neighborType === BlockType.Air;
}

export { Chunk, Block, BlockType };