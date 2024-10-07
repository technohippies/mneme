import { Buffer } from "buffer";

window.Buffer = window.Buffer ?? Buffer;

// Add this line to declare the global Buffer property
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}