import { create } from 'zustand';
import { format, addDays, subDays, addWeeks, subWeeks } from 'date-fns';

interface CalendarState {
  currentMonth: Date;
  selectedDate: string | null;
  viewMode: 'day' | 'week' | 'month';
  rangeStart: string | null;
  rangeEnd: string | null;
  setCurrentMonth: (date: Date) => void;
  setSelectedDate: (date: string | null) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  setDateRange: (date: string) => void;
  clearRange: () => void;
  clearDateRange: () => void; // Added method
  navigateWithKeyboard: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentMonth: new Date(),
  selectedDate: null,
  viewMode: 'day',
  rangeStart: null,
  rangeEnd: null,
  
  setCurrentMonth: (date) => set({ currentMonth: date }),
  
  setSelectedDate: (date) => set({ 
    selectedDate: date, 
    rangeStart: null, 
    rangeEnd: null 
  }),
  
  setViewMode: (mode) => set({ 
    viewMode: mode, 
    selectedDate: null, 
    rangeStart: null, 
    rangeEnd: null 
  }),
  
  setDateRange: (date) => set((state) => {
    if (!state.rangeStart || state.rangeEnd) {
      return { rangeStart: date, rangeEnd: null, selectedDate: null };
    }
    const start = new Date(state.rangeStart);
    const end = new Date(date);
    return start > end 
      ? { rangeStart: date, rangeEnd: state.rangeStart } 
      : { rangeEnd: date };
  }),
  
  clearRange: () => set({ rangeStart: null, rangeEnd: null }),
  clearDateRange: () => set({ rangeStart: null, rangeEnd: null }), // Same as clearRange
  
  navigateWithKeyboard: (direction) => {
    const { selectedDate, setSelectedDate, setCurrentMonth } = get();
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    let newDate;
    
    switch (direction) {
      case 'left':
        newDate = subDays(baseDate, 1);
        break;
      case 'right':
        newDate = addDays(baseDate, 1);
        break;
      case 'up':
        newDate = subWeeks(baseDate, 1);
        break;
      case 'down':
        newDate = addWeeks(baseDate, 1);
        break;
      default:
        return;
    }
    
    const newDateString = format(newDate, 'yyyy-MM-dd');
    setSelectedDate(newDateString);
    
    // Update month if we navigated to a different month
    if (newDate.getMonth() !== get().currentMonth.getMonth()) {
      setCurrentMonth(newDate);
    }
  },
}));

export const selectSelectedDate = (state: CalendarState) => state.selectedDate;