import { GlobalWebGLItems } from "../renderer";
import * as glMatrix from "gl-matrix";

const gwi = GlobalWebGLItems;

class Chunk {
    chunkX: number;
    chunkY: number;
    chunkZ: number;
    chunkSize: number;
    blocks: number[];  // Assuming blocks are represented by numbers
    vertexBuffer: WebGLBuffer | null; // Define the vertex buffer type
    isDirty: boolean;
    vertexCount: number; // Placeholder for the actual number of vertices

    constructor(chunkX: number, chunkY: number, chunkZ: number, chunkSize: number = 16) {
        this.chunkX = chunkX;   // Assign the chunk's X position in the world
        this.chunkY = chunkY;   // Assign the chunk's Y position in the world
        this.chunkZ = chunkZ;   // Assign the chunk's Z position in the world
        this.chunkSize = chunkSize;  // Chunk size, default to 16x16x16

        this.blocks = new Array(this.chunkSize ** 3).fill(0);  // Initialize block data
        this.vertexBuffer = null; // For storing vertex data for rendering
        this.isDirty = true; // Marks the chunk as needing a rebuild
        this.vertexCount = 0; // Placeholder for the actual number of vertices
    }

    // Initialize the chunk
    Initialize() {
        this.blocks = new Array(this.chunkSize ** 3).fill(1);  // Fill 16x16x16 1D array with index 0
    }

    GetBlock(x: number, y: number, z: number) {
        const blockIndex = x + (y * this.chunkSize) + (z * this.chunkSize * this.chunkSize);
        return this.blocks[blockIndex]; 
    }

    SetBlock(x: number, y: number, z: number, block: number) {
        const blockIndex = x + (y * this.chunkSize) + (z * this.chunkSize * this.chunkSize);
        this.blocks[blockIndex] = block;
        this.isDirty = true;    // Mark the chunk as needing a rebuild
    }



    RebuildChunk() {
        if (!this.isDirty) return;

        // Estimate the maximum number of vertices required.
        const maxVertices = this.chunkSize * this.chunkSize * this.chunkSize * 6 * 6;
        let vertices = new Float32Array(maxVertices);
        let vertexIndex = 0;

        // Loop over all blocks in the chunk
        for (let x = 0; x < this.chunkSize; x++) {
            for (let y = 0; y < this.chunkSize; y++) {
                for (let z = 0; z < this.chunkSize; z++) {
                    let blockType = this.GetBlock(x, y, z);
                    if (blockType !== 0) { // Only render non-air blocks
                        vertexIndex = this.AddBlockFaces(x, y, z, blockType, vertices, vertexIndex);
                    }
                }
            }
        }

        // Trim the Float32Array to the actual number of vertices
        vertices = vertices.subarray(0, vertexIndex);

        // Create and bind vertex buffer
        if (!this.vertexBuffer) {
            this.vertexBuffer = gwi.GL.createBuffer();
        }

        gwi.GL.bindBuffer(gwi.GL.ARRAY_BUFFER, this.vertexBuffer);
        gwi.GL.bufferData(gwi.GL.ARRAY_BUFFER, vertices, gwi.GL.STATIC_DRAW);

        this.vertexCount = vertexIndex; // Update vertexCount with actual count

        this.isDirty = false; // Mark as rebuilt
    }

