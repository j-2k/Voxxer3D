import Unlit_VERTEXSHADER from "./shaders/unlit/unlit_VERTEXSHADER.glsl?raw";
import Unlit_FRAGMENTSHADER from "./shaders/unlit/unlit_FRAGMENTSHADER.glsl?raw";

import Texture_VERTEXSHADER from "./shaders/texture/texture_VERTEXSHADER.glsl?raw";
import Texture_FRAGMENTSHADER from "./shaders/texture/texture_FRAGMENTSHADER.glsl?raw";

import TestShader_VERTEXSHADER from "./shaders/testshader/testshader_VERTEXSHADER.glsl?raw";
import TestShader_FRAGMENTSHADER from "./shaders/testshader/testshader_FRAGMENTSHADER.glsl?raw";

import SkyboxShader_VERTEXSHADER from "./shaders/skybox/skybox_VERTEXSHADER.glsl?raw";
import SkyboxShader_FRAGMENTSHADER from "./shaders/skybox/skybox_FRAGMENTSHADER.glsl?raw";

import Chunkbound_VERTEXSHADER from "./shaders/chunkbound/chunkbound_VERTEXSHADER.glsl?raw";
import Chunkbound_FRAGMENTSHADER from "./shaders/chunkbound/chunkbound_FRAGMENTSHADER.glsl?raw";

import Depth_VERTEXSHADER from "./shaders/depth/Depth_VERTEXSHADER.glsl?raw"
import Depth_FRAGMENTSHADER from "./shaders/depth/depth_FRAGMENTSHADER.glsl?raw";

const Unlit = {
    vertexShader: Unlit_VERTEXSHADER,
    fragmentShader: Unlit_FRAGMENTSHADER
}

const Texture = {
    vertexShader: Texture_VERTEXSHADER,
    fragmentShader: Texture_FRAGMENTSHADER
}

const TestShader = {
    vertexShader: TestShader_VERTEXSHADER,
    fragmentShader: TestShader_FRAGMENTSHADER
}

const SkyboxShader = {
    vertexShader: SkyboxShader_VERTEXSHADER,
    fragmentShader: SkyboxShader_FRAGMENTSHADER
}

const ChunkboundShader = {
    vertexShader: Chunkbound_VERTEXSHADER,
    fragmentShader: Chunkbound_FRAGMENTSHADER
}

const DepthShader = {
    vertexShader: Depth_VERTEXSHADER,
    fragmentShader: Depth_FRAGMENTSHADER
}

// As you can see, if we add more imports, we need to create more objs & etc.
// It might be a good idea to create a function that automatically imports all shaders
// in the shaders folder and returns an obj with all of them. But thats not a big concern now.

//I will tackle this when I have more time.

const Materials = {
    Unlit,
    Texture,
    TestShader,
    SkyboxShader,
    ChunkboundShader,
    DepthShader
}

export default Materials;