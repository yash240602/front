import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { defaultLightTheme } from '../../../utils/theme';
import SeasonalityCalendar from '../SeasonalityCalendar';
import { useMarketDataStore } from '../../../store/marketDataStore';
import { useCalendarStore } from '../../../store/calendarStore';

// Mock the stores
vi.mock('../../../store/marketDataStore');
vi.mock('../../../store/calendarStore');

// Mock the keyboard hotkeys hook
vi.mock('../../../hooks/useCalendarHotkeys', () => ({
  useCalendarHotkeys: vi.fn()
}));

const mockMarketData = [
  {
    date: '2024-01-01',
    symbol: 'BTCUSDT',
    open: 43000,
    high: 44000,
    low: 42000,
    close: 43500,
    volume: 1000000,
    changePercent: 1.16,
    volatility: 15.5
  },
  {
    date: '2024-01-02',
    symbol: 'BTCUSDT',
    open: 43500,
    high: 44500,
    low: 43000,
    close: 44000,
    volume: 1200000,
    changePercent: 1.15,
    volatility: 16.2
  }
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={defaultLightTheme}>
    {children}
  </ThemeProvider>
);

describe('SeasonalityCalendar', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (useMarketDataStore as any).mockReturnValue({
      historicalData: mockMarketData,
      isLoading: false,
      error: null,
      instrument: 'BTC-USDT'
    });
    
    (useCalendarStore as any).mockReturnValue({
      selectedDate: null,
      setSelectedDate: vi.fn(),
      visualizationMode: 'performance',
      setVisualizationMode: vi.fn(),
      viewMode: 'day',
      setViewMode: vi.fn(),
      rangeStart: null,
      rangeEnd: null,
      setDateRange: vi.fn(),
      clearDateRange: vi.fn()
    });
  });

  it('should render calendar with month navigation', () => {
    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    // Check for month navigation buttons
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to today')).toBeInTheDocument();
  });

  it('should render visualization mode toggle', () => {
    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Performance view')).toBeInTheDocument();
    expect(screen.getByLabelText('Volatility view')).toBeInTheDocument();
  });

  it('should render view mode toggle', () => {
    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Daily view')).toBeInTheDocument();
    expect(screen.getByLabelText('Weekly view')).toBeInTheDocument();
  });

  it('should call setVisualizationMode when toggle is clicked', async () => {
    const mockSetVisualizationMode = vi.fn();
    (useCalendarStore as any).mockReturnValue({
      selectedDate: null,
      setSelectedDate: vi.fn(),
      visualizationMode: 'performance',
      setVisualizationMode: mockSetVisualizationMode,
      viewMode: 'day',
      setViewMode: vi.fn(),
      rangeStart: null,
      rangeEnd: null,
      setDateRange: vi.fn(),
      clearDateRange: vi.fn()
    });

    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    const volatilityButton = screen.getByLabelText('Volatility view');
    fireEvent.click(volatilityButton);

    await waitFor(() => {
      expect(mockSetVisualizationMode).toHaveBeenCalledWith('volatility');
    });
  });

  it('should call setViewMode when view toggle is clicked', async () => {
    const mockSetViewMode = vi.fn();
    (useCalendarStore as any).mockReturnValue({
      selectedDate: null,
      setSelectedDate: vi.fn(),
      visualizationMode: 'performance',
      setVisualizationMode: vi.fn(),
      viewMode: 'day',
      setViewMode: mockSetViewMode,
      rangeStart: null,
      rangeEnd: null,
      setDateRange: vi.fn(),
      clearDateRange: vi.fn()
    });

    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    const weeklyButton = screen.getByLabelText('Weekly view');
    fireEvent.click(weeklyButton);

    await waitFor(() => {
      expect(mockSetViewMode).toHaveBeenCalledWith('week');
    });
  });

  it('should render calendar legend', () => {
    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    expect(screen.getByText('Performance Scale')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useMarketDataStore as any).mockReturnValue({
      historicalData: [],
      isLoading: true,
      error: null,
      instrument: 'BTC-USDT'
    });

    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    // Check for loading skeletons
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('should show error state', () => {
    (useMarketDataStore as any).mockReturnValue({
      historicalData: [],
      isLoading: false,
      error: 'Failed to fetch data',
      instrument: 'BTC-USDT'
    });

    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('should render day view by default', () => {
    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    // Should show day headers
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
  });

  it('should switch to weekly view', () => {
    (useCalendarStore as any).mockReturnValue({
      selectedDate: null,
      setSelectedDate: vi.fn(),
      visualizationMode: 'performance',
      setVisualizationMode: vi.fn(),
      viewMode: 'week',
      setViewMode: vi.fn(),
      rangeStart: null,
      rangeEnd: null,
      setDateRange: vi.fn(),
      clearDateRange: vi.fn()
    });

    render(
      <TestWrapper>
        <SeasonalityCalendar />
      </TestWrapper>
    );

    // In week view, day headers should not be visible
    expect(screen.queryByText('Sun')).not.toBeInTheDocument();
    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
  });
});
