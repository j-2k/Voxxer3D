import {Shader} from './../shader-master';

// Define block materials and their properties
interface BlockProperties {
    name: string;
    solid: boolean;
    textureCoords: {
        top: [number, number];
        bottom: [number, number];
        left: [number, number];
        right: [number, number];
        front: [number, number];
        back: [number, number];
    };
}

// Enum for all block types
enum BlockType {
    Air = 0,
    Dirt = 1,
    Grass = 2,
    Stone = 3,
    Wood = 4,
    Leaves = 5,
    Sand = 6,
    Water = 7
}

const BLOCK_PROPERTIES: { [key in BlockType]: BlockProperties } = {
    [BlockType.Air]: {
        name: "Air",
        solid: false,
        textureCoords: {
            top: [0, 0],
            bottom: [0, 0],
            left: [0, 0],
            right: [0, 0],
            front: [0, 0],
            back: [0, 0]
        }
    },
    [BlockType.Dirt]: {
        name: "Dirt",
        solid: true,
        textureCoords: {
            top: [1, 0], // Cell 1 in Row 0
            bottom: [1, 0],
            left: [1, 0],
            right: [1, 0],
            front: [1, 0],
            back: [1, 0]
        }
    },
    [BlockType.Grass]: {
        name: "Grass",
        solid: true,
        textureCoords: {
            top: [0, 0],    // Cell 0 in Row 0 (Green top)
            bottom: [1, 0], // Cell 1 in Row 0 (Dirt bottom)
            left: [2, 0],   // Cell 2 in Row 0 (Grass side)
            right: [2, 0],
            front: [2, 0],
            back: [2, 0]
        }
    },
    [BlockType.Stone]: {
        name: "Stone",
        solid: true,
        textureCoords: {
            top: [3, 0], // Cell 3 in Row 0
            bottom: [3, 0],
            left: [3, 0],
            right: [3, 0],
            front: [3, 0],
            back: [3, 0]
        }
    },
    [BlockType.Wood]: {
        name: "Wood",
        solid: true,
        textureCoords: {
            top: [0, 1],    // Cell 0 in Row 1 (Top of log)
            bottom: [0, 1], // Cell 0 in Row 1 (Bottom of log)
            left: [1, 1],   // Cell 1 in Row 1 (Log side)
            right: [1, 1],
            front: [1, 1],
            back: [1, 1]
        }
    },
    [BlockType.Leaves]: {
        name: "Leaves",
        solid: true,
        textureCoords: {
            top: [2, 1], // Cell 2 in Row 1
            bottom: [2, 1],
            left: [2, 1],
            right: [2, 1],
            front: [2, 1],
            back: [2, 1]
        }
    },
    [BlockType.Sand]: {
        name: "Sand",
        solid: true,
        textureCoords: {
            top: [3, 1], // Cell 3 in Row 1
            bottom: [3, 1],
            left: [3, 1],
            right: [3, 1],
            front: [3, 1],
            back: [3, 1]
        }
    },
    [BlockType.Water]: {
        name: "Water",
        solid: false,
        textureCoords: {
            top: [0, 2], // Cell 0 in Row 2
            bottom: [0, 2],
            left: [0, 2],
            right: [0, 2],
            front: [0, 2],
            back: [0, 2]
        }
    }
};


class Block {
    private active: boolean;
    private blockType: BlockType;

    constructor(initialBlockType: BlockType = BlockType.Air) {
        this.active = false;
        this.blockType = initialBlockType;
    }

    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    public getBlockType(): BlockType {
        return this.blockType;
    }

    public setBlockType(type: BlockType): void {
        this.blockType = type;
    }

    // New methods to get block properties
    public getProperties(): BlockProperties {
        return BLOCK_PROPERTIES[this.blockType];
    }

    public isSolid(): boolean {
        return BLOCK_PROPERTIES[this.blockType].solid;
    }

    public getName(): string {
        return BLOCK_PROPERTIES[this.blockType].name;
    }

    public getTextureCoords(face: keyof BlockProperties['textureCoords']): [number, number] {
        return BLOCK_PROPERTIES[this.blockType].textureCoords[face];
    }
}

//const texOffsetLocation = gl.getUniformLocation(shaderProgram, "u_texOffset");
//const texScaleLocation = gl.getUniformLocation(shaderProgram, "u_texScale");

function setBlockUniforms(
    blockType: BlockType,
    shader: Shader
): void {
    shader.use();
    const texCoords = BLOCK_PROPERTIES[blockType].textureCoords.top;
    const numColumns = 4; // Example: Texture atlas has 16x16 cells
    const numRows = 4;

    const u = texCoords[0];
    const v = texCoords[1];

    const texOffset = [
        u / numColumns,   // Offset X
        v / numRows       // Offset Y
    ];

    const texScale = [
        1 / numColumns,   // Scale X
        1 / numRows       // Scale Y
    ];

    shader.setUniform2f("u_texOffset", texOffset[0], texOffset[1]);
    shader.setUniform2f("u_texScale", texScale[0], texScale[1]);
}

export type {
    BlockProperties
};

export {
    Block,
    BlockType,
    BLOCK_PROPERTIES,
    setBlockUniforms
};