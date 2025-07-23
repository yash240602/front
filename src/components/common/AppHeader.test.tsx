import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppHeader from './AppHeader';

describe('AppHeader', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    const theme = createTheme();
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it('renders correctly and shows the title', () => {
    renderWithTheme(
      <AppHeader
        themeName="default"
        themeMode="light"
        onThemeNameChange={() => {}}
        onThemeModeToggle={() => {}}
      />
    );
    expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument();
  });

  it('shows theme menu items when Theme button is clicked', () => {
    renderWithTheme(
      <AppHeader
        themeName="default"
        themeMode="light"
        onThemeNameChange={() => {}}
        onThemeModeToggle={() => {}}
      />
    );
    const themeButton = screen.getByRole('button', { name: /theme/i });
    fireEvent.click(themeButton);
    expect(screen.getByText(/High Contrast/i)).toBeInTheDocument();
    expect(screen.getByText(/Colorblind-Friendly/i)).toBeInTheDocument();
    expect(screen.getByText(/Default/i)).toBeInTheDocument();
  });
}); 