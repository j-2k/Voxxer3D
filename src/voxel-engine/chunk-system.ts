import { GlobalWebGLItems } from '../renderer';
import { Shader } from '../shader-master';
import Time from '../time-manager';
import { Block, BlockType } from './block';
import * as glMatrix from 'gl-matrix';

import { createNoise3D, NoiseFunction3D } from 'simplex-noise';
import seedrandom from 'seedrandom';

const CHUNK_WIDTH: number = 16;
const CHUNK_HEIGHT: number = 16;
const CHUNK_DEPTH: number = 16;
const CHUNK_SCALE: number = 0.5;

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
    position: { x: number, z: number };

    constructor(x: number, z: number, seed: number) {
        // Create the blocks
        this.position = { x, z };
        this.chunkBlocks = this.generateChunk(seed);
        this.flatMeshVerts = new Float32Array(0);
    }

    buildMesh(worldChunkManager: WorldChunkManager): void {
        this.flatMeshVerts = flattenVertices(buildChunkMesh(this, worldChunkManager));
        this.isDirty = false;
    }



    generateChunk(seed: number): Block[][][] {
        const chunk = [];
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const plane = [];
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                const column = [];
                for (let z = 0; z < CHUNK_DEPTH; z++) {
                    // Get world coordinates
                    const worldX = x + this.position.x * CHUNK_WIDTH;
                    const worldZ = z + this.position.z * CHUNK_DEPTH;
                    
                    // Create base terrain height using larger scale noise
                    const baseHeight = WorldChunkManager.noise3D(
                        (worldX + seed) * 0.02, // Reduced frequency for smoother terrain
                        0,                      // Keep y at 0 for 2D noise
                        (worldZ + seed) * 0.02
                    );
                    
                    // Add detail with another noise layer
                    const detail = WorldChunkManager.noise3D(
                        (worldX + seed) * 0.1,
                        0,
                        (worldZ + seed) * 0.1
                    ) * 0.2; // Reduce detail intensity
                    
                    // Combine noise layers
                    const combinedNoise = (baseHeight + detail);
                    
                    // Convert noise to height (scale up and shift to be mostly positive)
                    const heightValue = (combinedNoise + 1) * 0.5 * CHUNK_HEIGHT;
                    
                    // Fill blocks based on height
                    const blockType = y < heightValue ? BlockType.Dirt : BlockType.Air;
                    column.push(new Block(blockType));
                }
                plane.push(column);
            }
            chunk.push(plane);
        }
        
        return chunk;
        
        // Not needed but was used to create ring air blocks around the chunk
        const topLayerY = CHUNK_HEIGHT - 1;
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                if (x == 0 || x == CHUNK_WIDTH - 1 || z == 0 || z == CHUNK_DEPTH - 1) {
                    chunk[x][topLayerY][z] = new Block(BlockType.Air);
                }
            }
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
        glMatrix.mat4.scale(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(CHUNK_SCALE,CHUNK_SCALE,CHUNK_SCALE));
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
    return blockType !== BlockType.Air && neighborType === BlockType.Air;
}

