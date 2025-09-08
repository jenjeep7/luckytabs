import { Box } from '@mui/material';

export default function AppBackground() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: `
          radial-gradient(1200px 700px at 80% -10%, rgba(255,60,172,.25), transparent 60%),
          radial-gradient(1000px 600px at 0% 10%, rgba(0,210,255,.22), transparent 55%),
          linear-gradient(180deg, #0B0C10, #0A0B0E 60%)
        `,
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          // Note: Add noise.png and bokeh.png to public/assets/ui/ when available
          // backgroundImage: `
          //   url("/assets/ui/noise.png"),
          //   url("/assets/ui/bokeh.png")
          // `,
          // backgroundRepeat: 'repeat, no-repeat',
          // backgroundSize: 'auto, cover',
          // opacity: .18
        }
      }}
    />
  );
}
