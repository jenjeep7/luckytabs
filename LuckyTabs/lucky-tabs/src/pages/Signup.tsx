import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';

interface SignupFormInputs {
  email: string;
  password: string;
  username: string;
}

const Signup: React.FC = () => {
  const { register, handleSubmit } = useForm<SignupFormInputs>();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const checkUsernameExists = async (username: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const onSubmit = async (data: SignupFormInputs) => {
    setError('');

    try {
      // Step 1: Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Step 2: Check if the username already exists
      const exists = await checkUsernameExists(data.username);
      if (exists) {
        await user.delete(); // cleanup
        setError('Username is already taken.');
        return;
      }

      // Step 3: Update Firebase display name
      await updateProfile(user, {
        displayName: data.username,
      });

      // ✅ Force-refresh the user object
      await user.reload();
      console.log("Updated displayName:", auth.currentUser?.displayName); // should now show the username

      // Step 4: Save user info in Firestore
  try {
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    username: data.username,
    displayName: data.username,
    createdAt: new Date(),
  });
  console.log("✅ User document created in Firestore.");
} catch (docError) {
  console.error("❌ Failed to write user doc:", docError);
  setError("Failed to save user profile.");
  return;
}


      // Step 5: Redirect
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">Sign Up</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Username"
            fullWidth
            {...register('username')}
            required
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register('email')}
            required
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            {...register('password')}
            required
            margin="normal"
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Create Account
          </Button>
        </form>
        <Button color="secondary" onClick={() => navigate('/login')}>
          Already have an account? Log in
        </Button>
      </Box>
    </Container>
  );
};

export default Signup;
