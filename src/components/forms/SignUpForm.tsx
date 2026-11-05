import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

export const SignUpForm: React.FC = () => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredDirect, setRegisteredDirect] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    requiresVerification: boolean;
    message: string;
  } | null>(null);

  // Navigate only after the auth context confirms the user is set
  useEffect(() => {
    if (registeredDirect && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [registeredDirect, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp({
        fullName,
        email,
        password,
      });

      if (result.success) {
        if (result.requiresEmailVerification) {
          setSuccessInfo({
            requiresVerification: true,
            message:
              result.message ||
              'A verification link has been sent to your email. Please check your inbox and confirm your address before signing in.',
          });
          setIsLoading(false);
        } else {
          // Email confirmation disabled — session is immediately active.
          // Wait for onAuthStateChange to populate user, then navigate via useEffect.
          setRegisteredDirect(true);
          // isLoading stays true while we wait
        }
      } else {
        setErrorMessage(
          result.error || 'Registration could not be completed. Please check your inputs.'
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  if (successInfo?.requiresVerification) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          {successInfo.message}
        </p>
        <div className="pt-4 border-t border-slate-200">
          <Link to="/sign-in">
            <Button variant="outline" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <Alert
          type="error"
          title="Registration Failed"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Input
        label="Full Name"
        type="text"
        placeholder="e.g. Alex Johnson"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        leftIcon={<User className="w-4 h-4" />}
      />

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
        placeholder="At least 6 characters"
        autoComplete="new-password"
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

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Re-enter password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        leftIcon={<Lock className="w-4 h-4" />}
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          {isLoading ? 'Creating account…' : 'Create Account'}
        </Button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
