import type { Meta, StoryObj } from '@storybook/react';
import { ScoreDisplay } from '../src/components/core/ScoreDisplay';

const meta: Meta<typeof ScoreDisplay> = {
  title: 'Core/ScoreDisplay',
  component: ScoreDisplay,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScoreDisplay>;

export const Default: Story = {
  args: {
    score: 85,
  },
};

export const PerfectScore: Story = {
  args: {
    score: 100,
  },
};

export const LowScore: Story = {
  args: {
    score: 30,
  },
};