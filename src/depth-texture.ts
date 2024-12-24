import Materials from './shader-materials';
import { Shader } from './shader-master';

class DepthRenderer {
    private depthTexture : WebGLTexture | null = null;
    private depthFramebuffer : WebGLFramebuffer | null = null;
    private depthTextureSize : number;
    private depthShader : Shader | null = null;
    //private colorTexture : WebGLTexture | null = null;

    constructor(_depthTextureSize : number = 512) {
        this.depthTextureSize = _depthTextureSize;
    }

    public CreateDepthShader(gl : WebGLRenderingContext) : void{
        this.depthShader = new Shader(gl, Materials.DepthShader.vertexShader, Materials.DepthShader.fragmentShader);
        this.depthShader.use();
    }

    public GetDepthShader() : Shader | null{
        return this.depthShader;
    }

    public CreateDepthTexture(gl:WebGLRenderingContext) {
        const dtExtension = gl.getExtension("WEBGL_depth_texture");
        if (!dtExtension) {
            alert("Failed to retrieve the WEBGL_depth_texture in the constructor");
        }
    
        this.depthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.depthTextureSize,   // width
            this.depthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null                // data
        );              
    
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
             
        this.depthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.depthTexture,         // texture
            0                     // mip level
        );                   
    
            
    
        // create a color texture of the same size as the depth texture
        const colorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.depthTextureSize,
            this.depthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            colorTexture,          // texture
            0                      // mip level
        );
    }

    public DrawDepthBuffer(gl : WebGLRenderingContext) : void{
        if(this.depthTexture == null || this.depthFramebuffer == null){
            alert("Depth Texture or Framebuffer is null, CreateDepthTexture must be called first");
            return;
        }

        //FIRST DRAW TO DEPTH BUFFER
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
        gl.viewport(0,0,this.depthTextureSize,this.depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    public DrawColorBuffer(gl : WebGLRenderingContext) : void{
        if(this.depthTexture == null || this.depthFramebuffer == null){
            alert("Depth Texture or Framebuffer is null, CreateDepthTexture must be called first");
            return;
        }

        //DRAW TO COLOR BUFFER
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

}

const singletonInstance = new DepthRenderer();

export default singletonInstance;





