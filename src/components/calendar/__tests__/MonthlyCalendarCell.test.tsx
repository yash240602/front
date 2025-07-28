import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { defaultLightTheme } from '../../../utils/theme';
import MonthlyCalendarCell from '../MonthlyCalendarCell';

const mockMonthlyData = {
  date: '2024-01',
  month: 'January',
  year: 2024,
  open: 100,
  high: 110,
  low: 95,
  close: 105,
  totalVolume: 5000000,
  averageChangePercent: 2.5,
  maxChangePercent: 5.0,
  minChangePercent: -1.0,
  volatility: 3.2,
  tradingDays: 22
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={defaultLightTheme}>
    {children}
  </ThemeProvider>
);

describe('MonthlyCalendarCell', () => {
  it('should render month name and year', () => {
    render(
      <TestWrapper>
        <MonthlyCalendarCell 
          data={mockMonthlyData}
          isSelected={false}
          onSelect={vi.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText('January')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should display average change percentage', () => {
    render(
      <TestWrapper>
        <MonthlyCalendarCell 
          data={mockMonthlyData}
          isSelected={false}
          onSelect={vi.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText('+2.5%')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const mockOnSelect = vi.fn();
    
    render(
      <TestWrapper>
        <MonthlyCalendarCell 
          data={mockMonthlyData}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    fireEvent.click(cell);

    expect(mockOnSelect).toHaveBeenCalledWith('2024-01');
  });

  it('should show selected state', () => {
    render(
      <TestWrapper>
        <MonthlyCalendarCell 
          data={mockMonthlyData}
          isSelected={true}
          onSelect={vi.fn()}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    expect(cell).toHaveAttribute('aria-selected', 'true');
  });

  it('should show negative change in red', () => {
    const negativeData = { ...mockMonthlyData, averageChangePercent: -2.5 };
    
    render(
      <TestWrapper>
        <MonthlyCalendarCell 
          data={negativeData}
          isSelected={false}
          onSelect={vi.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText('-2.5%')).toBeInTheDocument();
  });

  it('should show tooltip with detailed metrics', () => {
    render(
      <TestWrapper>
        <MonthlyCalendarCell 
          data={mockMonthlyData}
          isSelected={false}
          onSelect={vi.fn()}
        />
      </TestWrapper>
    );

    const cell = screen.getByRole('button');
    expect(cell).toHaveAttribute('aria-label', 'January 2024 - Average Change: 2.50%');
  });
}); 