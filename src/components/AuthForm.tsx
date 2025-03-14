import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { signIn, signUp, error } = useAuth();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
    
    setValidationError('');
    
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationError('');
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              required
              minLength={6}
            />
            {isSignUp && (
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          {(validationError || error) && (
            <p className="text-sm text-red-600">{validationError || error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setValidationError('');
          }}
          className="mt-4 text-sm text-purple-600 hover:text-purple-800 text-center w-full"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}