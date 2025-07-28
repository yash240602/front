import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { defaultLightTheme } from '../../../utils/theme';
import CalendarCell from '../CalendarCell';
import { useCalendarStore } from '../../../store/calendarStore';

// Mock the store
vi.mock('../../../store/calendarStore');

const mockData = {
  date: new Date('2024-01-15'),
  day: '15',
  isCurrentMonth: true,
  isToday: false,
  hasData: true,
  metrics: {
    date: '2024-01-15',
    open: 100,
    high: 105,
    low: 98,
    close: 103,
    volume: 1000000,
    changePercent: 3.0,
    volatility: 2.5
  },
  changePercent: 3.0,
  isSelected: false
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={defaultLightTheme}>
    {children}
  </ThemeProvider>
);

describe('CalendarCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCalendarStore as any).mockReturnValue({
      selectedDate: null,
      setSelectedDate: vi.fn(),
      rangeStart: null,
      rangeEnd: null,
      setDateRange: vi.fn()
    });
  });

  it('should render cell with day number', () => {
    render(
      <TestWrapper>
        <CalendarCell 
          data={mockData} 
          maxVolatilityInMonth={5.0}
          maxVolumeInMonth={2000000}
        />
      </TestWrapper>
    );

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should show today indicator', () => {
    const todayData = { ...mockData, isToday: true };
    
    render(
      <TestWrapper>
        <CalendarCell 
          data={todayData} 
          maxVolatilityInMonth={5.0}
          maxVolumeInMonth={2000000}
        />
      </TestWrapper>
    );

    const dayElement = screen.getByText('15');
    expect(dayElement).toHaveStyle({ fontWeight: 'bold' });
  });

  it('should handle click events', () => {
    const mockSetSelectedDate = vi.fn();
    (useCalendarStore as any).mockReturnValue({
      selectedDate: null,
      setSelectedDate: mockSetSelectedDate,
      rangeStart: null,
      rangeEnd: null,
      setDateRange: vi.fn()
    });

    render(
      <TestWrapper>
        <CalendarCell 
          data={mockData} 
          maxVolatilityInMonth={5.0}
          maxVolumeInMonth={2000000}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    fireEvent.click(cell);

    expect(mockSetSelectedDate).toHaveBeenCalledWith('2024-01-15');
  });

  it('should handle shift+click for range selection', () => {
    const mockSetDateRange = vi.fn();
    (useCalendarStore as any).mockReturnValue({
      selectedDate: null,
      setSelectedDate: vi.fn(),
      rangeStart: null,
      rangeEnd: null,
      setDateRange: mockSetDateRange
    });

    render(
      <TestWrapper>
        <CalendarCell 
          data={mockData} 
          maxVolatilityInMonth={5.0}
          maxVolumeInMonth={2000000}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    fireEvent.click(cell, { shiftKey: true });

    expect(mockSetDateRange).toHaveBeenCalledWith('2024-01-15');
  });

  it('should show tooltip with metrics', () => {
    render(
      <TestWrapper>
        <CalendarCell 
          data={mockData} 
          maxVolatilityInMonth={5.0}
          maxVolumeInMonth={2000000}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    expect(cell).toHaveAttribute('aria-label', 'January 15, 2024 - Change: 3.00%');
  });

  it('should not be clickable when no data', () => {
    const noDataCell = { ...mockData, hasData: false, metrics: undefined };
    
    render(
      <TestWrapper>
        <CalendarCell 
          data={noDataCell} 
          maxVolatilityInMonth={5.0}
          maxVolumeInMonth={2000000}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    expect(cell).toHaveAttribute('tabIndex', '-1');
  });

  it('should show selected state', () => {
    (useCalendarStore as any).mockReturnValue({
      selectedDate: '2024-01-15',
      setSelectedDate: vi.fn(),
      rangeStart: null,
      rangeEnd: null,
      setDateRange: vi.fn()
    });

    render(
      <TestWrapper>
        <CalendarCell 
          data={mockData} 
          maxVolatilityInMonth={5.0}
          maxVolumeInMonth={2000000}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    expect(cell).toHaveAttribute('aria-selected', 'true');
  });
}); 