/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_CERAMIC_NODE_URL: string
    VITE_ORBIS_NODE_URL: string
    VITE_ORBIS_SONG_MODEL_ID: string
    VITE_ORBIS_PHRASE_MODEL_ID: string
    VITE_ORBIS_WORD_MODEL_ID: string
    VITE_ORBIS_USER_LEARNING_DATA_MODEL_ID: string
    VITE_ORBIS_ENVIRONMENT_ID: string
    VITE_ORBIS_USER_DECKS_MODEL_ID: string
    // Add other environment variables as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module '@useorbis/db-sdk/auth' {
    export class OrbisEVMAuth {
        constructor(provider: any);
    }
}