import { GlobalWebGLItems } from '../renderer';
import { Shader } from '../shader-master';
import Time from '../time-manager';
import { Block, BlockType } from './block';
import * as glMatrix from 'gl-matrix'

const CHUNK_WIDTH: number = 8;
const CHUNK_HEIGHT: number = 8;
const CHUNK_DEPTH: number = 8;

// Vertex data structure for the mesh
interface Vertex {
    position: [number, number, number];
    normal: [number, number, number];
}

// List of possible face directions
const FaceDirections: { [key: string]: [number, number, number] } = {
    front: [0, 0, -1],
    back: [0, 0, 1],
    left: [-1, 0, 0],
    right: [1, 0, 0],
    top: [0, 1, 0],
    bottom: [0, -1, 0]
};

class Chunk {
    chunkBlocks: Block[][][];

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

    public Render(gl: WebGLRenderingContext, shader: Shader | null, verticiesBuffer : Vertex[]): void {
        if(shader == null) {console.error("Hey monkey, the shader is null in the chunk.render function"); return;}
        shader.use();

        // Setup uniforms
        shader.setUniform2f("u_resolution", gl.canvas.width, gl.canvas.height);
        shader.setUniform1f("u_time", Time.time);

        //Position Buffer
        const vertexBufferPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPos);
        /*
        const vertexBufferData = new Float32Array([
            0.5, 1.0, 0.0,  // Top vertex
            0.5, 0.5, 0.0,  // Bottom-left vertex
            1.0, 0.5, 0.0,   // Bottom-right vertex
            
            0.5, 1.0, 0.0,  // Top vertex
            1.0, 0.5, 0.0,   // Bottom-right vertex
            1.0, 1.0, 0.0,  // Top-right vertex

            0.5, 1.5, 0.0,  // Top vertex
            0.5, 1., 0.0,  // Bottom-left vertex
            1.0, 1., 0.0,   // Bottom-right vertex

            0.5, 1.5, 0.0,  // Top vertex
            1.0, 1., 0.0,   // Bottom-right vertex
            1.0, 1.5, 0.0,  // Top-right vertex
        ])
        gl.bufferData(gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW);
        */

        // Flatten the vertex data (positions and normals) into a Float32Array
        const flattenedVertices = flattenVertices(verticiesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flattenedVertices, gl.STATIC_DRAW);

        //Set up position attribute pointers for the mesh
        //const positionAttributeLocation = grassShader.getAttribLocation("a_position");
        shader.enableAttrib("a_position");
        //gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        const stride = 6 * Float32Array.BYTES_PER_ELEMENT; // Stride (3 for position + 3 for normal)
        shader.setAttribPointer("a_position", 3, gl.FLOAT, false, stride, 0);

        shader.enableAttrib("a_normal");
        shader.setAttribPointer("a_normal", 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);

