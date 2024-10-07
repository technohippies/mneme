import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import KeenSlider from '../src/components/containers/KeenSlider';
import { Song, Phrase } from '../src/types';

const mockSongs: Song[] = [
  {
    stream_id: 'kjzl6kcym7w8y4xktxmf8shrpswokilc6tgppuin3w7firxw3ntmnw97irbvfuu',
    uuid: '15a480c8-713c-47b1-bd41-ea220f97db4c',
    language: 'en',
    song_cid: 'QmezJQV6iNjNdT8hxCkHqgDmaXx8BxBQFSgARnf2djYaKh',
    genius_id: 7000393,
    genius_slug: 'Sia-chandelier-piano-version-lyrics',
    release_date: '2014-07-04T00:00:00Z',
    apple_music_id: 989874560,
    song_title_cmn: '枝形吊灯（钢琴版）',
    song_title_eng: 'Chandelier (Piano Version)',
    song_title_jpn: 'シャンデリア（ピアノバージョン）',
    song_title_kor: '샹들리에 (피아노 버전)',
    album_title_cmn: '1000种恐惧（豪华版）',
    album_title_eng: '1000 Forms of Fear (Deluxe)',
    album_title_jpn: '1000 Forms of Fear (デラックス版)',
    album_title_kor: '1000가지 두려움의 형태 (디럭스)',
    artist_name_cmn: '希雅',
    artist_name_eng: 'Sia',
    artist_name_jpn: 'シーア',
    artist_name_kor: '시아',
    description_cmn: '',
    description_eng: '?',
    description_jpn: '',
    description_kor: '',
    genius_album_id: 750897,
    header_image_cid: 'Qmd5nzHzgRTwxwW3GS8JVnGkq3WH9RhL6c3aBqHzAcGZkM',
    translations_json: '{}',
    invidious_video_id: '0e_3aIqkcGQ',
    song_art_image_cid: 'Qmd5nzHzgRTwxwW3GS8JVnGkq3WH9RhL6c3aBqHzAcGZkM',
    album_cover_art_cid: 'QmZ3EqUJvvHacX2nikQNTiPGQYxjE9wjK9cdKfn8sZjsKT',
    song_art_text_color: '#fff',
    song_art_primary_color: '#af7c58',
    song_art_secondary_color: '#2b466a',
    header_image_thumbnail_cid: 'QmcXm3fvbpLH4BkSi5V8pBFeGF3RD65LnsB1ZgFLa3fHhU',
  },
  {
    stream_id: 'kjzl6kcym7w8yaid29dmc3gwhz9krj93jipqwj82is9v5vp1anv5jaoxul4plo6',
    uuid: 'c4488cbc-e87c-494f-a5f8-73f601f8adf7',
    language: 'en',
    song_cid: 'QmRHnpswBW1aZdJjfG7z1jJqkpSeLVM9PuBbd2dDC7Ywx7',
    genius_id: 10047250,
    genius_slug: 'Beyonce-texas-hold-em-lyrics',
    release_date: '2024-02-11T00:00:00Z',
    apple_music_id: 1730408498,
    song_title_cmn: '德州扑克',
    song_title_eng: 'TEXAS HOLD \'EM',
    song_title_jpn: 'テキサス・ホールデム',
    song_title_kor: '텍사스 홀덤',
    album_title_cmn: '牛仔卡特',
    album_title_eng: 'COWBOY CARTER',
    album_title_jpn: 'カウボーイ・カーター',
    album_title_kor: '카우보이 카터',
    artist_name_cmn: '碧昂斯',
    artist_name_eng: 'Beyoncé',
    artist_name_jpn: 'ビヨンセ',
    artist_name_kor: '비욘세',
    description_cmn: '"TEXAS HOLD \'EM"是碧昂斯即将发行的乡村主题专辑中的一首惊喜单曲，这张专辑将作为《Renaissance》的后续作品，也是"三部曲"项目的第二部分。这首歌曲在她的超级碗LVIII广告中被预告，并在广告播出后不久发布。',
    description_eng: '"TEXAS HOLD \'EM" is one of Beyonce\'s surprise singles from her upcoming country-themed album, which will serve as a follow up to Renaissance and is the second act in the act 3 project. It was teased during her Super Bowl LVIII commercial and shortly released after.',
    description_jpn: '「テキサス・ホールデム」はビヨンセの次のカントリーテーマのアルバムからのサプライズシングルの1つで、「ルネッサンス」の続編であり、アクト3プロジェクトの第2幕となります。スーパーボウルLVIIIの彼女のCMで予告され、その直後にリリースされました。',
    description_kor: '"TEXAS HOLD \'EM"은 비욘세의 차기작인 컨트리 테마 앨범에서 깜짝 공개된 싱글 중 하나입니다. 이 앨범은 르네상스의 후속작이며 3부작 프로젝트의 두 번째 작품입니다. 이 곡은 슈퍼볼 LVIII 광고에서 티저로 공개되었고 shortly after 정식 발매되었습니다.',
    genius_album_id: 1043786,
    header_image_cid: 'QmbqdVdRiPh7Ykqjdd7vvD9atR5DBUrxf8fSqK9TKWfETZ',
    translations_json: '{"it": "https://genius.com/Genius-traduzioni-italiane-beyonce-texas-hold-em-traduzione-italiana-lyrics", "de": "https://genius.com/Genius-deutsche-ubersetzungen-beyonce-texas-hold-em-deutsche-ubersetzung-lyrics", "ru": "https://genius.com/Genius-russian-translations-beyonce-texas-hold-em-lyrics", "pt": "https://genius.com/Genius-brasil-traducoes-beyonce-texas-hold-em-traducao-em-portugues-lyrics", "id": "https://genius.com/Genius-terjemahan-indonesia-beyonce-texas-hold-em-terjemahan-indonesia-lyrics", "tr": "https://genius.com/Genius-turkce-ceviri-beyonce-texas-hold-em-turkce-ceviri-lyrics", "pl": "https://genius.com/Polskie-tumaczenia-genius-beyonce-texas-hold-em-polskie-tumaczenie-lyrics", "es": "https://genius.com/Genius-traducciones-al-espanol-beyonce-texas-hold-em-traduccion-al-espanol-lyrics", "nl": "https://genius.com/Genius-nederlandse-vertalingen-beyonce-texas-hold-em-nederlandse-vertaling-lyrics", "no": "https://genius.com/Genius-norwegian-translations-beyonce-texas-hold-em-norsk-oversettelse-lyrics"}',
    invidious_video_id: 'jCOX8dT9q8M',
    song_art_image_cid: 'QmbqdVdRiPh7Ykqjdd7vvD9atR5DBUrxf8fSqK9TKWfETZ',
    album_cover_art_cid: 'QmbSUg39XSm6HXBWLVji2xS3EJesGF1pBG7n1nXDUoyiTX',
    song_art_text_color: '#ffffff',
    song_art_primary_color: '#120e0d',
    song_art_secondary_color: '#4a2e17',
    header_image_thumbnail_cid: 'QmXeK7qfvHJd8Xg6F1AjYyXT6bessXPkZ6CSGnNbMXHiRZ',
  },
];

