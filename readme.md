## Installation

```sh
npm install -g yo https://github.com/wizebin/generator-electron-react.git
```

## Initialization

```sh
yo electron-react
```

## Philosophy

This yeoman project generator is frequently updated to have the most recent versions of electron, babel, webpack, etc. I've dealt with the pain of setting up everything so you don't have to.

## Architecture

This project is split into two parts

#### The Main Process

In electron, the main process is the essentially the "browser", many other projects conjoin the main process and the renderer process and it makes it much more difficult to reason about and work on. This project's main process is in the "electron" folder, completely separate from the renderer process.

#### The Renderer Process

The renderer process is the "webpage", just like google chrome is not facebook, the renderer is not the main process. The renderer process is stored in the "src" folder. This project is setup to use react but you can use any web technology you want in the renderer process.

## Usage

1. Get your ecosystem setup, you really just need npm
2. Install yeoman `npm install -g yo`
3. Install this generator `npm install -g https://github.com/wizebin/generator-electron-react.git`
4. Create your project's directory, and open that directory in your command line/terminal/shell `mkdir my-project && cd my-project`
5. Execute the generator `yo electron-react`
6. Answer the questions the generator asks, it will ask what you want to call the project, how to license it, and other common setup questions
7. Run your project for the first time `npm run start`

## Customizing Your Source

You should be familiar with react, the ./src/ folder is just a normal react project except you have access to all of node. You can now execute all node functions, native node modules, and anything else you have access to in a normal node.js app. The exceptions to this are any isomorphic packages that rely on some trigger to determine if the package is running on the front end or backend, such as node-fetch or some third party libraries.

In development we use webpack serve (used to be webpack-dev-server) to create a hot-reloaded server which hosts the render process's react app as a single page application. This is hosted on a random port that you're more than welcome to change, especially if you are working on more than one electron project at once.

In production we build the renderer source using the same webpack configuration into a bundle that has most node_modules set as externals, this is important because many node modules (especially native modules) rely on a specific folder structure that gets broken if you bundle everything into a single file. The external node modules are copied to the dist folder and then we use electron-builder to package that distribution folder into the final executables for the project.

This project comes with a github actions file by default, it expects you to add some variables to your github secrets to be able to automatically build and deploy your code, take a look at the .github/workflows folder for more information on what you'll need to include in your secrets.

As for the main process, we still use webpack, but a completely separate webpack config. I haven't taken the time to setup any sort of hot reloading or live reloading system with the main process yet, so when you make changes to the main process you'll need to use the build in menu item "relaunch" in the help menu, or stop executing the project and re-run `npm run start`

## Debugging Main

Debugging the main process used to be a pretty major pain, but I recently added two more help menu items (which you'll want to disable before deploying your project to end customers probably). These items are "restart inspectable" and after you've clicked that button a new one is added called "show inspector", you can use the newly created inspector window to step through code, see logs, and everything you can normally do from about://inspect in chrome.

## "Tray" Application

When initializing your MainApp class in the main.js file you can change the parameter to true in order to change the app to a "tray" application, this means if you close the window the main process will continue to run and you can run background tasks.
