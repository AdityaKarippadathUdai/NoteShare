import { useState, useEffect } from 'react';

/**
 * Custom hook for live countdown to an expiration timestamp.
 * 
 * @param {string|number|Date} expiresAt 
 * @param {() => void} [onExpire] 
 * @returns {{
 *   formattedTime: string,
 *   isExpired: boolean,
 *   totalSecondsLeft: number,
 *   hours: number,
 *   minutes: number,
 *   seconds: number
 * }}
 */
export function useCountdown(expiresAt, onExpire) {
  const calculateTimeLeft = () => {
    if (!expiresAt) {
      return { totalSeconds: 0, isExpired: true };
    }

    const expiryTime = new Date(expiresAt).getTime();
    if (isNaN(expiryTime)) {
      return { totalSeconds: 0, isExpired: true };
    }

    const diff = expiryTime - Date.now();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    return {
      totalSeconds,
      isExpired: totalSeconds <= 0,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current);

      if (current.isExpired) {
        clearInterval(interval);
        if (typeof onExpire === 'function') {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const { totalSeconds, isExpired } = timeLeft;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  let formattedTime = 'Drop expired';
  if (!isExpired) {
    if (hours > 0) {
      formattedTime = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else {
      formattedTime = `${pad(minutes)}:${pad(seconds)}`;
    }
  }

  return {
    formattedTime,
    isExpired,
    totalSecondsLeft: totalSeconds,
    hours,
    minutes,
    seconds,
  };
}

export default useCountdown;
