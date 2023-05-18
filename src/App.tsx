import React, { useRef, useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { handleImageCompression } from "./tools/imageCompression";
import { handleVideoCompression } from "./tools/videoCompressor";
import { open } from "@tauri-apps/api/dialog";
import { imageExt, vidExt } from "./constants/extension";
import { getFileExtension } from "./helpers";

const ImageCompressor: React.FC = () => {
  const pathRef = useRef("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleCompress = async (file: string) => {
    if (processing) return;

    const ext = getFileExtension(file);

    // compress image
    if (imageExt.includes(ext!)) {
      handleImageCompression({
        file,
        onError: (err) => {
          setError(err);
          setProcessing(false);
        },
        onSuccess: () => setProcessing(false),
        onStart: () => {
          setError("");
          setProcessing(true);
        },
        customPath: pathRef.current,
      });
    } else {
      handleVideoCompression({
        file,
        onError: (err) => {
          setError(err);
          setProcessing(false);
        },
        onSuccess: () => setProcessing(false),
        onStart: () => {
          setError("");
          setProcessing(true);
        },
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
        {processing && (
          <div className="flex items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-9 h-9 text-cyan-500 mr-2 animate-spin"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
              />
            </svg>
            <span className="text-cyan-500">Compressing...</span>
          </div>
        )}
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
              placeholder="default to /Users/name/desktop/"
              onChange={(e) => (pathRef.current = e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;
