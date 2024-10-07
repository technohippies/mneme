import { OrbisDB } from "@useorbis/db-sdk";

console.log('Initializing OrbisDB...');
export const db = new OrbisDB({
    ceramic: {
        gateway: "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/"
    },
    nodes: [
        {
            gateway: "https://studio.useorbis.com",
            env: "did:pkh:eip155:1:0x25b4048c3b3c58973571db2dbbf87103f7406966"
        }
    ]
});

console.log('OrbisDB initialized:', db);

export const ORBIS_CONTEXT_ID = import.meta.env.VITE_ORBIS_CONTEXT_ID;
export const ORBIS_USER_LEARNING_DATA_MODEL_ID = import.meta.env.VITE_ORBIS_USER_LEARNING_DATA_MODEL_ID;
export const ORBIS_PROMPTS_MODEL_ID = import.meta.env.VITE_ORBIS_PROMPTS_MODEL_ID;
export const ORBIS_USER_DECKS_MODEL_ID = import.meta.env.VITE_ORBIS_USER_DECKS_MODEL_ID;
export const ORBIS_PHRASE_MODEL_ID = import.meta.env.VITE_ORBIS_PHRASE_MODEL_ID;
export const ORBIS_WORD_MODEL_ID = import.meta.env.VITE_ORBIS_WORD_MODEL_ID;
export const ORBIS_SONG_MODEL_ID = import.meta.env.VITE_ORBIS_SONG_MODEL_ID;

// Log all environment variables
console.log('Environment Variables:');
console.log('ORBIS_CONTEXT_ID:', ORBIS_CONTEXT_ID);
console.log('ORBIS_USER_LEARNING_DATA_MODEL_ID:', ORBIS_USER_LEARNING_DATA_MODEL_ID);
console.log('ORBIS_PROMPTS_MODEL_ID:', ORBIS_PROMPTS_MODEL_ID);
console.log('ORBIS_USER_DECKS_MODEL_ID:', ORBIS_USER_DECKS_MODEL_ID);
console.log('ORBIS_PHRASE_MODEL_ID:', ORBIS_PHRASE_MODEL_ID);
console.log('ORBIS_WORD_MODEL_ID:', ORBIS_WORD_MODEL_ID);
console.log('ORBIS_SONG_MODEL_ID:', ORBIS_SONG_MODEL_ID);

// Validate that all required environment variables are present
const missingVars = [];
if (!ORBIS_CONTEXT_ID) missingVars.push('VITE_ORBIS_CONTEXT_ID');
if (!ORBIS_USER_LEARNING_DATA_MODEL_ID) missingVars.push('VITE_ORBIS_USER_LEARNING_DATA_MODEL_ID');
if (!ORBIS_PROMPTS_MODEL_ID) missingVars.push('VITE_ORBIS_PROMPTS_MODEL_ID');

if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars.join(', '));
    throw new Error(`Configuration error: Missing environment variables: ${missingVars.join(', ')}`);
}

console.log('All required environment variables are present.');

export const getCurrentUserDID = async (): Promise<string | null> => {
    try {
        const session = db.session;
        if (!session) {
            console.error('No active session found');
            return null;
        }
        
        // Use the raw DID as suggested by the developer
        const userDid = db.did?.hasParent ? db.did.parent : db.did?.id;
        
        if (!userDid) {
            console.error('Failed to retrieve user DID');
            return null;
        }
        
        return userDid;
    } catch (error) {
        console.error('Error getting current user DID:', error);
        return null;
    }
};

export const logCeramicConnectionStatus = async () => {
    const isConnected = await db.isUserConnected();
    console.log('Is user connected to Ceramic:', isConnected);
    if (isConnected) {
        const user = await db.getConnectedUser();
        console.log('Connected user:', user);
    }
};