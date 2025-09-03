/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
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
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      // Force reload user to get latest emailVerified status
      await userCredential.user.reload();
      if (!userCredential.user.emailVerified) {
        setError('Please verify your email address before logging in.');
        return;
      }
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
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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
      <Paper elevation={3} sx={{ mt: 10, p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Login
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
          <Button variant="outlined" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
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
