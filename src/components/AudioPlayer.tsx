"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { Play, Speaker, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { currentQuestionIndexAtom, mutedAtom } from "@/atoms";
import "@/styles/components/AudioPlayer.scss";

const AudioPlayer = () => {
  const [currentQuestionIndex] = useAtom(currentQuestionIndexAtom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useAtom(mutedAtom);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentAudio = `/audio/question${currentQuestionIndex + 1}.mp3`;

  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentQuestionIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("再生エラー:", error);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (audioRef.current) {
      audioRef.current.muted = !muted;
    }
  };

  return (
    <div className="audio-player">
      <Button
        variant="outline"
        onClick={togglePlay}
        className="audio-player__button"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? <XCircle className="icon" /> : <Play className="icon" />}
      </Button>
      <Button
        variant="outline"
        onClick={toggleMute}
        className="audio-player__button"
        aria-label={muted ? "Unmute audio" : "Mute audio"}
      >
        <Speaker className={cn("icon", muted && "line-through")} />
      </Button>
      <audio
        ref={audioRef}
        src={currentAudio}
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default AudioPlayer;
