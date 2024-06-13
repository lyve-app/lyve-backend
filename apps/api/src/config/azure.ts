import {
  BlobServiceClient,
  StorageSharedKeyCredential
} from "@azure/storage-blob";
import config from "./config";

const sharedKeyCredential = new StorageSharedKeyCredential(
  config.azure.storage.account.name,
  config.azure.storage.account.key
);

export const blobServiceClient = new BlobServiceClient(
  `https://${config.azure.storage.account.name}.blob.core.windows.net`,
  sharedKeyCredential
);
