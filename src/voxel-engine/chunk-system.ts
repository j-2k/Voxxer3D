import { GlobalWebGLItems } from '../renderer';
import { Shader } from '../shader-master';
import Time from '../time-manager';
import { Block, BlockType } from './block';
import * as glMatrix from 'gl-matrix'

const CHUNK_WIDTH: number = 1;
const CHUNK_HEIGHT: number = 1;
const CHUNK_DEPTH: number = 1;

// Vertex data structure for the mesh
interface Vertex {
    position: [number, number, number];
    normal: [number, number, number];
    uv: [number, number]; // Add UV coordinates
}


// List of possible face directions (defined as a constant object)
const FaceDirections = {
    front: [0, 0, -1],
    back: [0, 0, 1],
    left: [-1, 0, 0],
    right: [1, 0, 0],
    top: [0, 1, 0],
    bottom: [0, -1, 0]
} as const;

type FaceDirectionKey = keyof typeof FaceDirections;

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
                    //for now always make grass
                    column.push(new Block(BlockType.Grass));
                    /*if (y < 50) {
                        column.push(new Block(BlockType.Grass));  // Add solid block up to a certain height
                    } else {
                        column.push(new Block(BlockType.Air));    // Above that height, it's air
                    }*/
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

    public Render(gl: WebGLRenderingContext, shader: Shader | null, verticiesBuffer : Vertex[] | null = null): void {
        if(shader == null) {console.error("Hey monkey, the shader is null in the chunk.render function"); return;}
        shader.use();

        // Setup uniforms
        shader.setUniform2f("u_resolution", gl.canvas.width, gl.canvas.height);
        shader.setUniform1f("u_time", Time.time);

        //Position Buffer
        const vertexBufferPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPos);

        //if(verticiesBuffer == null) {return;}
        //const vertBufferDataFlat = flattenVertices(verticiesBuffer);
        const cubeTrianglesWithNormalsAndUVs = new Float32Array([
            // Back Face (2 triangles)
            // Positions         // Normals          // UVs
            0.0, 0.0, 0.0,    0.0,  0.0, -1.0,    1.0, 0.0,  // Bottom-left-back
            1.0, 1.0, 0.0,    0.0,  0.0, -1.0,    0.0, 1.0,  // Top-right-back
            1.0, 0.0, 0.0,    0.0,  0.0, -1.0,    0.0, 0.0,  // Bottom-right-back

            0.0, 0.0, 0.0,    0.0,  0.0, -1.0,    1.0, 0.0,  // Bottom-left-back
            0.0, 1.0, 0.0,    0.0,  0.0, -1.0,    1.0, 1.0,  // Top-left-back
            1.0, 1.0, 0.0,    0.0,  0.0, -1.0,    0.0, 1.0,  // Top-right-back

        
            // Front Face (2 triangles)
            0.0, 0.0,  1.0,    0.0,  0.0,  1.0,    0.0, 0.0,  // Bottom-left-front
            1.0, 0.0,  1.0,    0.0,  0.0,  1.0,    1.0, 0.0,  // Bottom-right-front
            1.0, 1.0,  1.0,    0.0,  0.0,  1.0,    1.0, 1.0,  // Top-right-front
            0.0, 0.0,  1.0,    0.0,  0.0,  1.0,    0.0, 0.0,  // Bottom-left-front
            1.0, 1.0,  1.0,    0.0,  0.0,  1.0,    1.0, 1.0,  // Top-right-front
            0.0, 1.0,  1.0,    0.0,  0.0,  1.0,    0.0, 1.0,  // Top-left-front
        
            // Left Face (2 triangles)
            0.0, 0.0, 0.0,   -1.0,  0.0,  0.0,    0.0, 0.0,  // Bottom-left-back
            0.0, 0.0, 1.0,   -1.0,  0.0,  0.0,    1.0, 0.0,  // Bottom-left-front
            0.0, 1.0, 1.0,   -1.0,  0.0,  0.0,    1.0, 1.0,  // Top-left-front
            0.0, 0.0, 0.0,   -1.0,  0.0,  0.0,    0.0, 0.0,  // Bottom-left-back
            0.0, 1.0, 1.0,   -1.0,  0.0,  0.0,    1.0, 1.0,  // Top-left-front
            0.0, 1.0, 0.0,   -1.0,  0.0,  0.0,    0.0, 1.0,  // Top-left-back
        
            // Right Face (2 triangles)
            1.0, 0.0, 0.0,    1.0,  0.0,  0.0,    1.0, 0.0,  // Bottom-right-back
            1.0, 1.0, 1.0,    1.0,  0.0,  0.0,    0.0, 1.0,  // Top-right-front
            1.0, 0.0, 1.0,    1.0,  0.0,  0.0,    0.0, 0.0,  // Bottom-right-front

            1.0, 0.0, 0.0,    1.0,  0.0,  0.0,    1.0, 0.0,  // Bottom-right-back
            1.0, 1.0, 0.0,    1.0,  0.0,  0.0,    1.0, 1.0,  // Top-right-back
            1.0, 1.0, 1.0,    1.0,  0.0,  0.0,    0.0, 1.0,  // Top-right-front

        
            // Top Face (2 triangles)
            0.0, 1.0, 0.0,    0.0,  1.0,  0.0,    0.0, 0.0,  // Top-left-back
            1.0, 1.0, 1.0,    0.0,  1.0,  0.0,    1.0, 1.0,  // Top-right-front
            1.0, 1.0, 0.0,    0.0,  1.0,  0.0,    1.0, 0.0,  // Top-right-back

            0.0, 1.0, 0.0,    0.0,  1.0,  0.0,    0.0, 0.0,  // Top-left-back
            0.0, 1.0, 1.0,    0.0,  1.0,  0.0,    0.0, 1.0,  // Top-left-front
            1.0, 1.0, 1.0,    0.0,  1.0,  0.0,    1.0, 1.0,  // Top-right-front

        
            // Bottom Face (2 triangles)
            0.0, 0.0, 0.0,    0.0, -1.0,  0.0,    0.0, 0.0,  // Bottom-left-back
            1.0, 0.0, 0.0,    0.0, -1.0,  0.0,    1.0, 0.0,  // Bottom-right-back
            1.0, 0.0, 1.0,    0.0, -1.0,  0.0,    1.0, 1.0,  // Bottom-right-front
            0.0, 0.0, 0.0,    0.0, -1.0,  0.0,    0.0, 0.0,  // Bottom-left-back
            1.0, 0.0, 1.0,    0.0, -1.0,  0.0,    1.0, 1.0,  // Bottom-right-front
            0.0, 0.0, 1.0,    0.0, -1.0,  0.0,    0.0, 1.0   // Bottom-left-front
        ]);
        
        gl.bufferData(gl.ARRAY_BUFFER, cubeTrianglesWithNormalsAndUVs, gl.STATIC_DRAW);
        //console.log(cubeTrianglesWithNormalsAndUVs.length);
        /*const vertexBufferData = new Float32Array([
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
        gl.bufferData(gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW);*/
        
        // Flatten the vertex data (positions and normals) into a Float32Array
        //const flattenedVertices = flattenVertices(verticiesBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, flattenedVertices, gl.STATIC_DRAW);

        //Set up position attribute pointers for the mesh
        //const positionAttributeLocation = grassShader.getAttribLocation("a_position");
        shader.enableAttrib("a_position");
        shader.enableAttrib("a_uv"); // Ensure this is defined in your shader
        shader.enableAttrib("a_normal");
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPos);
        const stride = 8 * Float32Array.BYTES_PER_ELEMENT; // Stride (3 for position + 3 for normal)
        shader.setAttribPointer("a_position", 3, gl.FLOAT, false, stride, 0);
        shader.setAttribPointer("a_normal", 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        shader.setAttribPointer("a_uv", 2, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT); // 2 components for UVs

        //MVP Matrix
        let modelMatrix = glMatrix.mat4.create();

        //Model Space TRS to World space (Do All transformations under here before the Final MVP Matrix Stage!)
        glMatrix.mat4.translate(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(0,0,0)); //final pos
        glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.PI*-0.1);
        //Final MVP Matrix
        let mvpMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mvpMatrix, GlobalWebGLItems.Camera.projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
        glMatrix.mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
        
        //You can try putting model matrix in the uniform itself to see it move in clipspace
        shader.setUniformMatrix4fv("u_MVP", mvpMatrix);

        /*
        //Index Buffer
        const triIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIndexBuffer);
        const triIndices = new Uint16Array([
            // Back face (remains unchanged)
            0, 2, 1,  2, 0, 3,  // 0-1-2, 2-3-0
            // Front face (remains unchanged)
            4, 5, 6,  6, 7, 4,  // 4-5-6, 6-7-4
            // Left face (flipped)
            4, 3, 0,  3, 4, 7,  // 4-3-0, 3-4-7 (flipped from 4-0-3, 3-7-4)
            // Right face (flipped)
            1, 6, 5,  6, 1, 2,  // 1-6-5, 6-1-2 (flipped from 1-5-6, 6-2-1)
            // Top face (flipped)
            3, 6, 2,  6, 3, 7,  // 3-6-2, 6-3-7 (flipped from 3-2-6, 6-7-3)
            // Bottom face (flipped)
            4, 1, 5,  1, 4, 0   // 4-1-5, 1-4-0 (flipped from 4-5-1, 1-0-4)
        ]);
        */
        //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triIndices, gl.STATIC_DRAW);

        //Drawing mesh via indicies (Optimized for large meshes + no duplicated verticies)
        //gl.drawElements(gl.TRIANGLES ,triIndices.length, gl.UNSIGNED_SHORT, 0);
        //Wireframe rendering
        //gl.drawElements(gl.LINE_LOOP, triIndices.length, gl.UNSIGNED_SHORT, 0);

        //Old draw triangles method without indicies (bad for performance on large meshes, chunks would be fine but I want to learn indicies)
        //const triangleCounts = verticiesBuffer.length / (6 * 3); // Assuming 6 values per vertex (position + normal)
        //gl.drawArrays(gl.TRIANGLES, 0, 3*8); // Draw the triangles

        gl.drawArrays(gl.TRIANGLES, 0, 36);

        shader.disableAttrib("a_position");
        shader.disableAttrib("a_uv");
        shader.disableAttrib("a_normal");
    }
}

