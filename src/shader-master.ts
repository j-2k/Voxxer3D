import ShaderUtilites from './renderer-utils';
import * as glmatrix from 'gl-matrix';

class Shader {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private uniforms: { [key: string]: WebGLUniformLocation } = {};
    private attributes: { [key: string]: number } = {};
    
    constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
        this.gl = gl;
        const shaderMat = ShaderUtilites.CreateShaderMaterial(gl,vertexSource, fragmentSource)
        if(shaderMat == null){
            throw new Error("Failed to create shader material inside the Shader class constructor...");
        }
        this.program = shaderMat;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    getUniformLocation(name: string): WebGLUniformLocation {
        if (this.uniforms[name] === undefined) {
            const location = this.gl.getUniformLocation(this.program, name);
            if (!location) throw new Error(`Cannot find uniform ${name}`);
            this.uniforms[name] = location;
        }
        return this.uniforms[name];
    }

        // Get and store attribute locations
    getAttribLocation(name: string): number {
        if (this.attributes[name] === undefined) {
            const location = this.gl.getAttribLocation(this.program, name);
            if (location === -1) throw new Error(`Cannot find attribute ${name}`);
            this.attributes[name] = location;
        }
        return this.attributes[name];
    }

    // Set uniforms (example for different types of uniforms)
    setUniformMatrix4fv(name: string, matrix: glmatrix.mat4) {
        const location = this.getUniformLocation(name);
        this.gl.uniformMatrix4fv(location, false, matrix);
    }

    setUniform1i(name: string, value: number) {
        const location = this.getUniformLocation(name);
        this.gl.uniform1i(location, value);
    }

    setUniform1f(name: string, value: number) {
        const location = this.getUniformLocation(name);
        this.gl.uniform1f(location, value);
    }

    setUniform2i(name: string, x: number, y: number) {
        const location = this.getUniformLocation(name);
        this.gl.uniform2i(location, x,y);
    }

    setUniform2f(name: string, x: number, y: number) {
        const location = this.getUniformLocation(name);
        this.gl.uniform2f(location, x,y);
    }

    // Enable vertex attributes
    enableAttrib(name: string) {
        const location = this.getAttribLocation(name);
        this.gl.enableVertexAttribArray(location);
    }

    // Disable vertex attributes
    disableAttrib(name: string) {
        const location = this.getAttribLocation(name);
        this.gl.disableVertexAttribArray(location);
    }

    // Bind attribute pointer
    setAttribPointer(name: string, size: number, type: number, normalized: boolean, stride: number, offset: number) {
        const location = this.getAttribLocation(name);
        this.gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
    }
    
}


export { Shader };

