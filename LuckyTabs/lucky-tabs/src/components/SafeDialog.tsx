import Dialog, { DialogProps } from '@mui/material/Dialog';

/**
 * SafeDialog - A wrapper around MUI Dialog that handles iOS safe areas properly
 * 
 * This component adds proper safe area handling while maintaining full dialog interactivity
 */
export default function SafeDialog(props: DialogProps) {
  return (
    <Dialog
      {...props}
      sx={{
        '& .MuiDialog-container': {
          // Ensure container respects safe areas
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        },
        
        '& .MuiDialog-paper': {
          // Additional margins for better spacing
          marginTop: 'max(16px, calc(env(safe-area-inset-top, 0px) / 2))',
          marginBottom: 'max(16px, calc(env(safe-area-inset-bottom, 0px) / 2))',
          marginLeft: 'max(8px, calc(env(safe-area-inset-left, 0px) / 2))',
          marginRight: 'max(8px, calc(env(safe-area-inset-right, 0px) / 2))',
          
          // Ensure dialog doesn't exceed available space after safe areas
          maxHeight: `calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)`,
          maxWidth: `calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px) - 16px)`,
        },
        
        // Handle fullScreen dialogs properly
        '&.MuiDialog-fullScreen .MuiDialog-paper': {
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)', 
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          margin: 0,
          maxHeight: '100vh',
          maxWidth: '100vw',
        },
        
        // Apply any custom styles from props
        ...props.sx,
      }}
    />
  );
}