import axios from 'axios';

interface StreakData {
  currentStreak: number;
  topStreak: number;
}

export const getStreakData = async (address: string = '0x1234...5678'): Promise<StreakData> => {
  console.log('getStreakData called with address:', address);
  try {
    const url = `https://modern-telephone-deafening.functions.on-fleek.app/streak?address=${address}`;
    console.log('Fetching streak data from URL:', url);
    const response = await axios.get<StreakData>(url);
    console.log('Received response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching streak data:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    return { currentStreak: 0, topStreak: 0 };
  }
};
