# The Gems
This is a game made for GithubGameOff 2019 - a web-based game using the Phaser 3 engine, Typescript, and Webpack. Play the game [here](https://sharpfives.itch.io/gems).

## Project Structure
All code goes in <code>src/</code>, all resources (images, music, etc.) go in <code>resources/</code>.

The game entry point is in <code>src/main-game.ts</code>.

## Install Dependencies
This project uses Webpack and NodeJS to run a minimal webserver for hosting the game. First download and install NodeJS (https://nodejs.org). Then,

```bash
cd the-gems-game
npm i
```

## Run / Debug
```bash
npm run dev
```
This will open a browser window and launch the game. You can now edit any of your files in <code>src/</code> or <code>resources/</code> and the game will automatically get rebuilt and the browser page will refresh. Pretty cool! You can debug and set break points in the Typescript source using the Developer Tab window in Chrome.
