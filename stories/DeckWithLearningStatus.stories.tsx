import type { Meta, StoryObj } from '@storybook/react';
import DeckWithLearningStatus from '../src/components/core/DeckWithLearningStatus';
import { DeckType } from '../src/types';
import { FlashcardStatus } from '../src/types';

const meta: Meta<typeof DeckWithLearningStatus> = {
  title: 'Core/DeckWithLearningStatus',
  component: DeckWithLearningStatus,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DeckWithLearningStatus>;

const sampleDeck: DeckType = {
  name: 'Sample Deck',
  slug: 'sample-deck',
  stream_id: 'sample-stream-id',
  img_cid: 'QmZYv6QPLjznFeEHkt7BfwswTQyuKPDEpAy2xtbjE9qsdB',
  controller: 'did:key:z6MkrYXeDdHrJTnqUYiJLVDNuyTUTrvJSVDRJJJn9Af3Fx7s',
  status: 'published',
  creator: '0x8f2b55Be9fBfC3934c9CD104FC02a4eEC81f66D3',
  category: 'social',
  difficulty: 'A2',
  description: 'A sample deck for testing',
  base_language: 'cmn',
  target_language_1: 'eng',
};

const sampleStatus: FlashcardStatus = {
  new_count: 5,
  learning_count: 3,
  due_count: 2,
};

export const Default: Story = {
  args: {
    deck: sampleDeck,
    status: sampleStatus,
    onClick: () => console.log('Deck clicked'),
  },
};

export const LongDeckName: Story = {
  args: {
    deck: { ...sampleDeck, name: 'This is a very long deck name that might cause layout issues' },
    status: sampleStatus,
    onClick: () => console.log('Deck clicked'),
  },
};

export const NoImage: Story = {
  args: {
    deck: { ...sampleDeck, img_cid: undefined },
    status: sampleStatus,
    onClick: () => console.log('Deck clicked'),
  },
};

export const ZeroStatus: Story = {
  args: {
    deck: sampleDeck,
    status: { new_count: 0, learning_count: 0, due_count: 0},
    onClick: () => console.log('Deck clicked'),
  },
};
