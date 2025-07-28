import { describe, it, expect, beforeEach } from 'vitest';
import { useCalendarStore } from '../calendarStore';

describe('calendarStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCalendarStore.setState({
      currentMonth: new Date(),
      selectedDate: null,
      viewMode: 'day',
      rangeStart: null,
      rangeEnd: null,
    });
  });

  describe('setSelectedDate', () => {
    it('should set selected date and clear range', () => {
      const { setSelectedDate } = useCalendarStore.getState();
      
      setSelectedDate('2024-01-15');
      
      const state = useCalendarStore.getState();
      expect(state.selectedDate).toBe('2024-01-15');
      expect(state.rangeStart).toBeNull();
      expect(state.rangeEnd).toBeNull();
    });

    it('should clear selected date when null is passed', () => {
      const { setSelectedDate } = useCalendarStore.getState();
      
      // First set a date
      setSelectedDate('2024-01-15');
      expect(useCalendarStore.getState().selectedDate).toBe('2024-01-15');
      
      // Then clear it
      setSelectedDate(null);
      expect(useCalendarStore.getState().selectedDate).toBeNull();
    });
  });

  describe('setViewMode', () => {
    it('should change view mode and clear selections', () => {
      const { setViewMode, setSelectedDate } = useCalendarStore.getState();
      
      // Set some initial state
      setSelectedDate('2024-01-15');
      
      // Change view mode
      setViewMode('month');
      
      const state = useCalendarStore.getState();
      expect(state.viewMode).toBe('month');
      expect(state.selectedDate).toBeNull();
      expect(state.rangeStart).toBeNull();
      expect(state.rangeEnd).toBeNull();
    });

    it('should accept all valid view modes', () => {
      const { setViewMode } = useCalendarStore.getState();
      
      setViewMode('day');
      expect(useCalendarStore.getState().viewMode).toBe('day');
      
      setViewMode('week');
      expect(useCalendarStore.getState().viewMode).toBe('week');
      
      setViewMode('month');
      expect(useCalendarStore.getState().viewMode).toBe('month');
    });
  });

  describe('setDateRange', () => {
    it('should set range start when no range exists', () => {
      const { setDateRange } = useCalendarStore.getState();
      
      setDateRange('2024-01-15');
      
      const state = useCalendarStore.getState();
      expect(state.rangeStart).toBe('2024-01-15');
      expect(state.rangeEnd).toBeNull();
      expect(state.selectedDate).toBeNull();
    });

    it('should set range end when start exists', () => {
      const { setDateRange } = useCalendarStore.getState();
      
      // Set start
      setDateRange('2024-01-15');
      // Set end
      setDateRange('2024-01-20');
      
      const state = useCalendarStore.getState();
      expect(state.rangeStart).toBe('2024-01-15');
      expect(state.rangeEnd).toBe('2024-01-20');
    });

    it('should swap dates if end is before start', () => {
      const { setDateRange } = useCalendarStore.getState();
      
      // Set start
      setDateRange('2024-01-20');
      // Set end (before start)
      setDateRange('2024-01-15');
      
      const state = useCalendarStore.getState();
      expect(state.rangeStart).toBe('2024-01-15');
      expect(state.rangeEnd).toBe('2024-01-20');
    });
  });

  describe('clearDateRange', () => {
    it('should clear date range', () => {
      const { setDateRange, clearDateRange } = useCalendarStore.getState();
      
      // Set a range
      setDateRange('2024-01-15');
      setDateRange('2024-01-20');
      
      // Clear it
      clearDateRange();
      
      const state = useCalendarStore.getState();
      expect(state.rangeStart).toBeNull();
      expect(state.rangeEnd).toBeNull();
    });
  });
});
