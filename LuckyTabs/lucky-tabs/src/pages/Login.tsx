/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailPasswordCompat, signInWithGoogleCompat } from '../services/authService';
import type { User as FirebaseUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { trackUserLogin } from '../utils/analytics';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const user = await signInWithEmailPasswordCompat(data.email, data.password);
      // Type guard for FirebaseUser
      if (user && typeof (user as FirebaseUser).reload === 'function') {
        await (user as FirebaseUser).reload();
        if (!(user as FirebaseUser).emailVerified) {
          setError('Please verify your email address before logging in.');
          return;
        }
      }
      trackUserLogin('email');
      setError('');
      void navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithGoogleCompat();
      // Track successful Google login
      trackUserLogin('google');
      setError('');
      void navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 10, p: 5, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {`Welcome Back!`}
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register('email')}
            required
            size="small"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            {...register('password')}
            required
            size="small"
          />
          <Button variant="contained" color="primary" type="submit">
            Login
          </Button>
          {/* <Button variant="outlined" onClick={signInWithGoogle}>
            Sign in with Google
          </Button> */}
          <Button onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
          <Button variant="text" color="secondary" onClick={() => navigate('/')}>Return to Home</Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Login;
