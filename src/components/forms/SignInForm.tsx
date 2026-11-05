import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

export const SignInForm: React.FC = () => {
  const { signIn, signInAsGuest, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  // Determine redirect target
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Navigate only after the auth context confirms the user is set
  useEffect(() => {
    if (signedIn && user) {
      navigate(from, { replace: true });
    }
  }, [signedIn, user, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn({ email, password });
      if (result.success) {
        setSignedIn(true);
        // isLoading stays true while we wait for user to be set in context
      } else {
        setErrorMessage(
          result.error ||
            'Unable to sign in. Please verify your email and password, or check if email verification is required.'
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <Alert
          type="error"
          title="Sign In Failed"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock className="w-4 h-4" />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          {isLoading ? 'Signing in…' : 'Sign In'}
        </Button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400 font-medium">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full text-xs text-slate-700 bg-slate-50 hover:bg-slate-100"
        onClick={() => {
          signInAsGuest();
          navigate('/dashboard');
        }}
      >
        Explore as Guest Reviewer (Stage 1 Offline Preview)
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link
            to="/sign-up"
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
          >
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
};
