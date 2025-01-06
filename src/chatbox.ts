import { WorldChunkManager } from "./voxel-engine/chunk-system";

let isCMDBoxOpen = false;

function CMDBox() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === "Enter" && !isCMDBoxOpen) {
            // Open the CMD box
            isCMDBoxOpen = true;
            createCMDBox();
        } else if (event.key === "Enter" && isCMDBoxOpen) {
            // Handle the input and close the CMD box
            const cmdInput = document.getElementById('cmdInput') as HTMLInputElement;
            if (cmdInput) {
                const command = cmdInput.value;
                console.log("Command entered:", command);

                // Check for the /renderdistance command
                if (command.startsWith("/renderdistance")) {
                    const parts = command.split(" "); // Split the command into parts
                    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
                        const renderDistance = Number(parts[1]);
                        if (renderDistance > 16 || renderDistance < 1) {
                            console.log("Render distance must be at least 1 and at most 16");
                            return;
                        }
                        console.log("Render distance set to:", renderDistance);
                        WorldChunkManager.ChangeDrawDistance(renderDistance)
                        
                    } else {
                        console.log("Invalid command. Usage: /renderdistance <number>");
                    }
                } else {
                    console.log("Unknown command:", command);
                }
                
                closeCMDBox();
            }
        }
    });
}

function createCMDBox() {
    const existingBox = document.getElementById('cmdBox');
    if (!existingBox) {
        const cmdBox = document.createElement('div');
        cmdBox.id = 'cmdBox';
        cmdBox.className = 'cmdBox';
        cmdBox.innerHTML = '<input type="text" id="cmdInput" class="cmdInput" placeholder="Enter your command here...">';
        document.body.appendChild(cmdBox);

        // Apply styles directly
        cmdBox.style.position = 'absolute';
        cmdBox.style.bottom = '20px';
        cmdBox.style.right = '20px';
        cmdBox.style.backgroundColor = '#333';
        cmdBox.style.padding = '10px';
        cmdBox.style.borderRadius = '5px';
        cmdBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
        cmdBox.style.zIndex = '9999';

        const cmdInput = cmdBox.querySelector('.cmdInput') as HTMLInputElement;
        if (cmdInput) {
            cmdInput.style.width = '300px';
            cmdInput.style.padding = '5px';
            cmdInput.style.border = 'none';
            cmdInput.style.borderRadius = '3px';
            cmdInput.style.outline = 'none';
            cmdInput.style.fontFamily = 'mcfont'; // Use the custom font name defined in CSS
            cmdInput.style.fontSize = '16px';
        }

        // Focus on the input box for immediate typing
        const cmdInputElement = document.getElementById('cmdInput') as HTMLInputElement;
        if (cmdInputElement) cmdInputElement.focus();
    }
}


function closeCMDBox() {
    const cmdBox = document.getElementById('cmdBox');
    if (cmdBox) {
        cmdBox.remove(); // Remove the CMD box from the DOM
    }
    isCMDBoxOpen = false; // Update the state
}

export { CMDBox };
