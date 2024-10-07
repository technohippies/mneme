const FLEEK_FUNCTION_URL = 'https://prehistoric-lock-harsh.functions.on-fleek.app';

export async function uploadToPinata(file: File): Promise<string> {
  console.log(`uploadToPinata called with file:`, file.name);
  try {
    // Read the file content as a base64 string
    const fileContent = await readFileAsBase64(file);

    const payload = {
      fileName: file.name,
      fileContent: fileContent,
      mimeType: file.type
    };

    const response = await fetch(FLEEK_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log(`Pinata upload response:`, JSON.stringify(result, null, 2));

    if (result.result && result.result.IpfsHash) {
      return result.result.IpfsHash;
    } else {
      throw new Error('No IPFS hash returned from Pinata');
    }
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Content = reader.result.split(',')[1];
        resolve(base64Content);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}