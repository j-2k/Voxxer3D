import { GlobalWebGLItems } from '../renderer';
import { Block, BlockType } from './block';
import * as glMatrix from 'gl-matrix'

class Chunk {
    static readonly CHUNK_SIZE = 16;
    public m_pBlocks: Block[][][]; // 3D array for blocks
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
            const s = GlobalWebGLItems.Shader2;

            this.vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);

            s?.enableAttrib("a_position");
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
            s?.setAttribPointer("a_position" ,3 ,gl.FLOAT,false ,3 * Float32Array.BYTES_PER_ELEMENT ,0);
            
            // Set up color attribute pointers for the mesh
            s?.enableAttrib("a_color");
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            s?.setAttribPointer("a_color", 3, gl.FLOAT, false, 0, 0);

            
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

    public render(gl: WebGLRenderingContext, viewMatrix: glMatrix.mat4, projectionMatrix: glMatrix.mat4): void {
        if (!this.vertexBuffer) return;
        const s = GlobalWebGLItems.Shader2;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        
        // Set up the model matrix for this chunk
        const modelMatrix = glMatrix.mat4.create(); // Implement this method to return a model matrix

        // Calculate MVP matrix
        const mvpMatrix = this.calculateMVP(modelMatrix, viewMatrix, projectionMatrix);

        // Pass MVP matrix to shader (assuming you have a shader program setup)
        s?.setUniformMatrix4fv("u_MVP", mvpMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind buffer after rendering
    }

    private calculateMVP(modelMatrix: glMatrix.mat4, viewMatrix: glMatrix.mat4, projectionMatrix: glMatrix.mat4): glMatrix.mat4 {
        const mvpMatrix = glMatrix.mat4.create(); // Assuming you're using gl-matrix or similar library
    
        // First multiply projection and view matrices
        const viewProjectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
    
        // Then multiply with model matrix
        glMatrix.mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);
    
        return mvpMatrix;
    }

    public update(dt: number): void {
        // Update logic for the chunk can be added here.
    }
}

export { Chunk, Block, BlockType };