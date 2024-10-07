class Cube3D {          //Create Vertex Array
    static vertexPosData = new Float32Array([
        //Front
        -0.5,  0.5, 0.0,  // Top-left
        -0.5, -0.5, 0.0,  // Bottom-left
         0.5, -0.5, 0.0,  // Bottom-right
    
         0.5, -0.5, 0.0,  // Bottom-right
         0.5,  0.5, 0.0,  // Top-right
        -0.5,  0.5, 0.0,   // Top-left

        //Right
        0.5,  0.5, 0.0,  // Top-left of right
        0.5, -0.5, 0.0,  // Bottom-left of right
        0.5, -0.5, -1.0,  // Bottom-right of right
    
        0.5, -0.5, -1.0,  // Bottom-right of right
        0.5, 0.5, -1.0,  // Top-right of right
        0.5, 0.5, 0.0,   // Top-left of right

        //Back
        -0.5,  0.5, -1.0,  // Top-left 
        0.5, -0.5, -1.0,  // Bottom-right flipped front
        -0.5, -0.5, -1.0,  // Bottom-left flipped front
    
        0.5, -0.5, -1.0,  // Bottom-right
        -0.5,  0.5, -1.0,   // Top-left flipped front
        0.5,  0.5, -1.0,  // Top-right flipped front

        //Left
        -0.5,  0.5, -1.0,  // Top-left of Left
        -0.5, -0.5, -1.0,  // Bottom-left of Left
        -0.5, -0.5, 0.0,  // Bottom-right of Left

        -0.5, -0.5, 0.0,  // Bottom-right of Left
        -0.5, 0.5, 0.0,  // Top-right of Left
        -0.5, 0.5, -1.0,   // Top-left of Left

        //Hat
        -0.5,  0.5, -1.0,  // Top-left
        -0.5, 0.5, 0.0,  // Bottom-left
         0.5, 0.5, 0.0,  // Bottom-right
    
         0.5, 0.5, 0.0,  // Bottom-right
         0.5,  0.5, -1.0,  // Top-right
        -0.5,  0.5, -1.0,   // Top-left
        
        //Bottom
        -0.5,  -0.5, -1.0,  // Top-left
        0.5, -0.5, 0.0,  // Bottom-right
        -0.5, -0.5, 0.0,  // Bottom-left
    
         0.5, -0.5, 0.0,  // Bottom-right
         -0.5,  -0.5, -1.0,   // Top-left
         0.5,  -0.5, -1.0,  // Top-right
    ]);

    //Create Vertex Colors Array
    static uvPosData = new Float32Array([
        0.5, 1.0, 0.0, 1.0,   // Top-left (u, v)
        0.5, 0.5, 0.0, 1.0,   // Bottom-left (u, v)
        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)

        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)
        1.0, 1.0, 0.0, 1.0,   // Top-right (u, v)
        0.5, 1.0, 0.0, 1.0,    // Top-left (u, v)

        // 0.0, 1.0,

        0.5, 1.0, 0.0, 1.0,   // Top-left (u, v)
        0.5, 0.5, 0.0, 1.0,   // Bottom-left (u, v)
        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)

        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)
        1.0, 1.0, 0.0, 1.0,   // Top-right (u, v)
        0.5, 1.0, 0.0, 1.0,    // Top-left (u, v)

        // 0.0, 1.0,

        0.5, 1.0, 0.0, 1.0,   // Top-left (u, v)
        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)
        0.5, 0.5, 0.0, 1.0,   // Bottom-left (u, v)

        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)
        0.5, 1.0, 0.0, 1.0,    // Top-left (u, v)
        1.0, 1.0, 0.0, 1.0,   // Top-right (u, v)

        // 0.0, 1.0,

        0.5, 1.0, 0.0, 1.0,   // Top-left (u, v)
        0.5, 0.5, 0.0, 1.0,   // Bottom-left (u, v)
        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)

        1.0, 0.5, 0.0, 1.0,   // Bottom-right (u, v)
        1.0, 1.0, 0.0, 1.0,   // Top-right (u, v)
        0.5, 1.0, 0.0, 1.0,    // Top-left (u, v)

        // Hat

        0.0, 1.0, 0.0, 1.0,   // Top-left (u, v)
        0.0, 0.5, 0.0, 1.0,   // Bottom-left (u, v)
        0.5, 0.5, 0.0, 1.0,   // Bottom-right (u, v)

        0.5, 0.5, 0.0, 1.0,   // Bottom-right (u, v)
        0.5, 1.0, 0.0, 1.0,   // Top-right (u, v)
        0.0, 1.0, 0.0, 1.0,    // Top-left (u, v)

        // Bottom
        0.0, 0.5, 0.0, 1.0,   // Top-left (u, v)
        0.5, 0.0, 0.0, 1.0,   // Bottom-right (u, v)
        0.0, 0.0, 0.0, 1.0,   // Bottom-left (u, v)

        0.5, 0.0, 0.0, 1.0,   // Bottom-right (u, v)
        0.0, 0.5, 0.0, 1.0,    // Top-left (u, v)
        0.5, 0.5, 0.0, 1.0,   // Top-right (u, v)
    ]);
}

export { Cube3D };
