import { GlobalWebGLItems } from '../renderer';
import { Shader } from '../shader-master';
import Time from '../time-manager';
import { Block, BlockType } from './block';
import * as glMatrix from 'gl-matrix';

const CHUNK_WIDTH: number = 16;
const CHUNK_HEIGHT: number = 16;
const CHUNK_DEPTH: number = 16;

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
    flatMeshVerts: Float32Array;
    isDirty: boolean = false;

    constructor() {
        // Create the blocks
        this.chunkBlocks = this.generateChunk();
        this.flatMeshVerts = flattenVertices(buildChunkMesh(this));
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
                   // Math.random() > 0.5/*(0.1 + (y*0.15))*/ ? column.push(new Block(BlockType.Air)) : column.push(new Block(BlockType.Grass));
                    
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

    public Render(gl: WebGLRenderingContext, shader: Shader | null, translation :glMatrix.vec3): void {
        if(shader == null) {console.error("Hey monkey, the shader is null in the chunk.render function"); return;}
        shader.use();

        // Setup uniforms
        shader.setUniform2f("u_resolution", gl.canvas.width, gl.canvas.height);
        shader.setUniform1f("u_time", Time.time);

        //Position Buffer
        const vertexBufferPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPos);

        //const vertBufferDataFlat = flattenVertices(this.meshVerts);
        gl.bufferData(gl.ARRAY_BUFFER, this.flatMeshVerts, gl.STATIC_DRAW);

        //Set up position attribute pointers for the mesh
        shader.enableAttrib("a_position");
        shader.enableAttrib("a_uv"); // Ensure this is defined in your shader
        shader.enableAttrib("a_normal");
        const stride = 8 * Float32Array.BYTES_PER_ELEMENT; // Stride (3 for position + 3 for normal)
        shader.setAttribPointer("a_position", 3, gl.FLOAT, false, stride, 0);
        shader.setAttribPointer("a_normal", 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        shader.setAttribPointer("a_uv", 2, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT); // 2 components for UVs

        

        //MVP Matrix
        let modelMatrix = glMatrix.mat4.create();

        //Model Space TRS to World space (Do All transformations under here before the Final MVP Matrix Stage!)
        glMatrix.mat4.scale(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(.5,.5,.5));
        glMatrix.mat4.translate(modelMatrix, modelMatrix, translation); //final pos
        //glMatrix.mat4.rotateY(modelMatrix, modelMatrix, 0);//Math.PI*-0.1);

        //Final MVP Matrix
        let mvpMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mvpMatrix, GlobalWebGLItems.Camera.projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
        glMatrix.mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);    // MVPMATRIX * MODEL MATRIX - IS NEEDED IF YOU ARE DOING TRANSFORMATION, YOU CAN ACTUALLY JUST IGNORE THIS IF YOU DONT MOVE THE MODEL FROM ITS ORIGINAL VERT POS
                                                                        //you can test this by using the scale above and commenting out the model matrix multiplication

        //You can try putting model matrix in the uniform itself to see it move in clipspace
        shader.setUniformMatrix4fv("u_MVP", mvpMatrix);

        


        //Draw call
        //Mesh
        //Going into every single array & counting in the vert buffer would prob be a bad idea, so instead i came up with this,
        //const vb = 6 * (vertBufferDataFlat.length/8) / 6); //vb is to be put in the draw call but i noticed its just len/8
        gl.drawArrays(gl.TRIANGLES, 0, this.flatMeshVerts.length / 8);
        //Wireframe
        //gl.drawArrays(gl.LINES, 0, vertBufferDataFlat.length / 8);

        shader.disableAttrib("a_position");
        shader.disableAttrib("a_uv");
        shader.disableAttrib("a_normal");
        gl.deleteBuffer(vertexBufferPos);   //hmm... why does this work, when previosuly i had a worse implementation but I only added this since after doing
        //an optimization I started losing the webgl rendering context... adding this some how fixed it. Weird I have to call this manually though.
    }
}

// Function to check if a face should be generated
function shouldGenerateFace(blockType: BlockType, neighborType: BlockType): boolean {
    //return true;
    return blockType !== BlockType.Air && neighborType === BlockType.Air;
}

// Chunk Mesh Builder (Avoiding Inside Faces)
function buildChunkMesh(chunk: Chunk): Vertex[] {
    let vertices: Vertex[] = [];

    for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let y = 0; y < CHUNK_HEIGHT; y++) {
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const currentBlock = chunk.chunkBlocks[x][y][z];

                const size = 1;
                const pX = x * size, pY = (y * size) - CHUNK_HEIGHT*size, pZ = z * size;

                // Skip air blocks or empty spaces
                if (currentBlock.getBlockType() === BlockType.Air) {
                    continue;
                }

                // Front face (-Z)
                if (z === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y][z - 1].getBlockType())) {
                    if(z!==0){//testing inside chunk culling
                        vertices.push(...createFace(pX, pY, pZ, "front", size));
                    }
                }

                // Back face (+Z)
                if (z === CHUNK_DEPTH - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y][z + 1].getBlockType())) {
                    if(z!==CHUNK_DEPTH - 1){//testing inside chunk culling
                        vertices.push(...createFace(pX, pY, pZ, "back", size));
                    }
                }

                // Left face (-X)
                if (x === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x - 1][y][z].getBlockType())) {
                    vertices.push(...createFace(pX, pY, pZ, "left", size));
                }

                // Right face (+X)
                if (x === CHUNK_WIDTH - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x + 1][y][z].getBlockType())) {
                    vertices.push(...createFace(pX, pY, pZ, "right", size));
                }

                // Top face (+Y)
                if (y === CHUNK_HEIGHT - 1 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y + 1][z].getBlockType())) {
                    vertices.push(...createFace(pX, pY, pZ, "top", size));
                }

                // Bottom face (-Y)
                if (y === 0 || shouldGenerateFace(currentBlock.getBlockType(), chunk.chunkBlocks[x][y - 1][z].getBlockType())) {
                    vertices.push(...createFace(pX, pY, pZ, "bottom", size));
                }
            }
        }
    }
    return vertices;
}

