import { useEffect } from 'react';
import { useCalendarStore } from '../store/calendarStore';

interface UseCalendarHotkeysProps {
  calendarDays: any[];
  viewDate: Date;
  setViewDate: (date: Date) => void;
}

export const useCalendarHotkeys = ({ calendarDays, viewDate, setViewDate }: UseCalendarHotkeysProps) => {
  const { selectedDate, setSelectedDate } = useCalendarStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle arrow keys when we have a selected date
      if (!selectedDate) return;
      
      // Don't interfere with other keyboard shortcuts
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      
      const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!arrowKeys.includes(event.key)) return;
      
      event.preventDefault();
      
      const currentDate = new Date(selectedDate);
      let newDate: Date;
      
      switch (event.key) {
        case 'ArrowLeft':
          newDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
          break;
        case 'ArrowRight':
          newDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          break;
        case 'ArrowUp':
          newDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
          break;
        case 'ArrowDown':
          newDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
          break;
        default:
          return;
      }
      
      const newDateStr = newDate.toISOString().split('T')[0];
      
      // Find if this date exists in our calendar
      const dayData = calendarDays.find(d => 
        d.date.toISOString().split('T')[0] === newDateStr
      );
      
      if (dayData) {
        setSelectedDate(newDateStr);
        
        // Auto-navigate to different month if needed
        const newMonth = newDate.getMonth();
        const newYear = newDate.getFullYear();
        const currentMonth = viewDate.getMonth();
        const currentYear = viewDate.getFullYear();
        
        if (newMonth !== currentMonth || newYear !== currentYear) {
          setViewDate(new Date(newYear, newMonth, 1));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, setSelectedDate, calendarDays, viewDate, setViewDate]);
};
