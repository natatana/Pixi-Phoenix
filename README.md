# 🎮 Multi-Game Project

A collection of three independent game projects organized in a single repository for easy management and development, with integrated Storybook for scene documentation.

## 🎯 Games Included

### 🎵 Song Quiz
- **Technology**: React + Pixi.js + Howler.js
- **Description**: Interactive music quiz game
- **Dev URL**: `http://localhost:3001`
- **Location**: `./projects/song-quiz-pixi/`
- **Storybook**: Song Quiz

### 🏰 Dungeon
- **Technology**: Pixi.js + GSAP
- **Description**: Pixel art dungeon exploration game
- **Dev URL**: `http://localhost:3002`
- **Location**: `./projects/dungeon-pixi/`
- **Storybook**: ✅ Game Scene

### ❓ Jeopardy
- **Technology**: Phaser.js
- **Description**: Classic quiz show game
- **Dev URL**: `http://localhost:3003`
- **Location**: `./projects/jeopardy-phaser/`
- **Storybook**: ✅ All Scenes (Main Menu, Game Board, Clue Card, etc.)

## 🚀 Quick Start

### Option 1: Easy Start (RECOMMENDED)
```bash
# Install dependencies for all projects
npm run install

# Start all games at once
npm run dev
```
This will start:
- **Song Quiz**: `http://localhost:3001`
- **Dungeon**: `http://localhost:3002`
- **Jeopardy**: `http://localhost:3003`

### Option 2: Individual Project Development
```bash
# Work on Song Quiz only
cd projects/song-quiz-pixi
npm install
npm run dev

# Work on Dungeon only
cd projects/dungeon-pixi
npm install
npm run dev

# Work on Jeopardy only
cd projects/jeopardy-phaser
npm install
npm run dev
```

### Option 3: Start Services Individually
```bash
npm run dev:song-quiz  # Song Quiz (port 3001)
npm run dev:dungeon    # Dungeon (port 3002)
npm run dev:jeopardy   # Jeopardy (port 3003)
```

## 📚 Storybook Integration

### Start Storybook
```bash
# Start Storybook development server
npm run storybook
# Storybook will be available at: http://localhost:6006
```

### Build Storybook
```bash
# Build Storybook for production
npm run build-storybook

# Serve built Storybook
npm run storybook:serve
# Static Storybook will be available at: http://localhost:6007
```

### What's in Storybook
- **🏰 Dungeon**: Game scene with visual mockups and responsive testing
- **❓ Jeopardy**: All game scenes (Main Menu, Game Board, Clue Card, Choose Question, Reply Question, Podium, Loading)
- **Interactive Controls**: Adjust screen sizes, colors, and scene parameters
- **Visual Documentation**: Preview scenes in isolation for design review

## 📁 Project Structure

```
multi-game-project/
├── projects/                    # All game projects folder
│   ├── song-quiz-pixi/          # Complete React + Pixi.js project
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json         # Own dependencies
│   │   ├── vite.config.ts       # Own config (port 3001)
│   │   └── index.html
│   ├── dungeon-pixi/            # Complete Pixi.js project
│   │   ├── src/
│   │   ├── public/
│   │   ├── vite/
│   │   ├── package.json         # Own dependencies
│   │   └── index.html
│   └── jeopardy-phaser/         # Complete Phaser.js project
│       ├── src/
│       ├── public/
│       ├── package.json         # Own dependencies
│       ├── vite.config.ts       # Own config (port 3003)
│       └── index.html
├── .storybook/                  # Storybook configuration
│   ├── main.ts                  # Main config
│   └── preview.ts               # Preview config
├── stories/                     # Storybook stories
│   ├── Introduction.mdx         # Welcome page
│   ├── dungeon-scene.stories.ts # Dungeon scene stories
│   └── jeopardy-scenes.stories.ts # Jeopardy scene stories
├── package.json                 # Root scripts + Storybook dependencies
├── index.html                   # Landing page
└── README.md
```

## 🌐 Development URLs

- **Song Quiz**: `http://localhost:3001` 
- **Dungeon**: `http://localhost:3002`
- **Jeopardy**: `http://localhost:3003`
- **Storybook**: `http://localhost:6006`

## 🎨 Why This Structure Works Better

1. **🔒 True Independence**: Each project can use different versions of dependencies
2. **⚡ Faster Development**: No complex build configurations
3. **🎯 Focused Development**: Work on one game at a time without distractions
4. **📦 Easy Deployment**: Deploy each game separately or together
5. **🔄 Easy Maintenance**: Update/modify one game without affecting others
6. **📁 Clean Organization**: All projects organized in a dedicated folder
7. **📚 Visual Documentation**: Storybook for design system and scene testing

## 🚀 Building for Production

```bash
# Build all games
npm run build

# Or build individually
cd projects/song-quiz-pixi && npm run build
cd projects/dungeon-pixi && npm run build  
cd projects/jeopardy-phaser && npm run build

# Build Storybook
npm run build-storybook
```

Each project builds to its own `dist/` folder within the project directory.

## 📝 Development Notes

- Each project maintains its own dependencies and versions
- No shared build tools or configurations to maintain
- Hot reload works perfectly for each game independently
- Can easily add/remove games without affecting others
- Each game can be deployed independently or as part of a collection
- All projects are organized in the `projects/` folder for better structure
- Storybook provides visual documentation and testing for game scenes
- Use Storybook for design review, responsive testing, and documentation

---

**Bottom Line**: This approach gives you the benefits of a monorepo (shared documentation, easy startup) while keeping each project completely independent and well-organized, plus visual documentation with Storybook! 🎮 