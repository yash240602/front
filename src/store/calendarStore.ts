import { create } from 'zustand';

interface CalendarState {
  selectedDate: string | null;
  visualizationMode: 'performance' | 'volatility';
  viewMode: 'day' | 'week' | 'month';
  rangeStart: string | null;
  rangeEnd: string | null;
  setSelectedDate: (date: string | null) => void;
  setVisualizationMode: (mode: 'performance' | 'volatility') => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  setDateRange: (start: string | null, end: string | null) => void;
  clearDateRange: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: null,
  visualizationMode: 'performance',
  viewMode: 'day',
  rangeStart: null,
  rangeEnd: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setDateRange: (start, end) => set({ rangeStart: start, rangeEnd: end }),
  clearDateRange: () => set({ rangeStart: null, rangeEnd: null }),
}));

export const selectSelectedDate = (state: CalendarState) => state.selectedDate; 