// Function to check if a face should be generated
function shouldGenerateFace(blockType: BlockType, neighborType: BlockType): boolean {
    return true;
    //return blockType !== BlockType.Air && neighborType === BlockType.Air;
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
                    vertices.push(...createFace(x, y, z, "front"));
                }

                // Back face (+Z)
                if (z === CHUNK_DEPTH - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y][z + 1].getBlockType())) {
                    vertices.push(...createFace(x, y, z, "back"));
                }

                // Left face (-X)
                if (x === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x - 1][y][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, "left"));
                }

                // Right face (+X)
                if (x === CHUNK_WIDTH - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x + 1][y][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, "right"));
                }

                // Top face (+Y)
                if (y === CHUNK_HEIGHT - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y + 1][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, "top"));
                }

                // Bottom face (-Y)
                if (y === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y - 1][z].getBlockType())) {
                    vertices.push(...createFace(x, y, z, "bottom"));
                }
            }
        }
    }
    return vertices;
}

let i = 0;
let onerun = true;

function createFaceVerts(x: number, y: number, z: number, direction: FaceDirectionKey): Vertex[] {
    
    if(onerun)  {
        console.log("CreateFace: " + direction + "Face: " + i);
        i++;
        if(i > 5) onerun = false;
    }
    
    const normal = [...FaceDirections[direction]] as [number, number, number]; // Convert to mutable tuple
    switch (direction) {
        case "front":
            return [
                { position: [x, y, z], normal, uv: [0, 0] },           // Bottom-left
                { position: [x + 1, y, z], normal, uv: [1, 0] },       // Bottom-right
                { position: [x, y + 1, z], normal, uv: [0, 1] },       // Top-left

                { position: [x + 1, y, z], normal, uv: [1, 0] },       // Bottom-right
                { position: [x + 1, y + 1, z], normal, uv: [1, 1] },   // Top-right
                { position: [x, y + 1, z], normal, uv: [0, 1] },       // Top-left
            ];
        case "back":
            return [
                { position: [x, y, z + 1], normal, uv: [0, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [1, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },

                { position: [x + 1, y + 1, z + 1], normal, uv: [1, 1] },
                { position: [x + 1, y, z + 1], normal, uv: [1, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },

            ];
        case "left":
            return [
                { position: [x, y, z], normal, uv: [0, 0] },
                { position: [x, y, z + 1], normal, uv: [0, 1] },
                { position: [x, y + 1, z], normal, uv: [1, 0] },

                { position: [x, y, z + 1], normal, uv: [0, 1] },
                { position: [x, y + 1, z + 1], normal, uv: [1, 1] },
                { position: [x, y + 1, z], normal, uv: [1, 0] },
            ];
        case "right":
            return [
                { position: [x + 1, y, z], normal, uv: [0, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },

                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z + 1], normal, uv: [1, 1] },
            ];
        case "top":
            return [
                { position: [x, y + 1, z], normal, uv: [0, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },

                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z + 1], normal, uv: [1, 1] },
            ];
        case "bottom":
            return [
                { position: [x, y, z], normal, uv: [0, 0] },
                { position: [x + 1, y, z], normal, uv: [1, 0] },
                { position: [x, y, z + 1], normal, uv: [0, 1] },

                { position: [x + 1, y, z], normal, uv: [1, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [1, 1] },
                { position: [x, y, z + 1], normal, uv: [0, 1] },
            ];
        default:
            return [];
    }
}

function createFace(x: number, y: number, z: number, direction: FaceDirectionKey): Vertex[] {
    
    if(onerun)  {
        console.log("CreateFace: " + direction + "Face: " + i);
        i++;
        if(i > 5) onerun = false;
    }
    
    const normal = [...FaceDirections[direction]] as [number, number, number]; // Convert to mutable tuple
    switch (direction) {
        case "front":
            return [
                { position: [x, y, z], normal, uv: [0, 0] },           // Bottom-left
                { position: [x + 1, y, z], normal, uv: [1, 0] },       // Bottom-right
                { position: [x, y + 1, z], normal, uv: [0, 1] },       // Top-left

                { position: [x + 1, y, z], normal, uv: [1, 0] },       // Bottom-right
                { position: [x + 1, y + 1, z], normal, uv: [1, 1] },   // Top-right
                { position: [x, y + 1, z], normal, uv: [0, 1] },       // Top-left
            ];
        case "back":
            return [
                { position: [x, y, z + 1], normal, uv: [0, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [1, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },

                { position: [x + 1, y + 1, z + 1], normal, uv: [1, 1] },
                { position: [x + 1, y, z + 1], normal, uv: [1, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },

            ];
        case "left":
            return [
                { position: [x, y, z], normal, uv: [0, 0] },
                { position: [x, y, z + 1], normal, uv: [0, 1] },
                { position: [x, y + 1, z], normal, uv: [1, 0] },

                { position: [x, y, z + 1], normal, uv: [0, 1] },
                { position: [x, y + 1, z + 1], normal, uv: [1, 1] },
                { position: [x, y + 1, z], normal, uv: [1, 0] },
            ];
        case "right":
            return [
                { position: [x + 1, y, z], normal, uv: [0, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },

                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z + 1], normal, uv: [1, 1] },
            ];
        case "top":
            return [
                { position: [x, y + 1, z], normal, uv: [0, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },

                { position: [x + 1, y + 1, z], normal, uv: [1, 0] },
                { position: [x, y + 1, z + 1], normal, uv: [0, 1] },
                { position: [x + 1, y + 1, z + 1], normal, uv: [1, 1] },
            ];
        case "bottom":
            return [
                { position: [x, y, z], normal, uv: [0, 0] },
                { position: [x + 1, y, z], normal, uv: [1, 0] },
                { position: [x, y, z + 1], normal, uv: [0, 1] },

                { position: [x + 1, y, z], normal, uv: [1, 0] },
                { position: [x + 1, y, z + 1], normal, uv: [1, 1] },
                { position: [x, y, z + 1], normal, uv: [0, 1] },
            ];
        default:
            return [];
    }
}



// Helper function to flatten vertex data into a Float32Array (by flatten we mean put all the data side by side in a long line!)
function flattenVertices(vertices: Vertex[]): Float32Array {
    const flatArray: number[] = [];
    for (const vertex of vertices) {
        flatArray.push(...vertex.position);
        flatArray.push(...vertex.normal);
        flatArray.push(...vertex.uv);
    }
    return new Float32Array(flatArray);
}


export { Chunk, Block, BlockType, buildChunkMesh };