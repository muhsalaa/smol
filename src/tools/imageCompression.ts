import { writeBinaryFile, readBinaryFile } from "@tauri-apps/api/fs";
import imageCompression from "browser-image-compression";
import { getFileExtension, getFileName, getOutputPath } from "../helpers";

interface ImgCompress {
  file: string;
  onError?: (msg: string) => void;
  onStart?: () => void;
  onSuccess?: () => void;
  customPath?: string;
}

// convert file or blob back to Uint8array
const readFileAsArrayBuffer = (file: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file."));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const handleImageCompression = async ({
  file,
  onError = () => {},
  onStart = () => {},
  onSuccess = () => {},
  customPath,
}: ImgCompress) => {
  onStart();
  const options = {
    maxSizeMB: 0.6, // Maximum size in megabytes
    maxWidthOrHeight: 1200,
    maxIteration: 15,
  };
  const ext = getFileExtension(file);
  const fileName = getFileName(file);
  const outputName = "compressed_" + Date.now() + "_" + fileName;

  try {
    // read file as byte array
    const contents = await readBinaryFile(file);
    // convert the byte array to blob (File) so it can be compressed by the module
    const blob = new Blob([contents.buffer], { type: `image/${ext}` });
    // actual compression
    const compressedBlob = await imageCompression(blob as File, options);
    // convert to byte array again
    const compressedData = await readFileAsArrayBuffer(compressedBlob);

    // Save the compressed file to output path
    const targetPath = await getOutputPath(customPath);

    await writeBinaryFile(
      `${targetPath}${outputName}`,
      new Uint8Array(compressedData)
    );
    onSuccess();
  } catch (error: unknown) {
    console.log(error);
    onError("Error compressing the image or video");
  }
};
