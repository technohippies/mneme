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

export async function getFollowers(addressOrENS: string, limit: number = 1000, offset: number = 0): Promise<EFPFollower[]> {
  console.log(`Fetching followers for ${addressOrENS} with limit ${limit} and offset ${offset}`);
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/followers?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      console.warn('Failed to fetch followers. Status:', response.status);
      return [];
    }
    const data = await response.json();
    console.log('Followers data:', JSON.stringify(data, null, 2));
    return data.followers;
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

export async function getFollowing(addressOrENS: string, limit: number = 1000, offset: number = 0): Promise<EFPFollower[]> {
  console.log(`Fetching following for ${addressOrENS} with limit ${limit} and offset ${offset}`);
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/following?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      console.warn('Failed to fetch following. Status:', response.status);
      return [];
    }
    const data = await response.json();
    console.log('Following data:', JSON.stringify(data, null, 2));
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
    return data.primary_list !== null && data.lists.length > 0;
  } catch (error) {
    console.error('Error checking if user has EFP list:', error);
    return false;
  }
}

export async function getUserListsDetails(addressOrENS: string): Promise<any> {
  console.log('Fetching user lists details:', addressOrENS);
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/lists`);
    if (!response.ok) {
      console.warn('Failed to fetch user lists details. Status:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('User lists details:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching user lists details:', error);
    return null;
  }
}

export async function getEFPUserStats(addressOrENS: string): Promise<{ followers_count: string; following_count: string } | null> {
  console.log(`Fetching EFP stats for ${addressOrENS}`);
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/stats`);
    if (!response.ok) {
      console.warn('Failed to fetch EFP user stats. Status:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('EFP user stats:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching EFP user stats:', error);
    return null;
  }
}

export async function getEFPUserENS(addressOrENS: string): Promise<any> {
  console.log(`Fetching EFP ENS data for ${addressOrENS}`);
  try {
    const response = await fetch(`${EFP_API_BASE_URL}/users/${addressOrENS}/ens`);
    if (!response.ok) {
      console.warn('Failed to fetch EFP user ENS data. Status:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('EFP user ENS data:', JSON.stringify(data, null, 2));
    return data.ens;
  } catch (error) {
    console.error('Error fetching EFP user ENS data:', error);
    return null;
  }
}
