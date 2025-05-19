import React, { useEffect } from "react";
import { useAtom } from "jotai";
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
    let interval: NodeJS.Timer;
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - timerStartTime);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, timerStartTime, setElapsedTime]);

  const formattedTime = (elapsedTime / 1000).toFixed(2);

  return (
    <div className="text-center">
      <p className="text-xl font-bold text-white">
        経過時間: {formattedTime} 秒
      </p>
    </div>
  );
};

export default Timer;
