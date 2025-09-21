/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, updateProfile, User, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { trackUserSignup } from '../utils/analytics';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import { BetaTestingAgreementDialog } from '../components/BetaTestingAgreementDialog';

interface SignupFormInputs {
  email: string;
  password: string;
  username: string;
}

const waitForAuth = (): Promise<User> =>
  new Promise((resolve, reject) => {
    if (!auth) {
      reject(new Error('Firebase Auth is not initialized on web'));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        reject(new Error('User not authenticated'));
      }
    });
  });

const Signup: React.FC = () => {
  const { register, handleSubmit } = useForm<SignupFormInputs>();
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      if (!auth) throw new Error('Firebase Auth is not initialized on web');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(userCredential.user, {
        displayName: data.username,
      });

      const confirmedUser = await waitForAuth();

      await setDoc(doc(db, 'users', confirmedUser.uid), {
        uid: confirmedUser.uid,
        email: confirmedUser.email,
        username: data.username,
        displayName: data.username,
        createdAt: new Date(),
        isAdmin: false,
        plan: 'free',
      });

      // Send email verification
      if (confirmedUser && confirmedUser.email) {
        await sendEmailVerification(confirmedUser);
        setVerificationSent(true);
      }

      // Track successful signup
      trackUserSignup('email');

      setError('');
      // Do not navigate until verified
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Handle specific Firebase error codes with user-friendly messages
        if (err.message.includes('EMAIL_EXISTS') || err.message.includes('email-already-in-use')) {
          setError('This email is already registered. Please log in instead or use a different email address.');
        } else if (err.message.includes('WEAK_PASSWORD') || err.message.includes('weak-password')) {
          setError('Password is too weak. Please choose a stronger password with at least 6 characters.');
        } else if (err.message.includes('INVALID_EMAIL') || err.message.includes('invalid-email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 10, p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {`Welcome`}
        </Typography>
        <Button variant="outlined" sx={{ my: 3, textAlign: 'center' }} color="primary" onClick={() => navigate('/login')}>
          Already have an account? Login
        </Button>

        {!verificationSent ? (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <TextField label="Username" fullWidth {...register('username')} required size="small" />
            <TextField label="Email" type="email" fullWidth {...register('email')} required size="small" />
            <TextField label="Password" type="password" fullWidth {...register('password')} required size="small" />
            
            {/* Terms and Conditions Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    {`Beta Testing Agreement`}
                  </Link>
                </Typography>
              }
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              disabled={!termsAccepted}
              sx={{
                color: '#000000', // Force dark text
                fontWeight: 600,
                '&.Mui-disabled': {
                  color: '#666666', // Dark gray for disabled state
                },
                '&:hover': {
                  color: '#000000', // Maintain dark text on hover
                }
              }}
            >
              Sign Up
            </Button>
            <Button variant="text" color="secondary" onClick={() => navigate('/')}>Return to Home</Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              A verification email has been sent to your address. Please check your inbox and verify your email before logging in.
            </Alert>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Beta Testing Agreement Modal */}
      <BetaTestingAgreementDialog
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </Container>
  );
};

export default Signup;
