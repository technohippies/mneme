import type { Meta, StoryObj } from '@storybook/react';
import { LyricsDisplay } from '../src/components/core/LyricsDisplay';

const meta: Meta<typeof LyricsDisplay> = {
  title: 'Core/LyricsDisplay',
  component: LyricsDisplay,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LyricsDisplay>;

const sampleLyrics = [
  {
    startTime: 0,
    endTime: 5,
    englishText: "From the chandelier",
    translatedText: "从吊灯上",
    words: [
      { word: "From", startTime: 0, endTime: 1 },
      { word: "the", startTime: 1, endTime: 2 },
      { word: "chandelier", startTime: 2, endTime: 5 },
    ],
  },
  {
    startTime: 5,
    endTime: 10,
    englishText: "From the chandelier",
    translatedText: "从吊灯上",
    words: [
      { word: "From", startTime: 5, endTime: 6 },
      { word: "the", startTime: 6, endTime: 7 },
      { word: "chandelier", startTime: 7, endTime: 10 },
    ],
  },
  {
    startTime: 10,
    endTime: 15,
    englishText: "But I'm holding on for dear life",
    translatedText: "但我在拼命坚持",
    words: [
      { word: "But", startTime: 10, endTime: 11 },
      { word: "I'm", startTime: 11, endTime: 12 },
      { word: "holding", startTime: 12, endTime: 13 },
      { word: "on", startTime: 13, endTime: 13.5 },
      { word: "for", startTime: 13.5, endTime: 14 },
      { word: "dear", startTime: 14, endTime: 14.5 },
      { word: "life", startTime: 14.5, endTime: 15 },
    ],
  },
];

export const Default: Story = {
  args: {
    lyrics: sampleLyrics,
    currentTime: 0,
  },
};

export const MiddleOfSong: Story = {
  args: {
    lyrics: sampleLyrics,
    currentTime: 7,
  },
};