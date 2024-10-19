export interface FlashcardStatus {
    new_count: number;
    learning_count: number;
    due_count: number;
}

export interface FlashcardProps {
    id: string;
    text: string;
    text_cmn: string;
    tts_cid?: string;
    audio_cid?: string;
    background_image_cid?: string;
    onFlip: () => void;
    onAgain: () => void;
    onGood: () => void;
    isFlipped: boolean;
}

export interface FlashcardRef {
    moveCardLeft: () => void;
    flip: () => void;
    reset: () => void;
}

export type DeckEntry = {
  controller: string;
  song_uuid: string;
  status: string;
  date_added: string;
  last_practiced: string;
};

export interface PhraseStatus {
    new_count: number;
    learning_count: number;
    due_count: number;
    studied_today: number;
}

export interface UserLearningData {
    reps: number;
    lapses: number;
    stability: number;
    difficulty: number;
    is_removed: boolean;
    last_review: string;
    next_review: string;
    flashcard_id: string;
    last_interval: number;
    retrievability: number;
    is_new?: boolean;
    is_learning?: boolean;
    is_due?: boolean;
    studied_today?: boolean;
    same_day_reviews?: number; // Add this line
}

export interface SavedUserLearningData extends UserLearningData {
    stream_id: string;
}

export interface DeckType {
    id: string;
    stream_id?: string;
    controller?: string;
    name: string;
    slug?: string;
    season?: string;
    status?: string;
    creator?: string;
    episode?: string;
    img_cid: string;
    category?: string;
    difficulty?: string;
    description?: string;
    base_language?: string;
    reference_url?: string;
    target_language_1?: string;
    target_language_2?: string;
    genius_slug: string;
    artist: string;
    translatedTitles?: { [key: string]: string | undefined }; // Update this line
}

export interface Song {
    stream_id: string;
    controller?: string;
    uuid: string;
    language: string;
    song_cid_1: string;
    song_cid_2: string;
    genius_id: number;
    genius_slug: string;
    release_date: string;
    apple_music_id: number;
    song_title_cmn: string;
    song_title_eng: string;
    song_title_jpn: string;
    song_title_kor: string;
    album_title_cmn: string;
    album_title_eng: string;
    album_title_jpn: string;
    album_title_kor: string;
    artist_name_cmn: string;
    artist_name_original: string;
    artist_name_jpn: string;
    artist_name_kor: string;
    description_cmn: string;
    description_eng: string;
    description_jpn: string;
    description_kor: string;
    genius_album_id: number;
    header_image_cid: string;
    translations_json: string;
    invidious_video_id: string;
    song_art_image_cid: string;
    album_cover_art_cid: string;
    song_art_text_color: string;
    song_art_primary_color: string;
    song_art_secondary_color: string;
    header_image_thumbnail_cid: string;
    _metadata_context?: string;
    plugins_data?: any;
    indexed_at?: string;
    audio_cid: string; // Add this line
    translatedTitles?: { [key: string]: string | undefined }; // Update this line
    song_title: string; // This will be the title in the song's original language
    [key: string]: string | number | boolean | undefined | object; // Add this line
    song_title_fra?: string;
    song_title_spa?: string;
    song_title_ita?: string;
}

export interface Phrase {
    phrase_id: string;
    text: string;
    text_cmn: string;
    start_time: string;
    end_time: string;
    stream_id: string;
    song_uuid: string;
    stop_marker: number;
    background_image_cid?: string;
    text_jpn?: string;
    text_kor?: string;
    audio_cid: string;
    tts_cid: string;
    translation?: string;
}

export interface Word {
    stream_id: string;
    word: string;
    end_time: string;
    phrase_id: string;
    start_time: string;
    word_index: number; // Add this line
}

export interface UserProgress {
    stream_id: string;
    controller: string;
    reps: number;
    lapses: number;
    stability: number;
    difficulty: number;
    is_removed: boolean;
    last_review: string;
    next_review: string;
    flashcard_id: string;
    last_interval: number;
    retrievability: number;
    _metadata_context?: string;
    plugins_data?: any;
    indexed_at?: string;
}

export interface Lyric {
    startTime: number;
    endTime: number;
    englishText: string;
    translatedText: string;
    words: Array<{ word: string; startTime: number; endTime: number; wordIndex: number }>;
    text_cmn?: string;
    text_jpn?: string;
    text_kor?: string;
}

export interface FlashcardType extends Phrase {
    isFlipped: boolean;
    id: string;
}

export interface AudioMessageResult {
    success: boolean;
    pairId: string;
}
