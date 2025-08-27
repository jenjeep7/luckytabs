/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, updateProfile, User, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

interface SignupFormInputs {
  email: string;
  password: string;
  username: string;
}

const waitForAuth = (): Promise<User> =>
  new Promise((resolve, reject) => {
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
  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormInputs) => {
    try {
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

      setError('');
      // Do not navigate until verified
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 10, p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        {!verificationSent ? (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField label="Username" fullWidth {...register('username')} required />
            <TextField label="Email" type="email" fullWidth {...register('email')} required />
            <TextField label="Password" type="password" fullWidth {...register('password')} required />
            <Button variant="contained" color="primary" type="submit">
              Sign Up
            </Button>
            <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
              Already have an account? Login
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
    </Container>
  );
};

export default Signup;
