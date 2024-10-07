import { ZERO_ADDRESS } from "../constants";
import type { Address } from "viem";
import { useWalletClient } from "wagmi";

const useEthersWalletClient = (): {
  data: {
    getAddress: () => Promise<Address>;
    signMessage: (message: string) => Promise<string>;
  } | undefined;
  isLoading: boolean;
} => {
  const { data, isLoading } = useWalletClient();

  const ethersWalletClient = data
    ? {
        getAddress: async (): Promise<Address> => {
          return data.account.address ?? ZERO_ADDRESS;
        },
        signMessage: async (message: string): Promise<string> => {
          const signature = await data.signMessage({ message });
          return signature ?? "";
        },
      }
    : undefined;

  return { data: ethersWalletClient, isLoading };
};

export default useEthersWalletClient;