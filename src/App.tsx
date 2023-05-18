import React, { useRef, useState, useEffect } from "react";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { listen } from "@tauri-apps/api/event";
import { handleImageCompression } from "./tools/imageCompression";
import { handleVideoCompression } from "./tools/videoCompressor";
import { open } from "@tauri-apps/api/dialog";
import { imageExt, vidExt } from "./constants/extension";
import { getFileExtension } from "./helpers";

const ImageCompressor: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const pathRef = useRef("");
  const [error, setError] = useState("");

  const handleCompress = async (file: string) => {
    const ext = getFileExtension(file);

    // compress image
    if (imageExt.includes(ext!)) {
      handleImageCompression({
        file,
        onError: (err) => setError(err),
        onStart: () => setError(""),
        customPath: pathRef.current,
      });
    } else {
      handleVideoCompression({
        file,
        onError: (err) => setError(err),
        onStart: () => setError(""),
        customPath: pathRef.current,
      });
    }
  };

  const handleSelectFile = async () => {
    const selected = (await open({
      multiple: false,
      filters: [
        {
          name: "Image",
          extensions: imageExt,
        },
        {
          name: "Video",
          extensions: vidExt,
        },
      ],
    })) as string;

    handleCompress(selected);
  };

  useEffect(() => {
    let tauriInstance: any;

    const startTauri = async () => {
      // Start listening for Tauri events
      tauriInstance = await listen(
        "tauri://file-drop",
        async (event: { payload: string[] }) => {
          handleCompress(event.payload[0]);
        }
      );
    };

    startTauri();

    return () => {
      // Cleanup function to close the Tauri instance and clean up resources
      const cleanupTauri = async () => {
        // Close the Tauri instance
        if (tauriInstance) {
          await tauriInstance();
        }
      };

      // Call the cleanup function when the component is unmounted
      cleanupTauri();
    };
  }, [pathRef.current]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200 p-8">
      <div className="border-dashed border-2 border-gray-400 rounded-lg p-6 mb-4 h-full w-full flex items-center justify-center min-w-[300px] flex-col">
        {error && <p className="text-red-600 text-center mb-2">{error}</p>}
        <p className="text-gray-600 text-lg mb-2 text-center">
          Drag and drop any image or video here, or
        </p>

        <button
          className="text-gray-500 border-gray-500 border py-2 px-4 rounded"
          onClick={handleSelectFile}
        >
          Select Image or Video
        </button>

        <div className="w-full max-w-md border p-4 border-black mt-8 rounded-xl">
          <div>
            <p>Custom path</p>
            <input
              className="w-full  mt-1 border p-2 rounded"
              placeholder="default to /Users/name/desktop"
              onChange={(e) => (pathRef.current = e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;
