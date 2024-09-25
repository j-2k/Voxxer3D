# WebGL Hello World - Template Project
This section is still underconstruction, this repository is generated from another repository where I learned WebGL!

# Project Requirement Notes
- Have nodejs & npm
  1. Download nodejs & npm (nvm is better than using nodejs installer!)
    - nvm (use nvm to download nodejs!) > https://github.com/nvm-sh/nvm
    - nodejs (I suggest use nvm to install nodejs!) > https://nodejs.org/en
    - npm > https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
  2. Check if you downloaded them properly by doing the below:
    - ```node -v```
    - ```npm -v```

# Building the project
1. Enter the correct directory WebGL-Trial/webgl-main
2. Install dependencies using ```npm i``` in your terminal
3. Run & start the project using ```npm run dev``` in terminal again
4. The website should automatically open on ```localhost:5173```! (Check the terminal incase its a different port! If it is taken Vite will automatically try the next available port.)

# My Platform, Versioning, & Dev environment
I will list what I used, just incase for anyone wondering what I used/platform choice to make this project.
- Mac (Sonoma 14) & Windows 10
- Visual Studio Code / Cursor
- npm version ```npm -v```  10.8.2
- node version ```node -v``` v20.17.0
- nvm version ```nvm -v``` 0.39.0

## Project Dependencies
  - **Typescript**
    - For obvious reasons.  
  - **Vite**
    - Vite fixed many issues I had previously.
  - **WebGL**
    - Make sure your browser/machine supports WebGL! 
  - *Old/Previous Packages (IGNORE THIS)*
    - Was using lite-server & watcher (replaced by vite).

## Guide to run Typescript code locally in VSC
***SKIP THIS IF YOU DONT CARE ABOUT COMPILING PURE TS CODE BY ITSELF!***
  1. Pre-pre-requsite note, please if you are on windows just use a cmdprompt terminal in VSC & not powershell, for some reason powershell was auto defaulted for me & it made things worse.
  2. Pre-requsites have nodejs & npm check by doing: 
       - mac/terminal > ```node -v && npm -v```
       - windows/powershell > ```node -v ; npm -v```
       - windows/cmdprompt > ```node -v && npm -v```
  3. Install typescript compiler globally via npm ```npm install -g typescript```
  4. Compile typescript code ```tsc filename.ts```
  5. Run compiled javascript code ```node filename.js```
     - ```tsc``` converts your TS to JS & ultimately we just run the JS file, you can do all this with just this 1 command that just merges the two together, check below:
       - mac/terminal > ```tsc filename.ts && node filename.js```
       - windows/powershell > ```tsc.cmd filename.ts ; node filename.js```
       - windows/cmdprompt > ```tsc filename.ts && node filename.js```

