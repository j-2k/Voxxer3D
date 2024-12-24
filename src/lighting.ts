import * as glm from 'gl-matrix';

class Light {

    private lightPosition: glm.vec3;
    private lightTarget: glm.vec3;
    private lightUp: glm.vec3;

    private lightViewMatrix: glm.mat4 = glm.mat4.create();
    private lightProjectionMatrix: glm.mat4 = glm.mat4.create();

    constructor(gl : WebGLRenderingContext, pos : glm.vec3, target : glm.vec3, up : glm.vec3) {
        this.lightPosition = pos;
        this.lightTarget = target;
        this.lightUp = up;

        this.lightViewMatrix = glm.mat4.lookAt(this.lightViewMatrix,this.lightPosition,this.lightTarget,this.lightUp);

        const aspectRatio = gl.canvas.width / gl.canvas.height;
        const fovRADIAN = 70 * Math.PI / 180;
        this.lightProjectionMatrix = glm.mat4.perspective(
            this.lightProjectionMatrix,
            fovRADIAN,
            aspectRatio,
            0.1,
            100.0
        );
    }

    public getLightPosition() : glm.vec3 {
        return this.lightPosition;
    }
    public getLightViewMatrix() : glm.mat4 {
        return this.lightViewMatrix;
    }
    public getLightProjectionMatrix() : glm.mat4 {
        return this.lightProjectionMatrix;
    }
}

export { Light };
