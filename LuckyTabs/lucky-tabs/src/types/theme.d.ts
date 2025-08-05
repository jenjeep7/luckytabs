import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeBackground {
    contrast: string;
  }

  interface TypeText {
    contrast: string;
    light: string;
  }

  interface Palette {
    alert: Palette['primary'];
    brand: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
  }

  interface PaletteOptions {
    alert?: PaletteOptions['primary'];
    brand?: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
  }
}
