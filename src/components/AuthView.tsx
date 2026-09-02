import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '../lib/auth';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup' | 'forgot';
  onSuccess?: () => void;
  onBackToLanding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onSuccess,
  onBackToLanding,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessEmail, setResetSuccessEmail] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onSuccess?.();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await resetPassword(email);
        setResetSuccessEmail(email.trim());
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to send password reset email.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter your password.');
        return;
      }

      setIsLoading(true);
      try {
        await signUpWithEmail(email, password, name);
        onSuccess?.();
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to create your account.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign In mode
      setIsLoading(true);
      try {
        await signInWithEmail(email, password);
        onSuccess?.();
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to sign in. Please verify your email and password.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#59171B]/20 selection:text-[#59171B]">
      {/* Back button */}
      {onBackToLanding && (
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7E635F] hover:text-[#59171B] transition-colors cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-white/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to overview</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-heading font-black text-sm tracking-tight text-[#59171B]">MADEAL</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#59171B] text-[#FED7B8]">PRO</span>
          </div>
        </div>
      )}

      {/* Main Auth Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECD9CB] shadow-payno-md max-w-md w-full space-y-6 relative overflow-hidden">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center mx-auto shadow-payno-sm">
            {mode === 'forgot' ? (
              <KeyRound className="w-6 h-6" />
            ) : mode === 'signup' ? (
              <FileCheck className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#230B0D]">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h2>
            <p className="text-xs text-[#7E635F] mt-1 max-w-xs mx-auto leading-relaxed">
              {mode === 'signin' && 'Sign in to access your sponsorship contracts, deal tracker, and invoices.'}
              {mode === 'signup' && 'Start protecting your brand sponsorships with legal contracts and instant invoices.'}
              {mode === 'forgot' && 'Enter the email linked to your Madeal account and we will send you a reset link.'}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="leading-snug flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Forgot Password Success State */}
        {mode === 'forgot' && resetSuccessEmail ? (
          <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-bold text-[#230B0D]">Reset Link Sent!</h3>
              <p className="text-xs text-[#7E635F] max-w-xs mx-auto">
                We sent password reset instructions to <strong className="text-[#230B0D]">{resetSuccessEmail}</strong>. Please check your inbox and spam folder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setResetSuccessEmail(null);
                setMode('signin');
                setErrorMessage(null);
              }}
              className="w-full py-2.5 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold rounded-xl shadow-payno-sm transition-all cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          /* Authentication Forms */
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Google Sign-in Option (for signin and signup modes) */}
            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  disabled={isGoogleLoading || isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#FAF3EC] hover:bg-[#F5E8DC] border border-[#ECD9CB] text-xs font-bold text-[#230B0D] rounded-xl transition-all shadow-payno-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#59171B]" />
                      <span>Connecting Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#ECD9CB]"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-[#7E635F]">
                    Or with email
                  </span>
                  <div className="flex-grow border-t border-[#ECD9CB]"></div>
                </div>
              </>
            )}

            {/* Name Field (Sign Up only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Full Name / Creator Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#7E635F]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#230B0D] outline-none transition-all placeholder:text-[#7E635F]/60"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#7E635F]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@business.com"
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#230B0D] outline-none transition-all placeholder:text-[#7E635F]/60"
                />
              </div>
            </div>

            {/* Password Field (Sign In & Sign Up only) */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                      }}
                      className="text-[11px] font-semibold text-[#59171B] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#7E635F]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl pl-10 pr-10 py-2.5 text-xs text-[#230B0D] outline-none transition-all placeholder:text-[#7E635F]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-[#7E635F] hover:text-[#230B0D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#7E635F]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#230B0D] outline-none transition-all placeholder:text-[#7E635F]/60"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-2 py-3 px-4 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs sm:text-sm font-bold rounded-2xl shadow-payno-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In to Dashboard'}
                    {mode === 'signup' && 'Create Free Account'}
                    {mode === 'forgot' && 'Send Password Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Toggle Modes */}
        <div className="border-t border-[#F5E8DC] pt-4 text-center">
          {mode === 'signin' && (
            <p className="text-xs text-[#7E635F]">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className="font-bold text-[#59171B] hover:underline cursor-pointer"
              >
                Sign up for free
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-xs text-[#7E635F]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className="font-bold text-[#59171B] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p className="text-xs text-[#7E635F]">
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setResetSuccessEmail(null);
                }}
                className="font-bold text-[#59171B] hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Security Guarantee */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-[#7E635F]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#59171B]" />
        <span>256-bit encrypted authentication • Private creator data isolation</span>
      </div>
    </div>
  );
};