        //Color Buffer
        const vertexColBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);

        const finalArray = [];
        //For every 9 verts put a new array of vert UVs (now doubled)
        for (let i = 0; i < verticiesBuffer.length; i += 18) {
            // Here you can process the chunk and generate 12 elements (whatever logic you need) (now doubled)
            // For example, if you want to push 12 elements, we can just simulate that (now doubled)
            const UV_QUAD = [
                0.0, 0.0, 0.0, 1.0, // Top-right vertex
                1.0, 0.0, 0.0, 1.0,  // Top-Left vertex
                0.0, 1.0, 0.0, 1.0, // Bottom-right vertex

                1.0, 0.0, 0.0, 1.0,  // Top vertex
                1.0, 1.0, 0.0, 1.0, // Bottom-left vertex
                0.0, 1.0, 0.0, 1.0, // Bottom-right vertex
            ]
        
            // Push the new 12 elements into the target array (now doubled)
            finalArray.push(...UV_QUAD);
        }

        const vertexColBufferData = new Float32Array(finalArray)
        gl.bufferData(gl.ARRAY_BUFFER, vertexColBufferData, gl.STATIC_DRAW);
        // Set up color attribute pointers for the mesh
        shader.enableAttrib("a_color");
        //gl.bindBuffer(gl.ARRAY_BUFFER, vertexColBuffer);    //I missed this and it gave me some big issues! Buffers must be binded before setting up the vertex attributes.
        shader.setAttribPointer("a_color", 4, gl.FLOAT, false,0,0);// 10 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);

        //MVP Matrix
        let modelMatrix = glMatrix.mat4.create();

        //Model Space TRS to world space
        //const s = Math.abs(Math.sin(Time.time*2)*.01 + 1.0);
        glMatrix.mat4.translate(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(-1.5, -1.5, -6)); //final pos
        //glMatrix.mat4.scale(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(s,s,s));
        //glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.sin(Time.time*4)*(3.14*0.001));
        glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.PI*0.1);
        glMatrix.mat4.translate(modelMatrix,modelMatrix, glMatrix.vec3.fromValues(-0.4-0.25,-0.9+ 0.275, 0.0)); // offset
        //You can try putting model matrix in the uniform itself to see it move in clipspace

        //Final MVP Matrix
        let mvpMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mvpMatrix, GlobalWebGLItems.Camera.projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
        glMatrix.mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

        shader.setUniformMatrix4fv("u_MVP", mvpMatrix);

        const triangleCounts = verticiesBuffer.length / (6 * 3); // Assuming 6 values per vertex (position + normal)
        gl.drawArrays(gl.TRIANGLES, 0, 3*verticiesBuffer.length/9); // Draw the triangles

        shader.disableAttrib("a_position");
        shader.disableAttrib("a_color");
        shader.disableAttrib("a_normal");
    }
}

// Function to check if a face should be generated
function shouldGenerateFace(blockType: BlockType, neighborType: BlockType): boolean {
    return blockType !== BlockType.Air && neighborType === BlockType.Air;
}

// Chunk Mesh Builder (Avoiding Inside Faces)
function buildChunkMesh(chunk: Chunk): Vertex[] {
    let vertices: Vertex[] = [];

    for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let y = 0; y < CHUNK_HEIGHT; y++) {
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const currentBlock = chunk.chunkBlocks[x][y][z];

                // Skip air blocks or empty spaces
                if (currentBlock.getBlockType() === BlockType.Air) {
                    continue;
                }

                // Front face (-Z)
                if (z === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y][z - 1].getBlockType())) {
                    vertices.push(...createFace(x, y, z, FaceDirections.front));
                }

                // Back face (+Z)
                if (z === CHUNK_DEPTH - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y][z + 1].getBlockType())) {
                    vertices.push(...createFace(x, y, z, FaceDirections.back));
                }

                // Left face (-X)
                if (x === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x - 1][y][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, FaceDirections.left));
                }

                // Right face (+X)
                if (x === CHUNK_WIDTH - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x + 1][y][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, FaceDirections.right));
                }

                // Top face (+Y)
                if (y === CHUNK_HEIGHT - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y + 1][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, FaceDirections.top));
                }

                // Bottom face (-Y)
                if (y === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y - 1][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, FaceDirections.bottom));
                }
            }
        }
    }
    return vertices;
}

// Helper function to create a face's vertices
function createFace(x: number, y: number, z: number, normal: [number, number, number]): Vertex[] {
    return [
        // First triangle (positions form one triangle)
        { position: [x, y, z], normal },
        { position: [x + 1, y, z], normal },
        { position: [x, y + 1, z], normal },

        // Second triangle (positions form second triangle)
        { position: [x + 1, y, z], normal },
        { position: [x + 1, y + 1, z], normal },
        { position: [x, y + 1, z], normal }
    ];
}

// Helper function to flatten vertex data into a Float32Array
function flattenVertices(vertices: Vertex[]): Float32Array {
    const flatArray: number[] = [];
    for (const vertex of vertices) {
        flatArray.push(...vertex.position);
        flatArray.push(...vertex.normal);
    }
    return new Float32Array(flatArray);
}

export { Chunk, Block, BlockType, buildChunkMesh };