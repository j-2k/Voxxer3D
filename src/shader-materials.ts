import Unlit_VERTEXSHADER from "./shaders/unlit/Unlit_VERTEXSHADER.glsl?raw";
import Unlit_FRAGMENTSHADER from "./shaders/unlit/Unlit_FRAGMENTSHADER.glsl?raw";

import Texture_VERTEXSHADER from "./shaders/texture/Texture_VERTEXSHADER.glsl?raw";
import Texture_FRAGMENTSHADER from "./shaders/texture/Texture_FRAGMENTSHADER.glsl?raw";


const Unlit = {
    vertexShader: Unlit_VERTEXSHADER,
    fragmentShader: Unlit_FRAGMENTSHADER
}

const Texture = {
    vertexShader: Texture_VERTEXSHADER,
    fragmentShader: Texture_FRAGMENTSHADER
}

// As you can see, if we add more imports, we need to create more objs & etc.
// It might be a good idea to create a function that automatically imports all shaders
// in the shaders folder and returns an obj with all of them. But thats not a big concern now.

//I will tackle this when I have more time.

const Materials = {
    Unlit,
    Texture/*,
    Shader3*/
}

export default Materials;