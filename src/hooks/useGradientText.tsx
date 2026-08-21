
import { useState, useEffect } from 'react';

const gradients = [
  'from-purple-500 to-pink-500',
  'from-orange-500 to-yellow-300',
  'from-blue-500 to-teal-400',
  'from-green-400 to-cyan-500',
  'from-pink-500 to-rose-500'
];

export const useGradientText = (index: number = 0) => {
  const [currentGradient, setCurrentGradient] = useState(0);
  const delay = index * 200; // Stagger the animations

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentGradient((prev) => (prev + 1) % gradients.length);
    }, 1000);

    // Initial delay for staggered start
    const timeoutId = setTimeout(() => {
      intervalId;
    }, delay);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return `bg-gradient-to-r ${gradients[currentGradient]} bg-clip-text text-transparent transition-all duration-500`;
};
