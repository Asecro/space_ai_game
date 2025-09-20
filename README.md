# Gemini AI & KEITA space attack game

A vibrant, fast-paced retro space shooter built with React, TypeScript, and Vite. This game features multiple weapon types, challenging enemies, bonus items, and an AI autopilot mode.

![Gameplay Screenshot](https://storage.googleapis.com/aistudio-bucket/projects/b8d7529b-a01c-4623-a511-2b04c8611ac2/prod/5a914e6b-0773-455b-8d59-399a9134918e_0.png)

## Features

- **Modern Tooling**: Now built with Vite for a fast development experience and an optimized production build.
- **Dynamic Gameplay**: Fast-paced action with waves of unique enemies (invaders and asteroids).
- **Multiple Weapons**: Switch between Single Shot, Triple Shot, a rainbow Laser Beam, and powerful Homing Missiles.
- **Bonus Items**: Collect power-ups for a temporary invincibility shield or a massive score boost.
- **AI Autopilot**: Press 'I' to let the AI take over, dodging enemies and strategically targeting foes.
- **Stunning Visuals**: Features vibrant particle effects for explosions, weapon fire, and rocket thrust.
- **High Score System**: Compete for a spot on the leaderboard! Your top 10 scores are saved locally.
- **Sound Effects**: Immersive audio for shooting, explosions, and power-ups powered by the Web Audio API.

## Controls

- **Arrow Keys**: Move your rocket ship.
- **Spacebar**: Fire your current weapon.
- **Q Key**: Cycle through the available weapons.
- **I Key**: Toggle the AI Autopilot mode on or off.

## Installation and Setup

This project uses `npm` for package management.

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd gemini-ai-keita-space-attack-game
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start a local development server. Open your browser to the address provided (e.g., `http://localhost:5173`).

## Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

1.  **Update `package.json`:**
    Open the `package.json` file and update the `homepage` property to match your GitHub repository URL:
    ```json
    "homepage": "https://<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>",
    ```

2.  **Update `vite.config.ts`:**
    Open `vite.config.ts` and update the `base` property to match your repository name:
    ```typescript
    // ...
    export default defineConfig({
      // ...
      base: '/<YOUR_REPOSITORY_NAME>/',
    })
    ```

3.  **Run the deploy script:**
    This command will automatically build the project and push the contents of the `dist` folder to a `gh-pages` branch on your repository.
    ```bash
    npm run deploy
    ```

4.  **Configure GitHub Pages:**
    In your GitHub repository settings, go to the "Pages" section and set the deployment source to the `gh-pages` branch. After a few minutes, your game will be live!
