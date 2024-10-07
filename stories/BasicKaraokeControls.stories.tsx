import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BasicKaraokeControls } from '../src/components/composite/BasicKaraokeControls';
import { Phrase } from '../src/types/index';

// Hardcode the wallet connection state
const isWalletConnected = true;

const meta: Meta<typeof BasicKaraokeControls> = {
  title: 'Composite/BasicKaraokeControls',
  component: BasicKaraokeControls,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BasicKaraokeControls>;

const samplePhrases: Phrase[] = [
  {
    phrase_id: '1',
    text: 'From the chandelier',
    text_cmn: '从吊灯上',
    start_time: '0',
    end_time: '5',
    stream_id: 'sample_stream_id',
    song_uuid: 'sample_song_uuid',
    stop_marker: 0, // Changed from false to 0
    audio_cid: 'sample_audio_cid',
    tts_cid: 'sample_tts_cid',
  },
  {
    phrase_id: '2',
    text: 'From the chandelier!',
    text_cmn: '从吊灯上',
    start_time: '5',
    end_time: '10',
    stream_id: 'sample_stream_id',
    song_uuid: 'sample_song_uuid',
    stop_marker: 0, // Changed from false to 0
    audio_cid: 'sample_audio_cid',
    tts_cid: 'sample_tts_cid',
  },
  // ... Add more sample phrases as needed
];

const audioUrl = 'https://warp.dolpin.io/ipfs/QmRHnpswBW1aZdJjfG7z1jJqkpSeLVM9PuBbd2dDC7Ywx7'; // Texas Hold 'Em by Beyoncé

const BasicKaraokeControlsWrapper: React.FC<{ args: any }> = ({ args }) => {
  const handleRecordingComplete = async (audioBlob: Blob) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.floor(Math.random() * 101);
  };

  return (
    <BasicKaraokeControls
      {...args}
      audioUrl={audioUrl}
      onRecordingComplete={handleRecordingComplete}
      onPhraseComplete={(phraseId, performance) => {
        console.log(`Phrase ${phraseId} completed with performance: ${performance}`);
      }}
      onAddSong={() => console.log('Add song clicked')}
    />
  );
};

export const Default: Story = {
  render: (args) => (
    <div className="bg-white p-4">
      <BasicKaraokeControlsWrapper args={args} />
    </div>
  ),
  args: {
    phrases: samplePhrases,
    isInDeck: false,
  },
};

// Add a new story for dark mode
export const DarkMode: Story = {
  render: (args) => (
    <div className="bg-neutral-900 p-4">
      <BasicKaraokeControlsWrapper args={args} />
    </div>
  ),
  args: {
    phrases: samplePhrases,
    isInDeck: true,
  },
};