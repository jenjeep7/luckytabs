import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeBackground {
    contrast: string;
  }

  interface TypeText {
    contrast: string;
    light: string;
  }
}