# Resources
- [MDN Docs](https://developer.mozilla.org/en-US/)
- [MDN Docs - Learn full web development from scratch](https://developer.mozilla.org/en-US/docs/Learn)
- [chatgpt.com](https://chatgpt.com/)
  - I'm going to use GPT to help me clarify shit while learning some of the topics below + I will need it especially when doing matrix multiplication & when I need an explanation on what happens when an object goes through 50 transformation calcs lmfao
- Important things to learn!
  - [stenciljs.com](https://stenciljs.com/)
  - [MDN Docs - Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
  - [MDN Docs - Web DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)
  - [Awesome Web Components - Learn](https://github.com/web-padawan/awesome-web-components)
- WebGL Resources
  - [learnwebgl.brown37.net](https://learnwebgl.brown37.net/rendering/introduction.html)
  - [webglfundamentals.org](https://webglfundamentals.org/)
  - [MDN Docs - Web GL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL) This resource is insanely good (Just my personal opinion, above 2 are suggested heavily by seasoned graphics engineers!)
- WebGPU Resources (Advanced / Later on)
  - [LearnWebGPU](https://eliemichel.github.io/LearnWebGPU/)
  - [webgpufundamentals.org](https://webgpufundamentals.org/)
- JS/TS Resources
  - I heard MDN docs isn't "good" for learning JS/TS it's best for references, but they do have resources (I won't be listing them here!), I'm not sure of what is a popular good resource in this area (JS/TS) unlike my expertise in other fields but I will try to list what I have seen suggested by strong web developers in specializations I have delved into the past.
  - [learn-js](https://www.learn-js.org/) / [learn-ts](https://www.learn-ts.org/)
  - [Codecademy-js](https://www.codecademy.com/learn/introduction-to-javascript) / [Codecademy-ts](https://www.codecademy.com/learn/learn-typescript)
  - [freecodecamp/learn-js&ts](https://www.freecodecamp.org/learn/) I have seen this as popularly suggested as the above resource!
  - [typescriptlang.org-ts](https://www.typescriptlang.org/docs/) a very good website for typescript related docs & learning ts in general!
  - [theodinproject-js](https://www.theodinproject.com/) popular suggestions I have seen multiple times about learning javascript!
- Hosting Notes (Ignore):
  - Was looking into hosting services and found this, its a nice website! > https://wheretohostmy.app/free-tier-comparison
  - Used Netlify and it was really fast to setup. Just drag & drop the built project dist files into the host service & thats it! You can get the dist file by doing ```npm run build``` and the dist file will be created.
 
# Graphics Rendering Pipeline Process
Very important, I will write this out once I fully/almost understand everything in the pipeline.

# Important Computer Graphics Concepts
This is here to list important topics & showcase some things I went through whilst learning CG & WebGL!  
*I want to make this clear, but im trying to learn more about CG rather than WebGL right now, since if you know CG you will adapt to any graphics specification!*

- Projections!
  - Prespective Projection - [Brendan Galea take on Perspective Projection](https://www.youtube.com/watch?v=U0_ONQQ5ZNM&ab_channel=BrendanGalea) | [ScratchAPixel](https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/projection-matrix-introduction.html)
  - Orthographic centering calculation - https://www.desmos.com/calculator/2dzuo1zxky | https://www.desmos.com/calculator/txn0gkfylk
- Model View Projection Matrix
  - https://jsantell.com/model-view-projection/
- Homogenous Coordinates
  - https://www.youtube.com/watch?v=o-xwmTODTUI
- Important Linear Algebra + Matrix Concepts in CG!
  - The list below is things I didn't want to put separately on top of this section, but needed to be mentioned.
  - Matrix Multiplication
  - Translation, Rotation, Scale Matricies / Homogenous Coordinates / Matrix Order
  - Column Major Order vs Row Major Order
  - Matrix Inverse (No need to go in deep but try to understand this concept for the camera!)


# Progress Log
- Following the guide of WebGL Fundamentals on https://webglfundamentals.org/
- Showcasing my progress through the guide. I'm mostly going by order but sometimes I skip around.

## Part 1 - Hello WebGL!
<p align="center">
<img width=50% src="webgl-main/img-progress/1-HelloWorld.png">
</p>

## Part 2 - Multiple Rectangles with double Triangles
<p align="center">
<img width=50% src="webgl-main/img-progress/2-2DRectangles.png">
</p>

## Part 2 - Math Overhaul using 2D Matricies + Orthographic Projection
<p align="center">
<img width=50% src="webgl-main/img-progress/3-F2D.png">
</p>

## Part 3 - 3D Matrices + Depth Buffer + Backface Culling/Triangle Order
<p align="center">
<img width=50% src="webgl-main/img-progress/4-F3D.png">
</p>

## Part 4 - Prespective Projection
<p align="center">
<img width=50% src="webgl-main/img-progress/5-F3D-Perspective.png">
</p>

## Part 5 - Camera Study - Look At
<p align="center">
<img width=50% src="webgl-main/img-progress/6-F3D-Camera-Lookat.gif">
</p>

## Part 6 - Delta Time & Texture Sampling
<p align="center">
  <img src="webgl-main/img-progress/7-F3D-deltatime.gif" width=49%> <img src="webgl-main/img-progress/8-F3D-Texture-Sampling.gif" width=49%>
</p>

## Part 7 - Procedural Texture Generation + Cube
<p align="center">
  <img src="webgl-main/img-progress/9-3D-TextureGeneration.png" width=49%> <img src="webgl-main/img-progress/8-F3D-Texture-Sampling.gif" width=49%>
</p>

# Restart! - Voxel Time!

## Part 1 - Interpolated Triangle - Full refactored backend
<p align="center">
  <img src="voxxer/readme-images/1-Hello-World-Interpolated.png" width=49%>
</p>

***I have decided to move this project entirely into a different repository as this repository already holds 3 different folders with different "projects/aims" & this structure for a repository is obviously wrong, so I just got a triangle boilerplate done with some very big backend refactors since I didnt like how my render loop & structure was back then. The continuation repos for this project plan is below!***

### WebGL 1.0 Hello world triangle project : https://github.com/j-2k/WebGL-Triangle-Boilerplate

### Voxxer Project Continuation : https://github.com/j-2k/VoxxerWebGL

