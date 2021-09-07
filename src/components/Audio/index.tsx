import React, { useRef, useState } from "react";
import "./index.css";

export function Audio(props: {
  src: string;
  text?: string;
}): React.ReactElement {
  const { src, text } = props;
  const ref = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  return (
    <>
      <button
        className="Audio"
        onClick={() => {
          if (ref.current) {
            if (isPlaying) {
              ref.current.pause();
              ref.current.currentTime = 0;
            } else {
              ref.current.play();
            }
          }
        }}
      >
        {error ? "error " : isPlaying ? "stop" : text || "play"}
      </button>
      <audio
        src={src}
        controls={false}
        preload="none"
        ref={ref}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onStalled={() => setIsPlaying(false)}
        onError={(e) => {
          console.error(e);
          setIsPlaying(false);
          setError(true);
        }}
      />
    </>
  );
}
