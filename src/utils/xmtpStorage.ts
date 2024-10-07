export const loadKeys = async (address: string): Promise<Uint8Array | null> => {
  const storedKeys = localStorage.getItem(`xmtp:keys:${address}`);
  return storedKeys ? new Uint8Array(JSON.parse(storedKeys)) : null;
};

export const storeKeys = async (address: string, keys: Uint8Array): Promise<void> => {
  localStorage.setItem(`xmtp:keys:${address}`, JSON.stringify(Array.from(keys)));
};