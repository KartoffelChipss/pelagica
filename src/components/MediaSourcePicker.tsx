import React from "react";
import type { MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client";

type Props = {
  sources: MediaSourceInfo[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export default function MediaSourcePicker({
  sources,
  selectedId,
  onSelect,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-background rounded-xl p-4 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-3">Choose version</h2>

        <div className="space-y-2">
          {sources.map((s) => {
            const video = s.MediaStreams?.find(m => m.Type === "Video");

            return (
              <button
                key={s.Id}
                onClick={() => s.Id && onSelect(s.Id)}
                className={`w-full p-3 rounded-lg border text-left ${
                  s.Id === selectedId ? "ring-2" : ""
                }`}
                type="button"
              >
                <div className="font-medium">
                  {(video?.Height ?? "?")}p • {video?.Codec?.toUpperCase()}
                </div>
                <div className="text-sm opacity-75">
                  {s.Container?.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="opacity-75" type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
