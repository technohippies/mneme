import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lyric } from '../../types/index';

interface LyricsDisplayProps {
  lyrics: Lyric[];
  currentTime: number;
  setCurrentTime: (time: number) => void;
  highlightColor: string;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  currentTime,
  setCurrentTime,
  highlightColor,
}) => {
  const { i18n } = useTranslation();

  console.log('LyricsDisplay: Rendering with props', { lyrics, currentTime, highlightColor });

  const renderText = (text: string, words: Lyric['words'], isTranslation: boolean) => {
    console.log('LyricsDisplay: renderText called with', { text, words, isTranslation });
    let wordIndex = 0;
    return text.split('\n').map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(' ').map((word, index) => {
          if (word.trim() === '') return null;
          const wordData = isTranslation ? null : words[wordIndex];
          // console.log('LyricsDisplay: Processing word', { word, wordData, currentTime });
          if (!isTranslation) wordIndex++;
          return (
            <React.Fragment key={`${lineIndex}-${index}`}>
              <span
                className={`transition-colors duration-200 ease-in-out ${
                  !isTranslation ? 'cursor-pointer' : ''
                } ${
                  wordData && currentTime >= wordData.startTime && currentTime < wordData.endTime
                    ? highlightColor
                    : ''
                }`}
                onClick={() => wordData && setCurrentTime(wordData.startTime)}
              >
                {word}
              </span>
              {' '}
            </React.Fragment>
          );
        })}
        {lineIndex < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getTranslatedText = (lyric: Lyric) => {
    const currentLanguage = i18n.language;
    console.log('Current language:', currentLanguage);
    console.log('Lyric object:', lyric);
    
    let translatedText = lyric.translatedText;
    if (currentLanguage === 'cmn' && lyric.text_cmn) {
      translatedText = lyric.text_cmn;
    } else if (currentLanguage === 'jpn' && lyric.text_jpn) {
      translatedText = lyric.text_jpn;
    } else if (currentLanguage === 'kor' && lyric.text_kor) {
      translatedText = lyric.text_kor;
    }
    
    console.log('Selected translated text:', translatedText);
    return translatedText || lyric.englishText; // Fallback to English if no translation
  };

  return (
    <div className="lyrics-display w-full h-full flex items-center ">
      <div className="max-w-full max-h-full overflow-y-auto px-4">
        {lyrics.map((lyric, index) => (
          <div key={index} className="mb-4">
            <div className="text-2xl font-bold mb-2">
              {renderText(lyric.englishText, lyric.words, false)}
            </div>
            <div className="text-lg text-gray-400">
              {renderText(getTranslatedText(lyric), [], true)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};