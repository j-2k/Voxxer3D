import { GlobalWebGLItems } from './renderer';
import * as glMatrix from 'gl-matrix';
import Time from './time-manager';


function DrawGrassBlock(gl: WebGLRenderingContext, projectionMatrix: glMatrix.mat4, finalPosition: glMatrix.vec3){
    // Model matrix (object transformation)
    let modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(modelMatrix, modelMatrix, finalPosition);   //moving final pos in the world
    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0.5]);     //First Centering offset
    
    // Final Model-View-Projection matrix
    let finalMatrix = glMatrix.mat4.create();
    glMatrix.mat4.multiply(finalMatrix, projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
    glMatrix.mat4.multiply(finalMatrix, finalMatrix, modelMatrix);
    gl.uniformMatrix4fv(GlobalWebGLItems.modelMatrixUniformLocation, false, finalMatrix);
    //this.gl.getUniformLocation(this.program, name);
    
    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6*6);
}

function IsBlockVisible(x:number, y:number, z:number) {
    // Check if this block is not fully surrounded by other blocks
    return !(
        x > 0 && x < 3 &&
        y > 0 && y < 3 &&
        z > 0 && z < 3
    );
}

function DrawRotatingGrassBlock(gl: WebGLRenderingContext, projectionMatrix: glMatrix.mat4, finalPosition: glMatrix.vec3, rotationSpeed: number = 2){
    // Model matrix (object transformation)
    let modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(modelMatrix, modelMatrix, finalPosition);   //moving final pos in the world
    glMatrix.mat4.rotateX(modelMatrix, modelMatrix, (Math.sin(Time.time*rotationSpeed)*Math.PI*0.75)*0.25);
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, (3.14*0.3 + Time.time*(rotationSpeed*0.25))*2);
    
    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.25, 0.25, 0.25]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0.5]);     //First Centering offset
    
    // Final Model-View-Projection matrix
    let finalMatrix = glMatrix.mat4.create();
    glMatrix.mat4.multiply(finalMatrix, projectionMatrix, GlobalWebGLItems.Camera.viewMatrix);
    glMatrix.mat4.multiply(finalMatrix, finalMatrix, modelMatrix);
    gl.uniformMatrix4fv(GlobalWebGLItems.modelMatrixUniformLocation, false, finalMatrix);
    
    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6*6);
}

function Draw4x4GrassBlocks(gl: WebGLRenderingContext, projectionMatrix: glMatrix.mat4){
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            for (let z = 0; z < 4; z++) {
                if (IsBlockVisible(x, y, z)) {
                    const extra = 1.5;
                    DrawGrassBlock(gl, projectionMatrix, glMatrix.vec3.fromValues(x*0.5-0.75-extra*2, (y*0.5)-2, (z*0.5)+extra));
                }
            }
        }
    }
}

const Draw = {
    DrawGrassBlock,
    DrawRotatingGrassBlock,
    Draw4x4GrassBlocks
}

export default Draw;