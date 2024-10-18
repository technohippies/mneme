import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SongListItem from '../src/components/core/SongListItem';
import { Song } from '../src/types';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof SongListItem> = {
  title: 'Core/SongListItem',
  component: SongListItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SongListItem>;

const sampleSong: Song = {
  stream_id: 'sample-stream-id',
  controller: 'sample-controller',
  uuid: 'sample-uuid',
  language: 'en',
  song_cid_1: 'sample-song-cid-1',
  song_cid_2: 'sample-song-cid-2',
  genius_id: 12345,
  genius_slug: 'sample-song-lyrics',
  release_date: '2023-01-01',
  apple_music_id: 67890,
  song_title_cmn: '示例歌曲',
  song_title_eng: 'Sample Song',
  song_title_jpn: 'サンプル曲',
  song_title_kor: '샘플 노래',
  album_title_cmn: '示例专辑',
  album_title_eng: 'Sample Album',
  album_title_jpn: 'サンプルアルバム',
  album_title_kor: '샘플 앨범',
  artist_name_cmn: '示例艺术家',
  artist_name_original: 'Sample Artist',
  artist_name_jpn: 'サンプルアーティスト',
  artist_name_kor: '샘플 아티스트',
  description_cmn: '这是一个示例描述',
  description_eng: 'This is a sample description',
  description_jpn: 'これはサンプルの説明です',
  description_kor: '이것은 샘플 설명입니다',
  genius_album_id: 54321,
  header_image_cid: 'sample-header-image-cid',
  translations_json: '{}',
  invidious_video_id: 'sample-video-id',
  song_art_image_cid: 'QmZYv6QPLjznFeEHkt7BfwswTQyuKPDEpAy2xtbjE9qsdB',
  album_cover_art_cid: 'sample-album-cover-art-cid',
  song_art_text_color: '#FFFFFF',
  song_art_primary_color: '#000000',
  song_art_secondary_color: '#808080',
  header_image_thumbnail_cid: 'sample-header-image-thumbnail-cid',
};

export const Default: Story = {
  args: {
    song: sampleSong,
  },
};

export const LongSongTitle: Story = {
  args: {
    song: { ...sampleSong, song_title_eng: 'This is a very long song title that might cause layout issues' },
  },
};

export const LongArtistName: Story = {
  args: {
    song: { ...sampleSong, artist_name_original: 'This is a very long artist name that might cause layout issues' },
  },
};

export const NoImage: Story = {
  args: {
    song: { ...sampleSong, song_art_image_cid: '' },
  },
};

export const NonEnglishTitles: Story = {
  args: {
    song: {
      ...sampleSong,
      song_title_eng: '你好，世界',
      song_title_cmn: '你好，世界',
      artist_name_original: '张三',
      artist_name_cmn: '张三',
    },
  },
};
