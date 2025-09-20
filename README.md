# Gemini AI & KEITA space attack game

A vibrant, fast-paced retro space shooter built with React and TypeScript. This game features multiple weapon types, challenging enemies, bonus items, and an AI autopilot mode.

![Gameplay Screenshot](https://storage.googleapis.com/aistudio-bucket/projects/b8d7529b-a01c-4623-a511-2b04c8611ac2/prod/5a914e6b-0773-455b-8d59-399a9134918e_0.png)

## Features

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

This project is built with modern web technologies and requires no complex installation process to run locally.

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd <repository_name>
    ```

3.  **Run a local web server:**
    Since this project uses ES modules (`import`), you need to serve the files from a local web server. You cannot just open `index.html` from your file system.

    A simple way to do this is using the `http.server` module if you have Python installed:
    ```bash
    # For Python 3
    python -m http.server
    ```
    Or, you can use a VS Code extension like **Live Server**.

4.  **Open in your browser:**
    Navigate to the local address provided by your server (e.g., `http://localhost:8000`).

**Note on API Keys**: Currently, the game does not require any external API keys to function.

## Deployment

This is a static web application that can be deployed to any static hosting service.

- **Vercel / Netlify (Recommended)**:
  1. Create a new project and link it to your GitHub repository.
  2. The service will automatically detect it's a static site. No special build configuration is needed for this setup.
  3. Deploy!

- **GitHub Pages**:
  1. This project requires a build step to convert TypeScript (`.tsx`) into browser-readable JavaScript before deploying to GitHub Pages.
  2. You would need to add a build tool like `Vite` or `create-react-app` to your project to handle this process.
  3. Set up a GitHub Action to automatically build your project and deploy the output (usually from a `dist` or `build` folder) to the `gh-pages` branch.
