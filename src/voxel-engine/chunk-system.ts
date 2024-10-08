import { GlobalWebGLItems } from '../renderer';
import { Block, BlockType } from './block';

class Chunk {
    static readonly CHUNK_SIZE = 16;
    private m_pBlocks: Block[][][]; // 3D array for blocks
    private vertexBuffer: WebGLBuffer | null = null;
    private vertexCount: number = 0;

    constructor() {
        this.m_pBlocks = new Array(Chunk.CHUNK_SIZE);
        for (let i = 0; i < Chunk.CHUNK_SIZE; i++) {
            this.m_pBlocks[i] = new Array(Chunk.CHUNK_SIZE);
            for (let j = 0; j < Chunk.CHUNK_SIZE; j++) {
                this.m_pBlocks[i][j] = new Array(Chunk.CHUNK_SIZE);
                // Initialize blocks (for example, air blocks)
                for (let k = 0; k < Chunk.CHUNK_SIZE; k++) {
                    this.m_pBlocks[i][j][k] = new Block(BlockType.Air); // Use an appropriate BlockType
                }
            }
        }
        this.generateGeometry();
    }

    private generateGeometry(): void {
        const vertices: number[] = [];
        const indices: number[] = [];
        const faceVertices: number[][][] = [
            // Front face
            [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]],
            // Back face
            [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]],
            // Left face
            [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]],
            // Right face
            [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]],
            // Top face
            [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]],
            // Bottom face
            [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]]
        ];

        for (let x = 0; x < Chunk.CHUNK_SIZE; x++) {
            for (let y = 0; y < Chunk.CHUNK_SIZE; y++) {
                for (let z = 0; z < Chunk.CHUNK_SIZE; z++) {
                  const block = this.m_pBlocks[x][y][z];
                  if (!block || block.getBlockType() === BlockType.Air)
                    continue; // Skip air blocks

                  const offsetX = x;
                  const offsetY = y;
                  const offsetZ = z;

                  // Check for visibility of each face
                  if (this.isFaceVisible(x + 1, y, z))
                    this.addFace(
                      vertices,
                      indices,
                      [faceVertices[0]], // Wrap in an array to make it a 3D array
                      offsetX + 0.5,
                      offsetY - 0.5,
                      offsetZ + 0.5
                    );

                  if (this.isFaceVisible(x - 1, y, z))
                    this.addFace(
                      vertices,
                      indices,
                      [faceVertices[2]], // Left face
                      offsetX - 0.5,
                      offsetY - 0.5,
                      offsetZ - 0.5
                    );

                  if (this.isFaceVisible(x, y + 1, z))
                    this.addFace(
                      vertices,
                      indices,
                      [faceVertices[4]], // Top face
                      offsetX - 0.5,
                      offsetY + 0.5,
                      offsetZ - 0.5
                    );

                  if (this.isFaceVisible(x, y - 1, z))
                    this.addFace(
                      vertices,
                      indices,
                      [faceVertices[5]], // Bottom face
                      offsetX - 0.5,
                      offsetY - 0.5,
                      offsetZ + 0.5
                    );

                  if (this.isFaceVisible(x, y, z + 1))
                    this.addFace(
                      vertices,
                      indices,
                      [faceVertices[3]], // Front face
                      offsetX - 0.5,
                      offsetY - 0.5,
                      offsetZ + 0.5
                    );

                  if (this.isFaceVisible(x, y, z - 1))
                    this.addFace(
                      vertices,
                      indices,
                      [faceVertices[1]], // Back face
                      offsetX - 0.5,
                      offsetY - 0.5,
                      offsetZ - 0.5
                    );
                }
            }
        }

        this.vertexCount = vertices.length /3;

        // Create buffers only if we have vertices to render
        if (vertices.length > 0) {
            const gl = GlobalWebGLItems.GL;

            this.vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);

            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0 ,3 ,gl.FLOAT,false ,3 * Float32Array.BYTES_PER_ELEMENT ,0);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
        }
    }

    private isFaceVisible(x: number,y: number,z: number): boolean {
        return (
          x < 0 || x >= Chunk.CHUNK_SIZE ||
          y < 0 || y >= Chunk.CHUNK_SIZE ||
          z < 0 || z >= Chunk.CHUNK_SIZE ||
          !this.m_pBlocks[x] || 
          !this.m_pBlocks[x][y] || 
          !this.m_pBlocks[x][y][z] ||
          this.m_pBlocks[x][y][z].getBlockType() === BlockType.Air
        );
    }

    private addFace(vertices: number[], indices: number[], faceVertices: number[][][], x: number, y: number, z: number): void {
        const startIndex = vertices.length / 3;
    
        // Since faceVertices is now a 3D array, we need to access the first element
        const face = faceVertices[0]; // Get the actual face vertices from the 3D array
    
        for (const vertex of face) {
            vertices.push(vertex[0] + x);
            vertices.push(vertex[1] + y);
            vertices.push(vertex[2] + z);
        }
    
        // Add indices for the two triangles that make up the face
        indices.push(startIndex + 2, startIndex + 1, startIndex + 3);
        indices.push(startIndex + 3, startIndex + 2, startIndex);
    }

    public render(gl: WebGLRenderingContext): void {
        if (!this.vertexBuffer) return;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        
        gl.drawArrays(gl.TRIANGLES ,0,this.vertexCount);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null); // Unbind buffer after rendering
    }

    public update(dt: number): void {
        // Update logic for the chunk can be added here.
    }
}

export { Chunk };