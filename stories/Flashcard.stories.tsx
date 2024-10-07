import React from 'react';
import { Flashcard } from '../src/components/core/Flashcard';

export default {
    title: 'Core/Flashcard',
    component: Flashcard,
};

export const Default = () => (
    <div style={{ width: '300px', height: '400px' }}>
        <Flashcard
            text="Bitcoin"
            text_cmn="比特币"
            tts_cid="QmQFFX6UjmdH4uQgstCXxnh5nHJYPVjfkaaaKsPowDo3TT"
            audio_cid="QmQFFX6UjmdH4uQgstCXxnh5nHJYPVjfkaaaKsPowDo3TT"
            onAgain={() => console.log('Again clicked')}
            onGood={() => console.log('Good clicked')}
        />
    </div>
);

export const WithBackgroundImage = () => (
    <div style={{ width: '300px', height: '400px' }}>
        <Flashcard
            text="Bitcoin"
            text_cmn="比特币"
            tts_cid="QmQFFX6UjmdH4uQgstCXxnh5nHJYPVjfkaaaKsPowDo3TT"
            audio_cid="QmQFFX6UjmdH4uQgstCXxnh5nHJYPVjfkaaaKsPowDo3TT"
            background_image_cid="QmQFFX6UjmdH4uQgstCXxnh5nHJYPVjfkaaaKsPowDo3TT"
            onAgain={() => console.log('Again clicked')}
            onGood={() => console.log('Good clicked')}
        />
    </div>
);

export const NoAudio = () => (
    <div style={{ width: '300px', height: '400px' }}>
        <Flashcard
            text="Bitcoin"
            text_cmn="比特币"
            onAgain={() => console.log('Again clicked')}
            onGood={() => console.log('Good clicked')}
        />
    </div>
);