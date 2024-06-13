import config from "../config/config";
import { blobServiceClient } from "../config/azure";

export const uploadFileToBlob = async (
  buffer: Buffer,
  blobName: string
): Promise<{ url: string }> => {
  const containerClient = blobServiceClient.getContainerClient(
    config.azure.storage.container.name
  );
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer);

  // Return the URL of the uploaded file
  return { url: blockBlobClient.url };
};
