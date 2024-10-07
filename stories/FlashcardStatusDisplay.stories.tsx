import type { Meta, StoryObj } from '@storybook/react';
import FlashcardStatusDisplay from '../src/components/core/FlashcardStatusDisplay';

const meta: Meta<typeof FlashcardStatusDisplay> = {
  title: 'Core/FlashcardStatusDisplay',
  component: FlashcardStatusDisplay,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlashcardStatusDisplay>;

export const Default: Story = {
  args: {
    status: {
      new_count: 5,
      learning_count: 10,
      due_count: 15,
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    status: {
      new_count: 5,
      learning_count: 10,
      due_count: 15,
    },
    isLoading: true,
  },
};

export const HighCounts: Story = {
  args: {
    status: {
      new_count: 50,
      learning_count: 100,
      due_count: 200,
    },
    isLoading: false,
  },
};
