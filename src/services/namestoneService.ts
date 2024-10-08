const NAMESTONE_API_URL = 'https://crashing-market-brief.functions.on-fleek.app';
const FLEEK_FUNCTION_URL = 'https://prehistoric-lock-harsh.functions.on-fleek.app';

export async function getName(address: string): Promise<any[] | null> {
  console.log(`getName called with address: ${address}`);
  if (!address) {
      console.error('getName called with empty address');
      return null;
  }
  try {
      const response = await fetch(`${NAMESTONE_API_URL}/get-names?address=${address}&domain=vstudent.eth`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
      });
      console.log(`getName API response status: ${response.status}`);

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`getName API response data:`, JSON.stringify(data, null, 2));

      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          console.log(`Returning name records:`, data.data);
          return data.data;
      }
      console.log(`No name found for address: ${address}`);
      return null;
  } catch (error) {
      console.error('Error fetching name:', error);
      return null;
  }
}

export async function getTextRecords(address: string): Promise<Record<string, string>> {
    console.log(`getTextRecords called with address: ${address}`);
    if (!address) {
        console.error('getTextRecords called with empty address');
        return {};
    }
    try {
        const response = await fetch(`${NAMESTONE_API_URL}/get-names?domain=vstudent.eth&address=${address}`, {
            headers: { 'Authorization': process.env.NAMESTONE_API_KEY || '' }
        });
        console.log(`getTextRecords API response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`getTextRecords API response data:`, JSON.stringify(data, null, 2));

        if (data && data.length > 0 && data[0].text_records) {
            console.log(`Returning text records:`, data[0].text_records);
            return data[0].text_records;
        }
        console.log(`No text records found for address: ${address}`);
        return {};
    } catch (error) {
        console.error('Error fetching text records:', error);
        return {};
    }
}

export async function setName(data: {
  name: string;
  address: string;
  text_records?: Record<string, string>;
  contenthash?: string;
  coin_types?: Record<string, string>;
}): Promise<boolean> {
  console.log(`setName called with data:`, JSON.stringify(data, null, 2));
  try {
    const response = await fetch(`${NAMESTONE_API_URL}/set-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.NAMESTONE_API_KEY || ''
      },
      body: JSON.stringify(data)
    });
    console.log(`setName API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`setName API response data:`, JSON.stringify(result, null, 2));
    return result.success;
  } catch (error) {
    console.error('Error setting name:', error);
    return false;
  }
}

export async function claimName(data: {
  name: string;
  address: string;
  text_records?: Record<string, string>;
  contenthash?: string;
}): Promise<boolean> {
  console.log(`claimName called with data:`, JSON.stringify(data, null, 2));
  try {
    const response = await fetch(`${NAMESTONE_API_URL}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.NAMESTONE_API_KEY || ''
      },
      body: JSON.stringify(data)
    });
    console.log(`claimName API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`claimName API response data:`, JSON.stringify(result, null, 2));
    return result.success;
  } catch (error) {
    console.error('Error claiming name:', error);
    return false;
  }
}

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

export async function updateAvatar(formData: FormData): Promise<{ success: boolean; error?: string }> {
  console.log(`updateAvatar called with formData:`, Object.fromEntries(formData));
  try {
    const address = formData.get('address');
    const avatarUrl = formData.get('avatarUrl');

    if (!address || !avatarUrl) {
      throw new Error('Missing required data for avatar update');
    }

    const response = await fetch(`${NAMESTONE_API_URL}/set-name`, {
      method: 'POST',
      headers: {
        'Authorization': process.env.NAMESTONE_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: 'vstudent.eth',
        address: address,
        text_records: {
          avatar: avatarUrl
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log(`updateAvatar API response:`, JSON.stringify(result, null, 2));
    return { success: result.success };
  } catch (error) {
    console.error('Error updating avatar:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update avatar' };
  }
}

export async function checkDomainAvailability(name: string): Promise<boolean> {
  console.log(`checkDomainAvailability called with name: ${name}`);
  try {
    const response = await fetch(`${NAMESTONE_API_URL}/check`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    console.log(`checkDomainAvailability API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`checkDomainAvailability API response:`, JSON.stringify(result, null, 2));
    return result.isAvailable;
  } catch (error) {
    console.error('Error checking domain availability:', error);
    return false;
  }
}

export async function getProfileData(identifier: string): Promise<any | null> {
  console.log(`getProfileData called with identifier: ${identifier}`);
  if (!identifier) {
    console.error('getProfileData called with empty identifier');
    return null;
  }
  try {
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(identifier);
    let queryParam;
    if (isAddress) {
      queryParam = `address=${identifier}`;
    } else {
      // If it's not an address, it must be a name
      // Remove .vstudent.eth if it's present
      const name = identifier.replace('.vstudent.eth', '');
      queryParam = `name=${name}`;
    }
    
    const url = `${NAMESTONE_API_URL}/get-names?${queryParam}&domain=vstudent.eth`;
    console.log(`Fetching profile data from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.NAMESTONE_API_KEY || ''
      }
    });
    console.log(`getProfileData API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`getProfileData API response data:`, JSON.stringify(data, null, 2));

    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      console.log(`Returning profile data:`, data.data[0]);
      return {
        ...data.data[0],
        names: data.data.map((item: any) => `${item.name}.${item.domain}`)
      };
    } else {
      // Return a default profile structure when no Namestone data is found
      console.log(`No Namestone profile found for: ${identifier}. Returning default profile.`);
      return {
        address: isAddress ? identifier : '',
        name: isAddress ? '' : identifier,
        domain: 'vstudent.eth',
        text_records: {
          avatar: '/images/avatar.png',
          cover: '/images/user_cover.png'
        },
        names: []
      };
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
}