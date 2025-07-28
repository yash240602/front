import { useEffect } from 'react';
import { useCalendarStore } from '../store/calendarStore';

export const useCalendarHotkeys = () => {
  const { navigateWithKeyboard } = useCalendarStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        navigateWithKeyboard(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateWithKeyboard]);
};
