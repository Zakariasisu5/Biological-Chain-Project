// src/integrations/ipfs.ts
import { Web3Storage } from "web3.storage";

/**
 * Helper to create a Web3.Storage client.
 * Make sure you set NEXT_PUBLIC_WEB3_STORAGE_TOKEN in your .env.local file
 */
function makeStorageClient() {
  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error("Missing Web3.Storage API token. Add NEXT_PUBLIC_WEB3_STORAGE_TOKEN to your .env.local file.");
  }
  return new Web3Storage({ token });
}

/**
 * Uploads a file to Web3.Storage and returns its CID.
 * @param file A File object from the browser
 * @returns CID string
 */
export async function uploadFileToWeb3Storage(file: File): Promise<string> {
  try {
    const client = makeStorageClient();
    const cid = await client.put([file], {
      wrapWithDirectory: false, // stores the file directly without wrapping
    });
    console.log("✅ Uploaded to Web3.Storage, CID:", cid);
    return cid;
  } catch (err) {
    console.error("❌ Web3.Storage upload failed:", err);
    throw err;
  }
}
