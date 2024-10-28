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

// Block properties lookup table
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
            top: [2, 0],    // Assuming your texture atlas coordinates
            bottom: [2, 0],
            left: [2, 0],
            right: [2, 0],
            front: [2, 0],
            back: [2, 0]
        }
    },
    [BlockType.Grass]: {
        name: "Grass",
        solid: true,
        textureCoords: {
            top: [0, 0],    // Green top
            bottom: [2, 0],  // Dirt bottom
            left: [1, 0],    // Grass side
            right: [1, 0],
            front: [1, 0],
            back: [1, 0]
        }
    },
    [BlockType.Stone]: {
        name: "Stone",
        solid: true,
        textureCoords: {
            top: [3, 0],
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
            top: [4, 0],    // Top of log
            bottom: [4, 0],  // Bottom of log
            left: [4, 1],    // Side of log
            right: [4, 1],
            front: [4, 1],
            back: [4, 1]
        }
    },
    [BlockType.Leaves]: {
        name: "Leaves",
        solid: true,
        textureCoords: {
            top: [5, 0],
            bottom: [5, 0],
            left: [5, 0],
            right: [5, 0],
            front: [5, 0],
            back: [5, 0]
        }
    },
    [BlockType.Sand]: {
        name: "Sand",
        solid: true,
        textureCoords: {
            top: [6, 0],
            bottom: [6, 0],
            left: [6, 0],
            right: [6, 0],
            front: [6, 0],
            back: [6, 0]
        }
    },
    [BlockType.Water]: {
        name: "Water",
        solid: false,
        textureCoords: {
            top: [7, 0],
            bottom: [7, 0],
            left: [7, 0],
            right: [7, 0],
            front: [7, 0],
            back: [7, 0]
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

export type {
    BlockProperties
};

export {
    Block,
    BlockType,
    BLOCK_PROPERTIES
};