let i = 0, onerun = true;
function createFace(x: number, y: number, z: number, direction: FaceDirectionKey, size: number = 1): Vertex[] {
    
    if(onerun)  {
        console.log("CreateFace: " + direction + "Face: " + i);
        i++;
        if(i > 5) onerun = false;
    }
    
    const normal = [...FaceDirections[direction]] as [number, number, number]; // Convert to mutable tuple
    switch (direction) {
        case "front":
            return [
                { position: [x, y, z], normal, uv: [1, 0] },           // Bottom-left
                { position: [x, y + size, z], normal, uv: [1, 1] },       // Top-left
                { position: [x + size, y, z], normal, uv: [0, 0] },       // Bottom-right
                

                { position: [x + size, y, z], normal, uv: [0, 0] },       // Bottom-right
                { position: [x, y + size, z], normal, uv: [1, 1] },       // Top-left
                { position: [x + size, y + size, z], normal, uv: [0, 1] },   // Top-right
                
            ];
        case "back":
            return [
                { position: [x, y, z + size], normal, uv: [0, 0] },
                { position: [x + size, y, z + size], normal, uv: [1, 0] },
                { position: [x, y + size, z + size], normal, uv: [0, 1] },

                { position: [x + size, y + size, z + size], normal, uv: [1, 1] },
                { position: [x, y + size, z + size], normal, uv: [0, 1] },
                { position: [x + size, y, z + size], normal, uv: [1, 0] },


            ];
        case "left":
            return [
                { position: [x, y, z], normal, uv: [0, 0] },
                { position: [x, y, z + size], normal, uv: [1, 0] },
                { position: [x, y + size, z], normal, uv: [0, 1] },

                { position: [x, y, z + size], normal, uv: [1, 0] },
                { position: [x, y + size, z + size], normal, uv: [1, 1] },
                { position: [x, y + size, z], normal, uv: [0, 1] },
            ];
        case "right":
            return [
                { position: [x + size, y, z], normal, uv: [1, 0] },
                { position: [x + size, y + size, z], normal, uv: [1, 1] },
                { position: [x + size, y, z + size], normal, uv: [0, 0] },
                

                { position: [x + size, y + size, z], normal, uv: [1, 1] },
                { position: [x + size, y + size, z + size], normal, uv: [0, 1] },
                { position: [x + size, y, z + size], normal, uv: [0, 0] },
                
            ];
        case "top":
            return [
                { position: [x, y + size, z], normal, uv: [1, 0] },
                { position: [x, y + size, z + size], normal, uv: [1, 1] },
                { position: [x + size, y + size, z], normal, uv: [0, 0] },

                { position: [x + size, y + size, z], normal, uv: [0, 0] },
                { position: [x, y + size, z + size], normal, uv: [1, 1] },
                { position: [x + size, y + size, z + size], normal, uv: [0, 1] },
            ];
        case "bottom":
            return [
                { position: [x, y, z], normal, uv: [1, 1] },
                { position: [x + size, y, z], normal, uv: [0, 1] },
                { position: [x, y, z + size], normal, uv: [1, 0] },

                { position: [x + size, y, z], normal, uv: [0, 1] },
                { position: [x + size, y, z + size], normal, uv: [0, 0] },
                { position: [x, y, z + size], normal, uv: [1, 0] },
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


export { Chunk, Block, BlockType, buildChunkMesh, WorldChunkManager };



class WorldChunkManager {
    chunks: Chunk[][]; // 2D array for holding chunks
    drawDistance: number; // How many chunks to render in each direction from the player

    constructor(worldWidth: number, worldDepth: number, _drawDistance: number = 3) {
        this.chunks = [];
        this.drawDistance = _drawDistance; // Default draw distance

        for (let x = 0; x < worldWidth; x++) {
            const chunkColumn = [];
            for (let z = 0; z < worldDepth; z++) {
                const chunk = new Chunk();
                chunkColumn.push(chunk);
            }
            this.chunks.push(chunkColumn);
        }

        console.log("CHUNK LEN " + this.chunks.length + "| CHUNK LEN-0 " + this.chunks[0].length + "|");
    }

    // Render all chunks in the world
    public Render(gl: WebGLRenderingContext, shader: Shader): void {
        for (let x = 0; x < this.chunks.length; x++) {
            for (let z = 0; z < this.chunks[x].length; z++) {
                const chunk = this.chunks[x][z];
                
                const chunkModelTransform = glMatrix.vec3.fromValues(x * CHUNK_WIDTH, 0, z * CHUNK_DEPTH);
                
                chunk.Render(gl, shader, chunkModelTransform);
            }
        }
    }

        // Function to get the chunk the player is currently in
    getPlayerChunkCoords(playerPosition: glMatrix.vec3): [number, number] {
        const chunkX = Math.floor(playerPosition[0] / CHUNK_WIDTH);
        const chunkZ = Math.floor(playerPosition[2] / CHUNK_DEPTH);
        return [chunkX, chunkZ];
    }
}
