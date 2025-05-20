import React, { useEffect } from "react";
import { useAtom } from "jotai";
import * as Progress from "@radix-ui/react-progress";
import { TimerIcon } from "@radix-ui/react-icons";
import {
  isTimerRunningAtom,
  timerStartTimeAtom,
  elapsedTimeAtom,
} from "@/atoms";

const Timer = () => {
  const [isTimerRunning] = useAtom(isTimerRunningAtom);
  const [timerStartTime] = useAtom(timerStartTimeAtom);
  const [elapsedTime, setElapsedTime] = useAtom(elapsedTimeAtom);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning && timerStartTime) {
      interval = window.setInterval(() => {
        setElapsedTime(Date.now() - timerStartTime);
      }, 10);
      return () => window.clearInterval(interval);
    }
  }, [isTimerRunning, timerStartTime, setElapsedTime]);

  const formattedTime = (elapsedTime / 1000).toFixed(2);
  // 20秒を最大値とする進行度を計算
  const progress = Math.min((elapsedTime / 20000) * 100, 100);

  return (
    <div className="flex flex-col items-center space-y-2 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
      <div className="flex items-center space-x-2">
        <TimerIcon className="w-5 h-5 text-white/80 animate-pulse" />
        <p className="text-xl font-bold text-white">
          {formattedTime} <span className="text-white/60 text-sm">秒</span>
        </p>
      </div>
      <Progress.Root
        className="relative overflow-hidden bg-white/10 rounded-full w-[200px] h-[10px]"
        style={{
          transform: "translateZ(0)",
        }}
        value={progress}
      >
        <Progress.Indicator
          className="bg-gradient-to-r from-blue-500 to-purple-500 w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </Progress.Root>
    </div>
  );
};

export default Timer;
