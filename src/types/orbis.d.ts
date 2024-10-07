declare module '@useorbis/db-sdk/dist/types/providers' {
    export interface IEVMProvider {
      request(params: { method: string; params?: unknown[] | object }): Promise<any>;
      // Add other properties as needed
    }
  }