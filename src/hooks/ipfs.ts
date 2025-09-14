import { create } from 'ipfs-http-client';

const projectId = import.meta.env.VITE_INFURA_PROJECT_ID;
const projectSecret = import.meta.env.VITE_INFURA_PROJECT_SECRET;
const auth = `Basic ${btoa(`${projectId}:${projectSecret}`)}`;

export const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export const uploadFileToIPFS = async (file: File | Blob): Promise<string> => {
  const result = await ipfs.add(file);
  return result.path; // CID
};