function buildChunkMesh(chunk: Chunk, worldManager: WorldChunkManager): Vertex[] {
    let vertices: Vertex[] = [];

    for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let y = 0; y < CHUNK_HEIGHT; y++) {
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const currentBlock = chunk.chunkBlocks[x][y][z];

                const size = 1;
                const pX = x * size, pY = (y * size) - CHUNK_HEIGHT*size, pZ = z * size;

                if (currentBlock.getBlockType() === BlockType.Air) {
                    continue;
                }

                // Helper function to get block type from any position, including neighboring chunks
                const getNeighborBlockType = (localX: number, localY: number, localZ: number): BlockType => {
                    // Handle Y bounds normally since we don't cross chunks vertically
                    if (localY < 0 || localY >= CHUNK_HEIGHT) {
                        return BlockType.Air;
                    }

                    // If within current chunk bounds, use current chunk
                    if (localX >= 0 && localX < CHUNK_WIDTH && 
                        localZ >= 0 && localZ < CHUNK_DEPTH) {
                        return chunk.chunkBlocks[localX][localY][localZ].getBlockType();
                    }

                    // Calculate which chunk we need to look in
                    let neighborChunkX = chunk.position.x;
                    let neighborChunkZ = chunk.position.z;
                    let neighborX = localX;
                    let neighborZ = localZ;

                    // Adjust for crossing chunk boundaries
                    if (localX < 0) {
                        neighborChunkX--;
                        neighborX = CHUNK_WIDTH - 1;
                    } else if (localX >= CHUNK_WIDTH) {
                        neighborChunkX++;
                        neighborX = 0;
                    }

                    if (localZ < 0) {
                        neighborChunkZ--;
                        neighborZ = CHUNK_DEPTH - 1;
                    } else if (localZ >= CHUNK_DEPTH) {
                        neighborChunkZ++;
                        neighborZ = 0;
                    }

                    return worldManager.getNeighborBlockType(
                        neighborChunkX, 
                        neighborChunkZ, 
                        neighborX, 
                        localY, 
                        neighborZ
                    );
                };

                // Check faces
                if (shouldGenerateFace(currentBlock.getBlockType(), getNeighborBlockType(x - 1, y, z))) {
                    vertices.push(...createFace(pX, pY, pZ, "left", currentBlock, size));
                }
                if (shouldGenerateFace(currentBlock.getBlockType(), getNeighborBlockType(x + 1, y, z))) {
                    vertices.push(...createFace(pX, pY, pZ, "right", currentBlock, size));
                }
                if (shouldGenerateFace(currentBlock.getBlockType(), getNeighborBlockType(x, y, z - 1))) {
                    vertices.push(...createFace(pX, pY, pZ, "front", currentBlock, size));
                }
                if (shouldGenerateFace(currentBlock.getBlockType(), getNeighborBlockType(x, y, z + 1))) {
                    vertices.push(...createFace(pX, pY, pZ, "back", currentBlock, size));
                }
                if (shouldGenerateFace(currentBlock.getBlockType(), getNeighborBlockType(x, y + 1, z))) {
                    vertices.push(...createFace(pX, pY, pZ, "top", currentBlock, size));
                }
                if (shouldGenerateFace(currentBlock.getBlockType(), getNeighborBlockType(x, y - 1, z))) {
                    vertices.push(...createFace(pX, pY, pZ, "bottom", currentBlock, size));
                }
            }
        }
    }
    return vertices;
}

