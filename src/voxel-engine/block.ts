enum BlockType {
    Air,
    Grass,
    Dirt,
    // Add more block types as needed
}

class Block {
    private active: boolean;
    private blockType: BlockType;

    constructor() {
        this.active = false; // Default inactive
        this.blockType = BlockType.Air; // Default block type
    }
    
    // Check if block is active
    public isActive(): boolean {
        return this.active;
    }

    // Set the block as active/inactive
    public setActive(active: boolean): void {
        this.active = active;
    }

    // Optional getter/setter for block type if needed
    public getBlockType(): BlockType {
        return this.blockType;
    }

    public setBlockType(type: BlockType): void {
        this.blockType = type;
    }
}

export {
    Block,
    BlockType
}
