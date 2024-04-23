import { Command } from "@tauri-apps/api/shell";
import { getFileName, getOutputPath } from "../helpers";

interface VidCompress {
  file: string;
  onError?: (msg: string) => void;
  onStart?: () => void;
  onSuccess?: () => void;
  customPath?: string;
}

export const handleVideoCompression = async ({
  file,
  onError = () => {},
  onStart = () => {},
  onSuccess = () => {},
  customPath,
}: VidCompress) => {
  onStart();

  const targetPath = await getOutputPath(customPath);
  const fileName = getFileName(file);
  const outputName = "compressed_" + Date.now() + "_" + fileName;
  console.log([
    "-y",
    "-i",
    file,
    "-vcodec",
    "libx264",
    "-crf",
    "22",
    "-r",
    "30",
    "-movflags",
    "+faststart",
    targetPath + outputName,
  ]);

  try {
    const cmd = new Command("compress_video", [
      "-y",
      "-i",
      file,
      "-vcodec",
      "libx264",
      "-crf",
      "22",
      "-r",
      "30",
      "-movflags",
      "+faststart",
      targetPath + outputName,
    ]);

    await cmd.execute();
    onSuccess();
  } catch (error: unknown) {
    console.log(error);

    onError("Error compressing the image or video");
  }
};
