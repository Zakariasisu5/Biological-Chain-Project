/*import { Web3Storage } from "web3.storage";

export async function uploadFileToWeb3Storage(file: File): Promise<string> {
  const token = (import.meta.env.VITE_WEB3STORAGE_TOKEN as string) || "";
  if (!token) {
    throw new Error("VITE_WEB3STORAGE_TOKEN is not set. Add it to .env or Vercel env variables.");
  }
     const client = new Web3Storage({ token });
  // web3.storage will return a CID for the uploaded file(s)
    const cid = await client.put([file], { wrapWithDirectory: false });
  return cid;
}
  */