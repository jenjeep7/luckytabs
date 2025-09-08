import { Button, buttonClasses, styled } from '@mui/material';

export const NeonButton = styled(Button)(() => ({
  borderRadius: 14,
  fontWeight: 800,
  letterSpacing: 0.3,
  paddingInline: 16,
  paddingBlock: 10,
  transition: 'transform .12s ease, box-shadow .12s ease, filter .12s ease',
  boxShadow: '0 10px 26px rgba(125,249,255,.12)',
  '&:active': { 
    transform: 'translateY(1px) scale(.99)' 
  },
  [`&.${buttonClasses.contained}`]: {
    color: '#0C0E10',
    background: 'linear-gradient(135deg, #7DF9FF 0%, #6A5ACD 45%, #FF3CAC 100%)',
    border: '1px solid rgba(255,255,255,.18)',
    textShadow: '0 1px 0 rgba(255,255,255,.6)',
    boxShadow: '0 0 24px rgba(125,249,255,.25), 0 8px 24px rgba(0,0,0,.45)',
    '&:hover': {
      filter: 'saturate(1.08) brightness(1.04)',
      boxShadow: '0 0 32px rgba(255,60,172,.35), 0 10px 28px rgba(0,0,0,.55)'
    }
  },
  [`&.${buttonClasses.outlined}`]: {
    color: '#EAF6FF',
    borderColor: 'rgba(125,249,255,.6)',
    background: 'linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))',
    '&:hover': {
      borderColor: '#7DF9FF',
      boxShadow: '0 0 18px rgba(125,249,255,.35)'
    }
  }
}));
