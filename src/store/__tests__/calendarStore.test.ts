import { describe, it, expect, beforeEach } from 'vitest';
import { useCalendarStore } from '../calendarStore';

// Helper to reset store between tests
const resetStore = () => {
  useCalendarStore.setState({
    selectedDate: null,
    visualizationMode: 'performance',
    viewMode: 'day',
    rangeStart: null,
    rangeEnd: null
  });
};

describe('Calendar Store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('selectedDate', () => {
    it('should initialize with null', () => {
      const { selectedDate } = useCalendarStore.getState();
      expect(selectedDate).toBeNull();
    });

    it('should set selected date', () => {
      const { setSelectedDate } = useCalendarStore.getState();
      setSelectedDate('2024-01-15');
      
      const { selectedDate } = useCalendarStore.getState();
      expect(selectedDate).toBe('2024-01-15');
    });
  });

  describe('visualization mode', () => {
    it('should initialize with performance mode', () => {
      const { visualizationMode } = useCalendarStore.getState();
      expect(visualizationMode).toBe('performance');
    });

    it('should switch to volatility mode', () => {
      const { setVisualizationMode } = useCalendarStore.getState();
      setVisualizationMode('volatility');
      
      const { visualizationMode } = useCalendarStore.getState();
      expect(visualizationMode).toBe('volatility');
    });
  });

  describe('view mode', () => {
    it('should initialize with day view', () => {
      const { viewMode } = useCalendarStore.getState();
      expect(viewMode).toBe('day');
    });

    it('should switch to week view', () => {
      const { setViewMode } = useCalendarStore.getState();
      setViewMode('week');
      
      const { viewMode } = useCalendarStore.getState();
      expect(viewMode).toBe('week');
    });
  });

  describe('date range selection', () => {
    it('should initialize with no range', () => {
      const { rangeStart, rangeEnd } = useCalendarStore.getState();
      expect(rangeStart).toBeNull();
      expect(rangeEnd).toBeNull();
    });

    it('should set date range', () => {
      const { setDateRange } = useCalendarStore.getState();
      setDateRange('2024-01-01', '2024-01-31');
      
      const { rangeStart, rangeEnd } = useCalendarStore.getState();
      expect(rangeStart).toBe('2024-01-01');
      expect(rangeEnd).toBe('2024-01-31');
    });

    it('should clear date range', () => {
      const { setDateRange, clearDateRange } = useCalendarStore.getState();
      
      // Set a range first
      setDateRange('2024-01-01', '2024-01-31');
      expect(useCalendarStore.getState().rangeStart).toBe('2024-01-01');
      
      // Clear the range
      clearDateRange();
      const { rangeStart, rangeEnd } = useCalendarStore.getState();
      expect(rangeStart).toBeNull();
      expect(rangeEnd).toBeNull();
    });

    it('should handle partial range (start only)', () => {
      const { setDateRange } = useCalendarStore.getState();
      setDateRange('2024-01-01', null);
      
      const { rangeStart, rangeEnd } = useCalendarStore.getState();
      expect(rangeStart).toBe('2024-01-01');
      expect(rangeEnd).toBeNull();
    });
  });
});
