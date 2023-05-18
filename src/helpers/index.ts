import { exists } from "@tauri-apps/api/fs";
import { desktopDir } from "@tauri-apps/api/path";

export const getOutputPath = async (customPath?: string) => {
  const desktopPath = await desktopDir();
  const customPathExists = customPath && (await exists(customPath));
  const targetPath = customPathExists ? customPath : desktopPath;
  return targetPath;
};

export const getFileExtension = (file: string) => file.split(".").pop();
export const getFileName = (file: string) => file.split("/").pop();