    RenderChunk(gl : WebGLRenderingContext, projectionMatrix : glMatrix.mat4) {
        if (!this.vertexBuffer) {console.error("Cannot render chunk vertex buffer is null"); return;}

        // Bind the vertex buffer containing the chunk's block faces
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        // Prepare the final model-view-projection matrix
        let finalMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(finalMatrix, projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);

        // Send the matrix to the shader
        gl.uniformMatrix4fv(GlobalWebGLItems.modelMatrixUniformLocation, false, finalMatrix);

        // Draw the chunk (assuming each block face is represented as quads or triangles)
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount); // Adjust the draw call based on your data
    }

    AddBlockFaces(
        x: number, 
        y: number, 
        z: number, 
        blockType: number,  //incase different types of blocks will render differently (slabs,stairs,lighting,tex etc)
        vertices: Float32Array,
        vertexIndex: number
    ): number {
        const blockSize = 0.5;

        // Top face
        if (this.GetBlock(x, y + 1, z) === 0) {
            const topFaceVertices = this.getTopFaceVertices(x, y, z, blockSize);
            vertices.set(topFaceVertices, vertexIndex);
            vertexIndex += topFaceVertices.length;
        }

        // Bottom face
        if (this.GetBlock(x, y - 1, z) === 0) {
            const bottomFaceVertices = this.getBottomFaceVertices(x, y, z, blockSize);
            vertices.set(bottomFaceVertices, vertexIndex);
            vertexIndex += bottomFaceVertices.length;
        }

        // Front face
        if (this.GetBlock(x, y, z + 1) === 0) {
            const frontFaceVertices = this.getFrontFaceVertices(x, y, z, blockSize);
            vertices.set(frontFaceVertices, vertexIndex);
            vertexIndex += frontFaceVertices.length;
        }

        // Back face
        if (this.GetBlock(x, y, z - 1) === 0) {
            const backFaceVertices = this.getBackFaceVertices(x, y, z, blockSize);
            vertices.set(backFaceVertices, vertexIndex);
            vertexIndex += backFaceVertices.length;
        }

        // Left face
        if (this.GetBlock(x - 1, y, z) === 0) {
            const leftFaceVertices = this.getLeftFaceVertices(x, y, z, blockSize);
            vertices.set(leftFaceVertices, vertexIndex);
            vertexIndex += leftFaceVertices.length;
        }

        // Right face
        if (this.GetBlock(x + 1, y, z) === 0) {
            const rightFaceVertices = this.getRightFaceVertices(x, y, z, blockSize);
            vertices.set(rightFaceVertices, vertexIndex);
            vertexIndex += rightFaceVertices.length;
        }

        return vertexIndex;
    }

    getTopFaceVertices(x: number, y: number, z: number, size: number) {
        return [
            x, y + size, z,  // Top-left
            x + size, y + size, z,  // Top-right
            x + size, y + size, z + size,  // Bottom-right
            x, y + size, z + size  // Bottom-left
        ];
    }

    getBottomFaceVertices(x: number, y: number, z: number, size: number) {
        return [
            x, y, z,  // Top-left
            x + size, y, z,  // Top-right
            x + size, y, z + size,  // Bottom-right
            x, y, z + size  // Bottom-left
        ];
    }

    getFrontFaceVertices(x: number, y: number, z: number, size: number) {
        return [
            x, y, z + size,  // Top-left
            x + size, y, z + size,  // Top-right
            x + size, y + size, z + size,  // Bottom-right
            x, y + size, z + size  // Bottom-left
        ];
    }

    getBackFaceVertices(x: number, y: number, z: number, size: number) {
        return [
            x, y, z,  // Top-left
            x + size, y, z,  // Top-right
            x + size, y + size, z,  // Bottom-right
            x, y + size, z  // Bottom-left
        ];
    }

    getLeftFaceVertices(x: number, y: number, z: number, size: number) {
        return [
            x, y, z,  // Top-left
            x, y, z + size,  // Top-right
            x, y + size, z + size,  // Bottom-right
            x, y + size, z  // Bottom-left
        ];
    }

    getRightFaceVertices(x: number, y: number, z: number, size: number) {
        return [
            x + size, y, z,  // Top-left
            x + size, y, z + size,  // Top-right
            x + size, y + size, z + size,  // Bottom-right
            x + size, y + size, z  // Bottom-left
        ];
    }
}

class ChunkManager {
    chunkSize: number;
    chunks: { [key: string]: Chunk };

    constructor(chunkSize: number = 16) {
        this.chunkSize = chunkSize;
        this.chunks = {}; // Store chunks using a key like "chunkX,chunkY,chunkZ"
    }

    // Retrieve or create a chunk based on chunk coordinates
    getChunk(chunkX: number, chunkY: number, chunkZ: number): Chunk {
        const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
        if (!this.chunks[chunkKey]) {
            const newChunk = new Chunk(chunkX, chunkY, chunkZ, this.chunkSize);
            newChunk.Initialize();
            this.chunks[chunkKey] = newChunk;
        }
        return this.chunks[chunkKey];
    }

    // Update all chunks (rebuild vertex data if needed)
    updateChunks(): void {
        for (const chunkKey in this.chunks) {
            const chunk = this.chunks[chunkKey];
            if (chunk.isDirty) {
                chunk.RebuildChunk();
            }
        }
    }

    // Render all visible chunks (using frustum culling)
    renderChunks(gl: WebGLRenderingContext, projectionMatrix: Float32Array): void {
        for (const chunkKey in this.chunks) {
            const chunk = this.chunks[chunkKey];
            if (this.isChunkVisible(chunk)) {
                chunk.RenderChunk(gl, projectionMatrix);
            }
        }
    }

    // Check if a chunk is within the camera's view (frustum culling)
    isChunkVisible(chunk: Chunk): boolean {
        // Perform a simple distance check or frustum culling (placeholder for now)
        return true; // Placeholder logic for visibility check
    }
}

export { Chunk, ChunkManager };
