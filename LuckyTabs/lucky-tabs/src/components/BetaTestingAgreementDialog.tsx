import React from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';

interface BetaTestingAgreementDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BetaTestingAgreementDialog: React.FC<BetaTestingAgreementDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
          🧪 Tabsy Wins Beta Testing Agreement
        </Typography>
        <Divider />
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box sx={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'text.primary' }}>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            This Beta Testing Agreement (&quot;Agreement&quot;) is entered into by and between:
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
            <strong>Website/Application:</strong> Tabsywins.com
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            <strong>Tester:</strong> [User]
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
            1. Purpose
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The purpose of this Agreement is to allow the Tester to access and use the TabsyWins application (&quot;Beta Product&quot;) for the sole purpose of testing and providing feedback prior to public release.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            2. License & Access
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tabsy Wins grants the Tester a limited, non-transferable, revocable license to use the Beta Product solely for testing. The Tester agrees not to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2, '& li': { mb: 0.5 } }}>
            <li>Copy, distribute, or reverse-engineer any part of the Beta Product</li>
            <li>Share access credentials or screenshots without written permission</li>
            <li>Use the Beta Product for commercial gain or public demonstration</li>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            3. Confidentiality
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tester agrees to keep all aspects of the Beta Product confidential, including:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2, '& li': { mb: 0.5 } }}>
            <li>Prediction logic, mascot features, box analysis tools, and user interface</li>
            <li>Any unreleased features, pricing models, or community tools</li>
            <li>Feedback, bug reports, and internal communications</li>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            4. Feedback
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tester agrees to provide honest, constructive feedback, including:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 1, '& li': { mb: 0.5 } }}>
            <li>Usability, bugs, and performance issues</li>
            <li>Suggestions for improvement</li>
            <li>Observations about box prediction accuracy, community features, and user experience</li>
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            All feedback becomes the property of Tabsy Wins and may be used to improve the product.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            5. No Warranty
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The Beta Product is provided &quot;as is&quot; and may contain bugs or incomplete features. Tabsy Wins makes no guarantees about performance, accuracy, or availability during the testing period.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            6. Data Collection
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Tester agrees that Tabsy Wins may collect usage data, feedback, and analytics during the beta period. No personally identifiable information will be shared outside the company.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            7. Termination
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Either party may terminate this Agreement at any time. Upon termination, the Tester must cease using the Beta Product and delete any related materials.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            8. Governing Law
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This Agreement shall be governed by the laws of the State of Minnesota.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            9. Entire Agreement
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This document represents the entire agreement between Tabsy Wins and the Tester regarding beta access and supersedes any prior discussions.
          </Typography>

        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BetaTestingAgreementDialog;
