import React, { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/html';

interface DungeonSceneArgs {
  width: number;
  height: number;
  backgroundColor: string;
}

/**
 * Dungeon game scene showcases a classic 2D dungeon crawler experience built with PIXI.js.
 * The scene features character movement, environmental objects, particle effects, and
 * immersive audio elements typical of dungeon exploration games.
 */
const meta: Meta<DungeonSceneArgs> = {
  title: 'Games/Dungeon Pixi',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'game' },
    docs: {
      description: {
        component: 'Interactive dungeon exploration scene built with PIXI.js and GSAP. Features a single main game scene with character movement, environmental objects, particle effects, and audio. This visual mockup demonstrates the game layout and UI elements.',
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
    backgroundColor: '#1a1a1a',
  },
};

export default meta;
type Story = StoryObj<DungeonSceneArgs>;

const createDungeonScene = (args: DungeonSceneArgs) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.style.width = '100%';
      container.style.height = '100vh';
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      container.style.backgroundColor = args.backgroundColor;

      // Create canvas for the dungeon scene
      const canvas = document.createElement('canvas');
      canvas.width = args.width;
      canvas.height = args.height;
      canvas.style.border = '2px solid #444';
      canvas.style.background = 'linear-gradient(45deg, #2a2a2a, #1a1a1a)';

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw dungeon scene mockup
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dungeon Explorer', args.width / 2, 100);

        ctx.font = '24px Arial';
        ctx.fillText('PIXI.js Game Scene', args.width / 2, 140);

        // Draw dungeon walls
        ctx.fillStyle = '#444444';
        ctx.fillRect(50, 200, args.width - 100, 20); // Top wall
        ctx.fillRect(50, 200, 20, args.height - 300); // Left wall
        ctx.fillRect(args.width - 70, 200, 20, args.height - 300); // Right wall
        ctx.fillRect(50, args.height - 120, args.width - 100, 20); // Bottom wall

        // Draw character (simple rectangle)
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(args.width / 2 - 15, args.height / 2 - 15, 30, 30);

        // Draw some dungeon elements
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(200, 300, 40, 40); // Crate
        ctx.fillRect(args.width - 240, 400, 40, 40); // Another crate

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(300, 250, 10, 0, 2 * Math.PI);
        ctx.fill(); // Gold coin

        ctx.beginPath();
        ctx.arc(args.width - 300, 350, 10, 0, 2 * Math.PI);
        ctx.fill(); // Another gold coin

        // Draw UI elements
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(20, 20, 200, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Health: 100/100', 30, 40);
        ctx.fillText('Score: 1,250', 30, 60);

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#cccccc';
        ctx.fillText('(Storybook Preview - Actual PIXI.js scene would render here)', args.width / 2, args.height - 50);
      }

      container.appendChild(canvas);
    }
  }, [args]);

  return <div ref={containerRef}></div>;
};

/**
 * The default dungeon game scene showing the main gameplay area.
 * Features character representation, environmental objects, UI elements,
 * and the overall game layout with standard desktop dimensions.
 */
export const Default: Story = {
  render: createDungeonScene,
};

/**
 * Small screen variant optimized for tablet devices and smaller displays.
 * Tests responsive behavior at 800x600 resolution while maintaining
 * all game elements and readability.
 */
export const SmallScreen: Story = {
  args: {
    width: 800,
    height: 600,
  },
  render: createDungeonScene,
};

/**
 * Large screen variant optimized for high-resolution desktop displays.
 * Tests responsive behavior at 1920x1080 resolution, ensuring proper
 * scaling of game elements and UI components.
 */
export const LargeScreen: Story = {
  args: {
    width: 1920,
    height: 1080,
  },
  render: createDungeonScene,
};

/**
 * Dark theme variant with pure black background for testing
 * contrast and visibility of game elements in darker environments.
 * Useful for accessibility testing and theme variations.
 */
export const DarkTheme: Story = {
  args: {
    backgroundColor: '#000000',
  },
  render: createDungeonScene,
};