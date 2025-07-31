import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface SignupFormInputs {
  email: string;
  password: string;
}

const Signup: React.FC = () => {
  const { register, handleSubmit } = useForm<SignupFormInputs>();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      setError('');
      navigate('/'); // Go to dashboard or homepage
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          {...register('email')}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Create Account</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.link} onClick={() => navigate('/login')}>
        Already have an account? Log in
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 400,
    margin: '100px auto',
    padding: 20,
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  button: {
    padding: 10,
    backgroundColor: '#388e3c',
    color: '#fff',
    fontSize: 16,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: 12,
  },
  link: {
    marginTop: 20,
    color: '#1976d2',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 14,
  },
};

export default Signup;
