'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase-client';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account was found with this email address.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/email-already-in-use': 'An account with this email address already exists.',
  'auth/weak-password': 'Password must be at least 8 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many unsuccessful attempts. Please wait a moment and try again.',
  'auth/popup-blocked': 'Sign-in pop-up was blocked by your browser. Please allow pop-ups for this site.',
  'auth/popup-closed-by-user': 'Sign-in pop-up was closed before completing.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email address using a different login method.',
  'auth/operation-not-allowed':
    'Google Sign-in is not enabled in your Firebase Console. Please enable Google under Authentication → Sign-in method.',
  'auth/configuration-not-found':
    'Firebase Authentication is not activated yet in your Firebase Console. Go to console.firebase.google.com, open your project, and click "Get Started" in the Authentication section.',
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface AuthFormProps {
  mode: 'login' | 'register' | 'forgot-password';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const shouldReduceMotion = useReducedMotion();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  // 1. Google Authentication
  const handleGoogleAuth = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const auth = getClientAuth();
      if (!auth) {
        setError('Accounts are not configured yet — Firebase configuration keys are missing.');
        setBusy(false);
        return;
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: cred.user.displayName || undefined,
          newsletter: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong while completing sign-in.');
        setBusy(false);
        return;
      }

      window.location.href = '/profile';
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setBusy(false);
        return;
      }
      setError(
        FIREBASE_ERRORS[err?.code] ??
          err?.message ??
          'Google authentication failed — please try again.'
      );
      setBusy(false);
    }
  };

  // 2. Email Password Submit
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    // Specific Client Validation
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        setBusy(false);
        return;
      }
      if (!termsAccepted) {
        setError('Please agree to the Terms & Conditions and Privacy Policy to create an account.');
        setBusy(false);
        return;
      }
    }

    try {
      const auth = getClientAuth();
      if (!auth) {
        setError('Accounts are not configured yet — Firebase configuration keys are missing.');
        setBusy(false);
        return;
      }

      // Password Reset Mode
      if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setSuccess(`A password reset link has been dispatched to ${email}. Please check your inbox.`);
        setBusy(false);
        return;
      }

      // Register or Login Mode
      const cred =
        mode === 'register'
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      const idToken = await cred.user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register' ? { idToken, name, newsletter } : { idToken }
        ),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Authentication was not authorized.');
        setBusy(false);
        return;
      }

      window.location.href = '/profile';
    } catch (err: any) {
      setError(FIREBASE_ERRORS[err?.code] ?? 'Authentication failed — please verify your details.');
      setBusy(false);
    }
  };

  // Editorial input styles
  const inputContainerClass =
    'relative flex items-center border border-line bg-white transition-all duration-200 focus-within:border-bronze focus-within:ring-1 focus-within:ring-bronze/20';
  const inputClass =
    'w-full bg-transparent px-4 py-3.5 text-sm text-charcoal outline-none placeholder:text-stone-warm/50';
  const labelClass =
    'mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal';

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
      suppressHydrationWarning
    >
      {/* Editorial Header */}
      <div className="space-y-2">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-bronze">
          {mode === 'register'
            ? 'Membership Onboarding'
            : mode === 'forgot-password'
            ? 'Account Recovery'
            : 'Studio Member Access'}
        </p>

        <h1 className="font-display text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
          {mode === 'register'
            ? 'Create your account'
            : mode === 'forgot-password'
            ? 'Reset your password'
            : 'Welcome back'}
        </h1>

        <p className="max-w-sm text-sm leading-relaxed text-stone-warm">
          {mode === 'register'
            ? 'Join RenderVault to unlock the full library of curated prompts, guidebooks, and production workflows.'
            : mode === 'forgot-password'
            ? 'Enter your registered email address to receive secure instructions to recover your account.'
            : 'Enter your credentials to access your saved prompts, downloads and architectural library.'}
        </p>
      </div>

      {/* Google Authentication (Supported for Login and Register) */}
      {mode !== 'forgot-password' && (
        <div className="mt-8" suppressHydrationWarning>
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={busy}
            suppressHydrationWarning
            className="flex w-full items-center justify-center gap-3 border border-line bg-white py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-charcoal shadow-sm transition-all duration-200 hover:border-bronze hover:bg-parchment/40 disabled:opacity-60"
          >
            <GoogleIcon className="h-4 w-4" />
            <span>
              {busy
                ? 'Connecting to Google…'
                : mode === 'register'
                ? 'Sign up with Google'
                : 'Continue with Google'}
            </span>
          </button>

          {/* Minimal Editorial Divider */}
          <div className="relative my-7 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.24em] text-stone-warm">
              <span className="bg-ivory px-3 font-semibold">Or continue with email</span>
            </div>
          </div>
        </div>
      )}

      {/* Form Area */}
      <form
        onSubmit={submit}
        suppressHydrationWarning
        className={`space-y-5 ${mode === 'forgot-password' ? 'mt-8' : ''}`}
      >
        {/* Full Name (Sign Up only) */}
        {mode === 'register' && (
          <div>
            <label className={labelClass}>Full Name</label>
            <div className={inputContainerClass}>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Frank Gehry"
                autoComplete="name"
                suppressHydrationWarning
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className={labelClass}>Email Address</label>
          <div className={inputContainerClass}>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="studio@architecture.com"
              autoComplete="email"
              suppressHydrationWarning
              className={inputClass}
            />
          </div>
        </div>

        {/* Password (Login & Register) */}
        {mode !== 'forgot-password' && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
                Password
              </label>
              {mode === 'login' && (
                <Link
                  href="/forgot-password"
                  className="font-mono text-[11px] font-semibold tracking-wider text-bronze transition hover:text-bronze-dark hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            <div className={inputContainerClass}>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                suppressHydrationWarning
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                suppressHydrationWarning
                className="px-3.5 text-stone-warm transition hover:text-charcoal"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Confirm Password (Sign Up only) */}
        {mode === 'register' && (
          <div>
            <label className={labelClass}>Confirm Password</label>
            <div className={inputContainerClass}>
              <input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                suppressHydrationWarning
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                suppressHydrationWarning
                className="px-3.5 text-stone-warm transition hover:text-charcoal"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Remember Me Checkbox (Login only) */}
        {mode === 'login' && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-stone-warm transition hover:text-charcoal">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                suppressHydrationWarning
                className="h-4 w-4 rounded-none border border-line accent-[#a5814f]"
              />
              <span>Remember this device for 30 days</span>
            </label>
          </div>
        )}

        {/* Terms & Newsletter Checkboxes (Sign Up only) */}
        {mode === 'register' && (
          <div className="space-y-3 pt-1">
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-stone-warm">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                suppressHydrationWarning
                className="mt-0.5 h-4 w-4 rounded-none border border-line accent-[#a5814f]"
              />
              <span>
                I agree to the{' '}
                <span className="font-semibold text-charcoal underline underline-offset-2">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="font-semibold text-charcoal underline underline-offset-2">
                  Privacy Policy
                </span>
                .
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-stone-warm">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                suppressHydrationWarning
                className="h-4 w-4 rounded-none border border-line accent-[#a5814f]"
              />
              <span>Receive weekly curated prompt releases and architectural digests.</span>
            </label>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="border border-red-200 bg-red-50/80 px-4 py-3 text-xs leading-relaxed text-red-800">
            {error}
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="flex items-start gap-2 border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs leading-relaxed text-emerald-900">
            <Check size={16} className="mt-0.5 text-emerald-700 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={busy}
          suppressHydrationWarning
          className="group flex w-full items-center justify-center gap-2 bg-charcoal py-4 text-xs font-bold uppercase tracking-[0.22em] text-ivory transition-all duration-300 hover:bg-bronze disabled:opacity-50"
        >
          <span>
            {busy
              ? 'Processing…'
              : mode === 'register'
              ? 'Create Studio Account'
              : mode === 'forgot-password'
              ? 'Send Recovery Link'
              : 'Sign In to RenderVault'}
          </span>
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      </form>

      {/* Switcher Navigation */}
      <div className="mt-8 border-t border-line/60 pt-6 text-center text-xs text-stone-warm">
        {mode === 'register' ? (
          <p>
            Already hold an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-charcoal underline underline-offset-4 transition hover:text-bronze"
            >
              Sign in →
            </Link>
          </p>
        ) : mode === 'forgot-password' ? (
          <p>
            Remember your credentials?{' '}
            <Link
              href="/login"
              className="font-semibold text-charcoal underline underline-offset-4 transition hover:text-bronze"
            >
              Back to sign in →
            </Link>
          </p>
        ) : (
          <p>
            New to RenderVault?{' '}
            <Link
              href="/register"
              className="font-semibold text-charcoal underline underline-offset-4 transition hover:text-bronze"
            >
              Create an account →
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  );
}
