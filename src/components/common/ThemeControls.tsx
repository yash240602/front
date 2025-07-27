import { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  Divider, 
  FormControlLabel, 
  Switch,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { 
  Palette as PaletteIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AutoAwesome as DefaultIcon,
  Contrast as ContrastIcon,
  ColorLens as ColorblindIcon
} from '@mui/icons-material';

type ThemeName = 'default' | 'highContrast' | 'colorblind';

interface ThemeControlsProps {
  themeName: string;
  themeMode: PaletteMode;
  onThemeNameChange: (name: ThemeName) => void;
  onThemeModeToggle: () => void;
}

const ThemeControls = ({
  themeName,
  themeMode,
  onThemeNameChange,
  onThemeModeToggle
}: ThemeControlsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleThemeChange = (name: ThemeName) => {
    onThemeNameChange(name);
    handleClose();
  };
  
  return (
    <>
      <Button
        aria-controls={open ? 'theme-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<PaletteIcon />}
        color="inherit"
      >
        Theme
      </Button>
      
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
          dense: true,
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, opacity: 0.7 }}>
          Theme Style
        </Typography>
        
        <MenuItem 
          selected={themeName === 'default'}
          onClick={() => handleThemeChange('default')}
        >
          <ListItemIcon>
            <DefaultIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Default</ListItemText>
        </MenuItem>
        
        <MenuItem 
          selected={themeName === 'highContrast'}
          onClick={() => handleThemeChange('highContrast')}
        >
          <ListItemIcon>
            <ContrastIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>High Contrast</ListItemText>
        </MenuItem>
        
        <MenuItem 
          selected={themeName === 'colorblind'}
          onClick={() => handleThemeChange('colorblind')}
        >
          <ListItemIcon>
            <ColorblindIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Colorblind-Friendly</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={onThemeModeToggle}>
          <ListItemIcon>
            {themeMode === 'light' ? (
              <DarkModeIcon fontSize="small" />
            ) : (
              <LightModeIcon fontSize="small" />
            )}
          </ListItemIcon>
          <FormControlLabel
            control={
              <Switch 
                checked={themeMode === 'dark'} 
                onChange={onThemeModeToggle}
                size="small"
              />
            }
            label={themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
            sx={{ ml: 0 }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeControls;