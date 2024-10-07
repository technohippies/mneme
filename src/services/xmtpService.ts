// src/services/xmtpService.ts

import { Client } from '@xmtp/xmtp-js';
import { WalletClient } from 'viem';
import { 
  AttachmentCodec, 
  ContentTypeAttachment,
  Attachment
} from '@xmtp/content-type-remote-attachment';
import { Phrase } from '../types/index';
import { v4 as uuidv4 } from 'uuid';
import { DecodedMessage } from '@xmtp/xmtp-js';

let xmtpClient: Client | null = null;
let messageStreamCallback: ((message: DecodedMessage) => void) | null = null;

const createXmtpSignerFromViem = (walletClient: WalletClient) => ({
  getAddress: async () => {
    if (!walletClient.account) throw new Error("No account found in WalletClient");
    return walletClient.account.address;
  },
  signMessage: async (message: string) => {
    if (!walletClient.account) throw new Error("No account found in WalletClient");
    return walletClient.signMessage({ account: walletClient.account, message });
  },
});

export const hasExistingXmtpIdentity = async (walletClient: WalletClient): Promise<boolean> => {
  try {
    const signer = createXmtpSignerFromViem(walletClient);
    const address = await signer.getAddress();
    return await Client.canMessage(address);
  } catch (error) {
    console.error('Error checking XMTP identity:', error);
    return false;
  }
};

export const startMessageStream = async () => {
  if (!xmtpClient) {
    console.error('XMTP client not initialized');
    throw new Error('XMTP client not initialized');
  }

  console.log('Starting to stream all messages');
  try {
    const stream = await xmtpClient.conversations.streamAllMessages();
    console.log('Stream created successfully');
    for await (const message of stream) {
      console.log(`New message received in stream:`, message);
      if (messageStreamCallback) {
        messageStreamCallback(message);
      }
    }
  } catch (error) {
    console.error('Error in message stream:', error);
  }
};

export const setMessageStreamCallback = (callback: (message: DecodedMessage) => void) => {
  messageStreamCallback = callback;
};

export interface AudioMessageResult {
  id: string;
  content: string;
  contentType: typeof ContentTypeAttachment;
  sender: string;
  senderAddress: string | undefined;
  isAttachment: boolean;
  filename: string;
  mimeType: string;
  timestamp: Date;
  pairId: string;
}

export const parseScoreFromMessage = (message: DecodedMessage): { score?: number, pairId: string, error?: string } | null => {
  console.log(`Parsing message for score`);
  console.log(`Message content:`, message.content);

  if (typeof message.content === 'string') {
    try {
      const parsedContent = JSON.parse(message.content);
      if (typeof parsedContent.pairId === 'string') {
        if (typeof parsedContent.score === 'number') {
          console.log(`Parsed score: ${parsedContent.score}, pairId: ${parsedContent.pairId}`);
          return { score: parsedContent.score, pairId: parsedContent.pairId };
        } else if (typeof parsedContent.error === 'string') {
          console.log(`Parsed error: ${parsedContent.error}, pairId: ${parsedContent.pairId}`);
          return { pairId: parsedContent.pairId, error: parsedContent.error };
        }
      }
    } catch (error) {
      console.error('Error parsing message content:', error);
    }
  }

  console.log(`No valid score or error found in message`);
  return null;
};

export const sendAudioMessage = async (
  walletClient: WalletClient, 
  audioBlob: Blob, 
  phrase: Partial<Phrase>
): Promise<AudioMessageResult> => {
  console.log('sendAudioMessage called with:', { walletClient: !!walletClient, audioBlob, phrase });
  try {
    if (!xmtpClient) {
      console.log('Initializing XMTP client...');
      const signer = createXmtpSignerFromViem(walletClient);
      xmtpClient = await Client.create(signer, { env: 'dev' });
      xmtpClient.registerCodec(new AttachmentCodec());
      console.log('XMTP client initialized and AttachmentCodec registered');
    }

    const conversation = await xmtpClient.conversations.newConversation(
      "0xF4730c6c3d15aA869A4B2f5b33bbe17Ce0eefD57"
    );
    console.log('Conversation created');

    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio blob type:', audioBlob.type);

    const pairId = uuidv4();

    const phraseDataString = JSON.stringify({
      text: phrase.text,
      stream_id: phrase.stream_id,
      pairId: pairId
    });
    console.log('Sending phrase data...');
    await conversation.send(phraseDataString);
    console.log('Phrase data sent successfully via XMTP');

    const attachment: Attachment = {
      filename: `${pairId}.webm`,
      mimeType: audioBlob.type,
      data: uint8Array
    };

    console.log('Sending audio attachment...');
    const audioMessage = await conversation.send(attachment, { contentType: ContentTypeAttachment });
    console.log('Audio message sent successfully via XMTP:', audioMessage);

    const blobUrl = URL.createObjectURL(new Blob([uint8Array], { type: audioBlob.type }));

    return {
      id: audioMessage.id,
      content: blobUrl,
      contentType: ContentTypeAttachment,
      sender: 'user',
      senderAddress: walletClient.account?.address,
      isAttachment: true,
      filename: `${pairId}.webm`,
      mimeType: audioBlob.type,
      timestamp: new Date(),
      pairId: pairId
    };

  } catch (error) {
    console.error('Error sending audio message via XMTP:', error);
    throw error;
  }
};