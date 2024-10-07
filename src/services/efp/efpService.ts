const EFP_API_BASE_URL = 'https://api.ethfollow.xyz/api/v1';

interface EFPUserAccount {
  address: string;
  ens?: {
    name: string;
    avatar?: string;
    records?: {
      avatar?: string;
      name?: string;
      [key: string]: string | undefined;
    };
    updated_at: string;
  };
}

interface EFPFollower {
  efp_list_nft_token_id: string;
  address: string;
  tags: string[];
  is_following: boolean;
  is_blocked: boolean;
  is_muted: boolean;
}

export async function getEFPUserAccount(addressOrENS: string): Promise<EFPUserAccount | null> {
  console.log('Fetching EFP user account for:', addressOrENS);
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/account`);
    if (!response.ok) {
      console.warn('Failed to fetch EFP user account. Status:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('EFP user account data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching EFP user account:', error);
    return null;
  }
}

export async function getFollowers(addressOrENS: string, limit: number = 10, offset: number = 0): Promise<EFPFollower[]> {
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/followers?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      console.warn('Failed to fetch followers');
      return [];
    }
    const data = await response.json();
    return data.followers;
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

export async function getFollowing(addressOrENS: string, limit: number = 10, offset: number = 0): Promise<EFPFollower[]> {
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/following?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      console.warn('Failed to fetch following');
      return [];
    }
    const data = await response.json();
    return data.following;
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}

export async function checkIfUserHasList(addressOrENS: string): Promise<boolean> {
  console.log('Checking if user has EFP list:', addressOrENS);
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/lists`);
    if (!response.ok) {
      console.warn('Failed to fetch user lists. Status:', response.status);
      return false;
    }
    const data = await response.json();
    console.log('User lists data:', JSON.stringify(data, null, 2));
    return data.primary_list !== null;
  } catch (error) {
    console.error('Error checking if user has EFP list:', error);
    return false;
  }
}
