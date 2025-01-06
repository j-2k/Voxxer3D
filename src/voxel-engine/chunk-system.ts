import { GlobalWebGLItems } from '../renderer';
import { Shader } from '../shader-master';
import Time from '../time-manager';
import { Block, BlockType, setBlockUniforms } from './block';
import * as glMatrix from 'gl-matrix';

import { createNoise3D, NoiseFunction3D } from 'simplex-noise';
import seedrandom from 'seedrandom';

const CHUNK_WIDTH: number = 16;
const CHUNK_HEIGHT: number = 32;
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
        const heightBaseStrength = 0.5; // Higher values create taller mountains / Default Value is 1.0
        const heightDetailStrength = 0.2; // Higher values raise the entire terrain / Default Value is 0.2
        
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const plane = [];
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                const column = [];
                for (let z = 0; z < CHUNK_DEPTH; z++) {
                    // Get world coordinates
                    const worldX = x + this.position.x * CHUNK_WIDTH;
                    //const worldY = y + this.position.z * CHUNK_HEIGHT;
                    const worldZ = z + this.position.z * CHUNK_DEPTH;
                    
                    // Create base terrain height using larger scale noise
                    const baseHeight = WorldChunkManager.noise3D(
                        (worldX + seed) * 0.02, // Reduced frequency for smoother terrain
                        0,                      // Keep y at 0 for 2D noise
                        (worldZ + seed) * 0.02
                    ) * heightBaseStrength;
                    
                    // Add detail with another noise layer
                    const detail = WorldChunkManager.noise3D(
                        (worldX + seed) * 0.1,
                        0,
                        (worldZ + seed) * 0.1
                    ) * heightDetailStrength; // Reduce detail intensity
                    
                    // Combine noise layers
                    const combinedNoise = (baseHeight + detail);
                    
                    // Convert noise to height (scale up and shift to be mostly positive) & Limit max height to 3/4
                    const heightValue = (combinedNoise + 1) * 0.5 * (CHUNK_HEIGHT*0.75);
                    
                    const treeAmount = 0.83; //Good range is from 0.5 to 0.9, default is 0.8

                    let blockType: BlockType;

                    if (y === 0) {
                        blockType = z % 8;
                    } else {
                        // Above half, base it on height
                        blockType = y < heightValue ? BlockType.Grass : BlockType.Air;
                    }

                    

                    //Tree Generation Section
                    const treeRandom = WorldChunkManager.noise3D(
                        (worldX + seed) * .5,  // Increase the frequency multiplier
                        0, 
                        (worldZ + seed) * .5
                    );

                    if(blockType === BlockType.Air && treeRandom > treeAmount &&
                        //x ranges from 0 to 15, z ranges from 0 to 15 | Thus only check if it is in the middle section (a shit fix for leaves that overlap chunk bounds since i cbf finding a good implementation :D)
                        //x & z will not spawn a tree shaft on edge of chunks, offset to check within chunk boundary is offset by 2 (x & z range is 2 to 13 (0, 1 & 14, 15 excluded))
                        (x > 1 && x < CHUNK_WIDTH - 2 && z > 1 && z < CHUNK_DEPTH - 2) 
                    ){
                        const groundLevel = Math.floor(heightValue);
                        const treeHeight = Math.floor(3 + treeRandom * 4);
                        
                        // Wood trunk generation
                        if (y >= groundLevel && y < groundLevel + treeHeight) {
                            blockType = BlockType.Wood;
                        }
                        else if (y >= groundLevel + treeHeight && y < groundLevel + treeHeight + Math.abs(detail * 12))
                        {
                           blockType = BlockType.Leaves;
                        }
                    }

                    
                    //Final setters & pushing
                    setBlockUniforms(blockType,GlobalWebGLItems.ShaderChunk);
                    column.push(new Block(blockType));
                }
                plane.push(column);
            }
            chunk.push(plane);
        }
        
        //return chunk;

        //This part is so garbage, I need to find a way to just make it all in 1 pass but it feels so hacky and garbage, but this is worse and a quick implementation that idc about rn.

        // 2nd Pass Tree Leaves Generation
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_DEPTH; z++) {
                    // Check if the current block is a wood block
                    if (chunk[x][y][z].getBlockType() === BlockType.Wood) {
                        // Generate leaves in a sphere-like pattern around the wood block
                        const leafRadius = 2; // Adjust this for different leaf density
                        
                        for (let dx = -leafRadius; dx <= leafRadius; dx++) {
                            for (let dy = -leafRadius; dy <= leafRadius; dy++) {
                                for (let dz = -leafRadius; dz <= leafRadius; dz++) {
                                    // Calculate the actual coordinates
                                    const nx = x + dx;
                                    const ny = y + dy + 3;
                                    const nz = z + dz;

                                    // Check if the coordinates are within chunk bounds
                                    if (nx >= 0 && nx < CHUNK_WIDTH && 
                                        ny >= 0 && ny < CHUNK_HEIGHT && 
                                        nz >= 0 && nz < CHUNK_DEPTH) {
                                        
                                        // Calculate distance from the wood block center
                                        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                                        
                                        // Generate leaves in a sphere-like pattern
                                        // Use a distance-based probability to create a more natural look
                                        if (distance <= leafRadius && 
                                            chunk[nx][ny][nz].getBlockType() === BlockType.Air) {
                                            // Slight randomness to make it look more organic
                                            const leafProbability = 1 - (distance / leafRadius);
                                            
                                            if (Math.random() < leafProbability) {
                                                setBlockUniforms(BlockType.Leaves, GlobalWebGLItems.ShaderChunk);
                                                chunk[nx][ny][nz] = new Block(BlockType.Leaves);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return chunk;
        
        // Not needed but was used to create ring air blocks around the chunk
        let i = 0;
        const topLayerY = CHUNK_HEIGHT - 1;
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                if (x == 0 || x == CHUNK_WIDTH - 1 || z == 0 || z == CHUNK_DEPTH - 1) {
                    setBlockUniforms(i,GlobalWebGLItems.ShaderChunk);
                    chunk[x][topLayerY][z] = new Block(i);
                    i++;
                    if (i > 7) {
                        i = 0;
                    }
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

        // Bind the atlas texture to texture unit 1
        //I dont know if this was the correct fix but this shit was fucked, seems it has to be a uid for every texture even if its a diff shader? ig?
        //gl.activeTexture(gl.TEXTURE2);
        //gl.bindTexture(gl.TEXTURE_2D, GlobalWebGLItems.atlasTextureToBind);
        //shader.setUniform1i("u_texture", 2); // Tell shader to use texture unit 1

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
                const pX = x * size, pY = (y * size) - CHUNK_HEIGHT * size, pZ = z * size;

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

function createFace(
    x: number,
    y: number,
    z: number,
    direction: FaceDirectionKey,
    block: Block,
    size: number = 1
): Vertex[] {
    // Get the normal for the face based on its direction
    const normal = [...FaceDirections[direction]] as [number, number, number];
    
    // Retrieve the UV coordinates for the specific block and face
    const [texU, texV] = block.getTextureCoords(direction);

    // Define the face vertices based on the direction
    switch (direction) {
        case "front":
            return [
                { position: [x, y, z], normal, uv: [texU + 1, texV + 0] },          // Bottom-left
                { position: [x, y + size, z], normal, uv: [texU + 1, texV + 1] },  // Top-left
                { position: [x + size, y, z], normal, uv: [texU + 0, texV + 0] },  // Bottom-right

                { position: [x + size, y, z], normal, uv: [texU + 0, texV + 0] },  // Bottom-right
                { position: [x, y + size, z], normal, uv: [texU + 1, texV + 1] },  // Top-left
                { position: [x + size, y + size, z], normal, uv: [texU + 0, texV + 1] }, // Top-right
            ];
        case "back":
            return [
                { position: [x, y, z + size], normal, uv: [texU + 0, texV + 0] },  // Bottom-left
                { position: [x + size, y, z + size], normal, uv: [texU + 1, texV + 0] },  // Bottom-right
                { position: [x, y + size, z + size], normal, uv: [texU + 0, texV + 1] },  // Top-left

                { position: [x + size, y + size, z + size], normal, uv: [texU + 1, texV + 1] },  // Top-right
                { position: [x, y + size, z + size], normal, uv: [texU + 0, texV + 1] },  // Top-left
                { position: [x + size, y, z + size], normal, uv: [texU + 1, texV + 0] },  // Bottom-right
            ];
        case "left":
            return [
                { position: [x, y, z], normal, uv: [texU + 0, texV + 0] },  // Bottom-left
                { position: [x, y, z + size], normal, uv: [texU + 1, texV + 0] },  // Bottom-right
                { position: [x, y + size, z], normal, uv: [texU + 0, texV + 1] },  // Top-left

                { position: [x, y, z + size], normal, uv: [texU + 1, texV + 0] },  // Bottom-right
                { position: [x, y + size, z + size], normal, uv: [texU + 1, texV + 1] },  // Top-right
                { position: [x, y + size, z], normal, uv: [texU + 0, texV + 1] },  // Top-left
            ];
        case "right":
            return [
                { position: [x + size, y, z], normal, uv: [texU + 1, texV + 0] },  // Bottom-right
                { position: [x + size, y + size, z], normal, uv: [texU + 1, texV + 1] },  // Top-right
                { position: [x + size, y, z + size], normal, uv: [texU + 0, texV + 0] },  // Bottom-left

                { position: [x + size, y + size, z], normal, uv: [texU + 1, texV + 1] },  // Top-right
                { position: [x + size, y + size, z + size], normal, uv: [texU + 0, texV + 1] },  // Top-left
                { position: [x + size, y, z + size], normal, uv: [texU + 0, texV + 0] },  // Bottom-left
            ];
        case "top":
            return [
                { position: [x, y + size, z], normal, uv: [texU + 1, texV + 0] },  // Bottom-left
                { position: [x, y + size, z + size], normal, uv: [texU + 1, texV + 1] },  // Bottom-right
                { position: [x + size, y + size, z], normal, uv: [texU + 0, texV + 0] },  // Top-left

                { position: [x + size, y + size, z], normal, uv: [texU + 0, texV + 0] },  // Top-left
                { position: [x, y + size, z + size], normal, uv: [texU + 1, texV + 1] },  // Bottom-right
                { position: [x + size, y + size, z + size], normal, uv: [texU + 0, texV + 1] },  // Top-right
            ];
        case "bottom":
            return [
                { position: [x, y, z], normal, uv: [texU + 1, texV + 1] },  // Top-left
                { position: [x + size, y, z], normal, uv: [texU + 0, texV + 1] },  // Top-right
                { position: [x, y, z + size], normal, uv: [texU + 1, texV + 0] },  // Bottom-left

                { position: [x + size, y, z], normal, uv: [texU + 0, texV + 1] },  // Top-right
                { position: [x + size, y, z + size], normal, uv: [texU + 0, texV + 0] },  // Bottom-right
                { position: [x, y, z + size], normal, uv: [texU + 1, texV + 0] },  // Bottom-left
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
    static drawDistance: number;
    seed: number;
    static noise3D : NoiseFunction3D;

    public static ChangeDrawDistance(newDrawDistance: number): void
    {
        this.drawDistance = newDrawDistance;
    }

    constructor(_drawDistance: number = 4, inputSeed : number | string = Math.random() * 10000) {
        this.chunks = new Map();
        WorldChunkManager.drawDistance = _drawDistance;

        //hash the seed if its a string
        this.seed = typeof inputSeed === 'string' ? this.hashStringToNumber(inputSeed) : inputSeed;
        //maybe it was a bad idea to always make it a number... might change later
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

    //This rendering function the way its built is horrid in terms of optimization but keeping it for now
    public Render(gl: WebGLRenderingContext, shader: Shader): void {
        const [playerChunkX, playerChunkZ] = this.getPlayerChunkCoords(GlobalWebGLItems.Camera.cameraPosition);
        const halfDrawDistance = Math.floor(WorldChunkManager.drawDistance / 2);

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
                if (distance > WorldChunkManager.drawDistance * 2) {
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
            //Once the decimal value is retrieved it is added to the hash * by 31, 31 being a prime number it can reduce hash collisions
            //& offsets will be more unique. Then the hash is bitwise AND with 0xffffffff to keep it in the 32-bit range.
            //This will discard the most significant bit.
            hash = (hash * 31 + char) & 0xffffffff; // Keep it in the 32-bit range
        }
        return Math.abs(hash); // Ensure the hash is positive
    }


    //textOverlay6.textContent = "Camera in Chunk X: " + chunkX + " | Chunk Z: " + chunkZ;
    //const textOverlay6 = document.getElementById('textOverlay6') as HTMLElement;

    //These 2 chunk boundary drawing functions are unoptimized as shit and i cbf fixing them since im only using them for debugging so im leaving this as it is.
    //Dont use unless necessary to see chunk boundaries, this function is really unoptimized because of the multiple forloops it does for every single frame (if ur rend dist is high the webpage might explode :D).
    public RenderChunkBoundaries(gl: WebGLRenderingContext, shader: Shader): void {
        const [playerChunkX, playerChunkZ] = this.getPlayerChunkCoords(GlobalWebGLItems.Camera.cameraPosition);
        const halfDrawDistance = Math.floor(WorldChunkManager.drawDistance / 2);

        // Prepare shader for line rendering
        shader.use();
        gl.lineWidth(2.0); // Make boundaries more visible
        
        for (let x = playerChunkX - halfDrawDistance; x <= playerChunkX + halfDrawDistance; x++) {
            for (let z = playerChunkZ - halfDrawDistance; z <= playerChunkZ + halfDrawDistance; z++) {
                // Render chunk boundary lines
                this.renderChunkBoundary(gl, shader, x, z);
            }
        }

        // Reset to default line width
        gl.lineWidth(1.0);
    }

    private renderChunkBoundary(gl: WebGLRenderingContext, shader: Shader, chunkX: number, chunkZ: number): void {
        const CHUNK_WIDTH = 16;
        const CHUNK_DEPTH = 16;
        const CHUNK_SCALE = 0.5;

        // Calculate world-space chunk boundary coordinates
        const minX = chunkX * CHUNK_WIDTH * CHUNK_SCALE;
        const minZ = chunkZ * CHUNK_DEPTH * CHUNK_SCALE;
        const maxX = minX + (CHUNK_WIDTH * CHUNK_SCALE);
        const maxZ = minZ + (CHUNK_DEPTH * CHUNK_SCALE);
        //const y = -5; // Ground level, you might want to adjust this

        // Vertices for chunk boundary lines
        const boundaryVertices = [];
        const maxLines = 10;
        const offset = 0.5;

        for (let i = 0; i > -maxLines; i--) {
            const y = (i * offset) - 5;
            boundaryVertices.push(
                minX, y, minZ,  // Bottom-left
                maxX, y, minZ,  // Bottom-right
                maxX, y, minZ,  // Bottom-right
                maxX, y, maxZ,  // Top-right
                maxX, y, maxZ,  // Top-right
                minX, y, maxZ,  // Top-left
                minX, y, maxZ,  // Top-left
                minX, y, minZ,  // Back to bottom-left
            );
        }

        // Create a buffer for boundary lines
        const boundaryBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boundaryBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boundaryVertices), gl.STATIC_DRAW);

        // Set up position attribute
        shader.enableAttrib("a_position");
        shader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

        // Set a distinct color for chunk boundaries (bright green in this case)
        shader.setUniform4f("u_color", 1.0, 1.0, 1.0, 1.0); // Bright green with some transparency

        // MVP Matrix setup (similar to chunk rendering)
        let mvpMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mvpMatrix, GlobalWebGLItems.Camera.projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);

        shader.setUniformMatrix4fv("u_MVP", mvpMatrix);

        // Render lines
        gl.drawArrays(gl.LINES, 0, 8 * maxLines);

        // Clean up
        shader.disableAttrib("a_position");
        gl.deleteBuffer(boundaryBuffer);
    }
}

export { Chunk, Block, BlockType, buildChunkMesh, WorldChunkManager };