function createFace(x: number, y: number, z: number, direction: FaceDirectionKey, block: Block, size: number = 1): Vertex[] {
    const normal = [...FaceDirections[direction]] as [number, number, number];
    const [texU, texV] = block.getTextureCoords(direction);

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


class WorldChunkManager {
    chunks: Map<string, Chunk>;
    drawDistance: number;
    seed: number;
    static noise3D : NoiseFunction3D;

    constructor(_drawDistance: number = 4, inputSeed : number | string = Math.random() * 10000) {
        this.chunks = new Map();
        this.drawDistance = _drawDistance;

        //hash the seed if its a string
        this.seed = typeof inputSeed === 'string' ? this.hashStringToNumber(inputSeed) : inputSeed;
        const rng = seedrandom(this.seed);
        WorldChunkManager.noise3D = createNoise3D(rng);
    }

    private getChunkKey(x: number, z: number): string {
        return `${x},${z}`;
    }

    getChunkAt(x: number, z: number, buildMeshImmediately: boolean = false): Chunk | null {
        const key = this.getChunkKey(x, z);
        if (!this.chunks.has(key)) {
            // Create new chunk if it doesn't exist
            const chunk = new Chunk(x, z, this.seed);
            this.chunks.set(key, chunk);
            if (buildMeshImmediately) {
                chunk.buildMesh(this);
            }
        }
        return this.chunks.get(key) || null;
    }

    getNeighborBlockType(chunkX: number, chunkZ: number, localX: number, localY: number, localZ: number): BlockType {
        const chunk = this.getChunkAt(chunkX, chunkZ, false);
        if (!chunk || localY < 0 || localY >= CHUNK_HEIGHT) {
            return BlockType.Air;
        }
        try {
            return chunk.chunkBlocks[localX][localY][localZ].getBlockType();
        } catch (e) {
            return BlockType.Air;
        }
    }

    public Render(gl: WebGLRenderingContext, shader: Shader): void {
        const [playerChunkX, playerChunkZ] = this.getPlayerChunkCoords(GlobalWebGLItems.Camera.cameraPosition);
        const halfDrawDistance = Math.floor(this.drawDistance / 2);

        // Keep track of chunks that are currently visible
        const visibleChunkKeys = new Set<string>();
    
        // First pass: Create all chunks without building meshes
        for (let x = playerChunkX - halfDrawDistance; x <= playerChunkX + halfDrawDistance; x++) {
            for (let z = playerChunkZ - halfDrawDistance; z <= playerChunkZ + halfDrawDistance; z++) {
                const key = this.getChunkKey(x, z);
                visibleChunkKeys.add(key);
                
                // Create chunk if it doesn't exist
                this.getChunkAt(x, z, false);
            }
        }

        // Second pass: Build meshes now that all neighbor chunks exist
        for (let x = playerChunkX - halfDrawDistance; x <= playerChunkX + halfDrawDistance; x++) {
            for (let z = playerChunkZ - halfDrawDistance; z <= playerChunkZ + halfDrawDistance; z++) {
                const chunk = this.getChunkAt(x, z, false);
                if (chunk && !chunk.flatMeshVerts.length) {  // Only build mesh if it hasn't been built
                    chunk.buildMesh(this);
                }
            }
        }

        // Third pass: Render the chunks
        for (let x = playerChunkX - halfDrawDistance; x <= playerChunkX + halfDrawDistance; x++) {
            for (let z = playerChunkZ - halfDrawDistance; z <= playerChunkZ + halfDrawDistance; z++) {
                const chunk = this.getChunkAt(x, z, false);
                if (chunk) {
                    const chunkModelTransform = glMatrix.vec3.fromValues(
                        x * CHUNK_WIDTH, 
                        0, 
                        z * CHUNK_DEPTH
                    );
                    chunk.Render(gl, shader, chunkModelTransform);
                }
            }
        }
            
        // Clean up chunks that are too far away
        for (const [key, chunk] of this.chunks) {
            if (!visibleChunkKeys.has(key)) {
                const [x, z] = key.split(',').map(Number);
                const distance = Math.max(
                    Math.abs(x - playerChunkX),
                    Math.abs(z - playerChunkZ)
                );
                if (distance > this.drawDistance * 2) {
                    this.chunks.delete(key);
                }
            }
        }
    }

    // Helper method to get the chunk coordinates of the player
    getPlayerChunkCoords(playerPosition: glMatrix.vec3): [number, number] {
        const chunkX = Math.floor(playerPosition[0] / (CHUNK_WIDTH * CHUNK_SCALE));
        const chunkZ = Math.floor(playerPosition[2] / (CHUNK_DEPTH * CHUNK_SCALE));
        return [chunkX, chunkZ];
    }

    // Method to hash a string into a number
    private hashStringToNumber(input: string): number {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            //https://en.wikipedia.org/wiki/List_of_Unicode_characters
            //each character in the input string will be parsed to a number
            //you can find the decimal value for each character in the link above!
            const char = input.charCodeAt(i);

            //I will try to explain this hash & wtf goin on
            //Once the decimal value is retrieved it is added to the hash * by 31, 31 being a prime number
            hash = (hash * 31 + char) & 0xffffffff; // Keep it in the 32-bit range
        }
        return Math.abs(hash); // Ensure the hash is positive
    }
}

//textOverlay6.textContent = "Camera in Chunk X: " + chunkX + " | Chunk Z: " + chunkZ;
//const textOverlay6 = document.getElementById('textOverlay6') as HTMLElement;

export { Chunk, Block, BlockType, buildChunkMesh, WorldChunkManager };