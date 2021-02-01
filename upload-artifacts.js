const { BlobServiceClient } = require("@azure/storage-blob");
const { readFileSync } = require("fs-extra");
const { resolve } = require("path");

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);

const containerName = "artifacts";

async function main() {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const os = process.argv[2];
    const file = process.argv[3];

    const data = readFileSync(resolve(process.cwd(), file), "utf-8");

    const blobName = `${os}/${file}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
}

main();