const mockPhrases: Phrase[] = [
  // Phrases for Chandelier
  {
    stream_id: 'phrase1',
    text: 'From the chandelier',
    text_cmn: '从吊灯上',
    start_time: 0,
    end_time: 5,
    phrase_id: '1',
    song_uuid: '15a480c8-713c-47b1-bd41-ea220f97db4c',
    stop_marker: 5,
  },
  {
    stream_id: 'phrase2',
    text: 'From the chandelier!',
    text_cmn: '从吊灯上！',
    start_time: 5,
    end_time: 10,
    phrase_id: '2',
    song_uuid: '15a480c8-713c-47b1-bd41-ea220f97db4c',
    stop_marker: 10,
  },
  // Phrases for Texas Hold 'Em
  {
    stream_id: 'phrase3',
    text: 'This is the first line of Texas Hold \'Em',
    text_cmn: '这是Texas Hold \'Em的第一句',
    start_time: 0,
    end_time: 5,
    phrase_id: '3',
    song_uuid: 'c4488cbc-e87c-494f-a5f8-73f601f8adf7',
    stop_marker: 5,
  },
  {
    stream_id: 'phrase4',
    text: 'This is the second line of Texas Hold \'Em',
    text_cmn: '这是Texas Hold \'Em的第二句',
    start_time: 5,
    end_time: 10,
    phrase_id: '4',
    song_uuid: 'c4488cbc-e87c-494f-a5f8-73f601f8adf7',
    stop_marker: 10,
  },
];

const meta: Meta<typeof KeenSlider> = {
  title: 'Containers/KeenSlider',
  component: KeenSlider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KeenSlider>;

export const Default: Story = {
  args: {
    songs: mockSongs,
    phrases: mockPhrases,
  },
};