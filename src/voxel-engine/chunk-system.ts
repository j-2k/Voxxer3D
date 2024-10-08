import { Block, BlockType } from './block';
import * as glMatrix from 'gl-matrix'

class Chunk {
    private static readonly CHUNK_SIZE: number = 16;
    private m_pBlocks: Block[][][];

    constructor() {
        // Create the blocks
        this.m_pBlocks = new Array(Chunk.CHUNK_SIZE);
        for (let i = 0; i < Chunk.CHUNK_SIZE; i++) {
            this.m_pBlocks[i] = new Array(Chunk.CHUNK_SIZE);
            for (let j = 0; j < Chunk.CHUNK_SIZE; j++) {
                this.m_pBlocks[i][j] = new Array(Chunk.CHUNK_SIZE);
                for (let k = 0; k < Chunk.CHUNK_SIZE; k++) {
                    this.m_pBlocks[i][j][k] = new Block();
                }
            }
        }
    }

    // Update method with delta time (dt)
    public Update(dt: number): void {
        // Update logic for the chunk, potentially involving block updates
    }

    // Render method, assuming you have a custom WebGL renderer
    public Render(pRenderer: any): void {
        // Rendering logic using pRenderer, which could be a WebGL renderer
    }
}

export { Chunk, Block, BlockType };