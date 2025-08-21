import type { Meta, StoryObj } from '@storybook/html';
import React, { useRef, useEffect } from 'react';

interface JeopardySceneArgs {
  width: number;
  height: number;
  scene: string;
  backgroundColor: string;
}

/**
 * Jeopardy game scenes showcase the classic quiz show format with multiple
 * interactive screens. Each scene represents a different part of the game flow,
 * from the main menu through question selection and answering.
 */
const meta: Meta<JeopardySceneArgs> = {
  title: 'Games/Jeopardy Phaser',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'game' },
    docs: {
      description: {
        component: 'Interactive Jeopardy game scenes built with Phaser.js. Each scene provides visual mockups of the actual game states with responsive controls for testing different screen sizes and configurations.',
      },
    },
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 800, max: 1920, step: 100 },
      description: 'Game canvas width in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1200' },
      },
    },
    height: {
      control: { type: 'range', min: 600, max: 1080, step: 100 },
      description: 'Game canvas height in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '800' },
      },
    },
    scene: {
      control: { type: 'select' },
      options: [
        'main-menu',
        'game-board',
        'choose-question',
        'clue-card',
        'reply-question',
        'podium',
        'loading'
      ],
      description: 'Which Jeopardy scene to display',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'main-menu' },
      },
    },
    backgroundColor: {
      control: { type: 'color' },
      description: 'Background color for the scene container',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#1a1a1a' },
      },
    },
  },
  args: {
    width: 1200,
    height: 800,
    scene: 'main-menu',
    backgroundColor: '#1a1a1a',
  },
};

export default meta;
type Story = StoryObj<JeopardySceneArgs>;

const createJeopardyScene = (args: JeopardySceneArgs) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.style.width = '100%';
      container.style.height = '100vh';
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      container.style.backgroundColor = args.backgroundColor;

      // Create game container
      const gameContainer = document.createElement('div');
      gameContainer.id = 'jeopardy-game-container';
      gameContainer.style.width = `${args.width}px`;
      gameContainer.style.height = `${args.height}px`;
      container.appendChild(gameContainer);

      // Mock Phaser game initialization
      const initializeGame = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = args.width;
          canvas.height = args.height;
          canvas.style.border = '2px solid #333';
          canvas.style.background = 'linear-gradient(45deg, #001122, #003366)';

          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw scene representation
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Jeopardy!', args.width / 2, args.height / 2 - 50);

            ctx.font = '24px Arial';
            ctx.fillText(`Scene: ${args.scene}`, args.width / 2, args.height / 2 + 20);

            ctx.font = '16px Arial';
            ctx.fillText('(Storybook Preview)', args.width / 2, args.height / 2 + 60);

            // Draw scene-specific elements
            switch (args.scene) {
              case 'main-menu':
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(args.width / 2 - 100, args.height / 2 + 100, 200, 50);
                ctx.fillStyle = '#000000';
                ctx.font = '20px Arial';
                ctx.fillText('Start Game', args.width / 2, args.height / 2 + 130);
                break;

              case 'game-board':
                // Draw a simple grid representing the game board
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 2;
                for (let i = 0; i < 6; i++) {
                  for (let j = 0; j < 5; j++) {
                    const x = 100 + i * 150;
                    const y = 200 + j * 80;
                    ctx.strokeRect(x, y, 140, 70);
                  }
                }
                break;

              case 'clue-card':
                ctx.fillStyle = '#000080';
                ctx.fillRect(args.width / 2 - 200, args.height / 2 - 100, 400, 200);
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 4;
                ctx.strokeRect(args.width / 2 - 200, args.height / 2 - 100, 400, 200);
                ctx.fillStyle = '#ffffff';
                ctx.font = '18px Arial';
                ctx.fillText('This is a clue card', args.width / 2, args.height / 2);
                break;

              default:
                ctx.fillStyle = '#666666';
                ctx.fillRect(args.width / 2 - 150, args.height / 2 + 100, 300, 100);
                ctx.fillStyle = '#ffffff';
                ctx.font = '18px Arial';
                ctx.fillText(`${args.scene} Scene`, args.width / 2, args.height / 2 + 155);
            }
          }

          gameContainer.appendChild(canvas);

        } catch (error) {
          console.warn('Could not initialize Phaser game:', error);

          // Fallback display
          const fallback = document.createElement('div');
          fallback.innerHTML = `
            <div style="
              color: white; 
              text-align: center; 
              padding: 50px;
              font-family: Arial, sans-serif;
            ">
              <h2>Jeopardy Scene: ${args.scene}</h2>
              <p>Preview mode - actual Phaser scene would load here</p>
            </div>
          `;
          gameContainer.appendChild(fallback);
        }
      };

      initializeGame();
    }
  }, [args]);

  return <div ref={containerRef}></div>;
};

/**
 * The main menu scene serves as the entry point for the Jeopardy game.
 * Players can start a new game or access settings from this screen.
 */
export const MainMenu: Story = {
  args: {
    scene: 'main-menu',
  },
  render: createJeopardyScene,
};

/**
 * The game board displays the classic Jeopardy grid with categories and point values.
 * Players select questions by clicking on the grid cells.
 */
export const GameBoard: Story = {
  args: {
    scene: 'game-board',
  },
  render: createJeopardyScene,
};

/**
 * Clue cards show individual questions with answers in the classic Jeopardy format.
 * The card includes a timer and displays the question text prominently.
 */
export const ClueCard: Story = {
  args: {
    scene: 'clue-card',
  },
  render: createJeopardyScene,
};

/**
 * The question selection scene allows players to choose from available questions
 * after a category has been selected from the game board.
 */
export const ChooseQuestion: Story = {
  args: {
    scene: 'choose-question',
  },
  render: createJeopardyScene,
};

/**
 * Players input their answers during this scene, with validation and scoring
 * provided in real-time based on the correct Jeopardy format.
 */
export const ReplyQuestion: Story = {
  args: {
    scene: 'reply-question',
  },
  render: createJeopardyScene,
};

/**
 * The podium scene displays current scores and player standings.
 * This appears between rounds and at the end of the game.
 */
export const Podium: Story = {
  args: {
    scene: 'podium',
  },
  render: createJeopardyScene,
};

/**
 * Loading screens appear during asset loading and scene transitions,
 * providing visual feedback to players during wait times.
 */
export const Loading: Story = {
  args: {
    scene: 'loading',
  },
  render: createJeopardyScene,
};

/**
 * Small screen variant optimized for tablet devices.
 * Tests responsive behavior at 800x600 resolution.
 */
export const ResponsiveSmall: Story = {
  args: {
    width: 800,
    height: 600,
    scene: 'main-menu',
  },
  render: createJeopardyScene,
};

/**
 * Large screen variant optimized for desktop displays.
 * Tests responsive behavior at 1920x1080 resolution.
 */
export const ResponsiveLarge: Story = {
  args: {
    width: 1920,
    height: 1080,
    scene: 'game-board',
  },
  render: createJeopardyScene,
}; 