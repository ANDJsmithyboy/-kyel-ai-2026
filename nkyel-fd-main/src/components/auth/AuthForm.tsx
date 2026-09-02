/**
 * Ñkyel AI — Sovereign Authentication Form
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Minimal, premium authentication form matching Ñkyel design system:
 * Email Input → Continue Button → OR Divider → Continue with Google
 * Multi-step verification support (OTP code / password) with Clerk hooks.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn, useSignUp } from '@clerk/nextjs';

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
  locale: 'en-US' | 'fr-FR';
  onStepChange?: (step: 'initial' | 'verify_email_code' | 'password') => void;
}

const formCopy = {
  'en-US': {
    emailLabel: 'Email address',
    emailPlaceholder: 'Email address',
    continueBtn: 'Continue',
    orText: 'OR',
    googleBtn: 'Continue with Google',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    codeLabel: 'Verification code',
    codePlaceholder: '6-digit code',
    verifyBtn: 'Verify and continue',
    backBtn: 'Back',
    resendBtn: 'Resend code',
    codeSentTo: 'We sent a verification code to',
    loading: 'Please wait...',
    errors: {
      invalidEmail: 'Please enter a valid email address.',
      generic: 'An error occurred during authentication. Please try again.',
      enterPassword: 'Please enter your password.',
      enterCode: 'Please enter the 6-digit verification code.',
    },
  },
  'fr-FR': {
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'Adresse e-mail',
    continueBtn: 'Continuer',
    orText: 'OU',
    googleBtn: 'Continuer avec Google',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    codeLabel: 'Code de vérification',
    codePlaceholder: 'Code à 6 chiffres',
    verifyBtn: 'Vérifier et continuer',
    backBtn: 'Retour',
    resendBtn: 'Renvoyer le code',
    codeSentTo: 'Nous avons envoyé un code de vérification à',
    loading: 'Veuillez patienter...',
    errors: {
      invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
      generic: "Une erreur est survenue lors de l'authentification. Veuillez réessayer.",
      enterPassword: 'Veuillez entrer votre mot de passe.',
      enterCode: 'Veuillez saisir le code de vérification à 6 chiffres.',
    },
  },
};

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function MailIcon({ className = 'w-5 h-5 text-gray-400' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function AuthForm({ mode, locale, onStepChange }: AuthFormProps) {
  const router = useRouter();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [step, setStep] = useState<'initial' | 'verify_email_code' | 'password'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = formCopy[locale];

  const updateStep = (newStep: 'initial' | 'verify_email_code' | 'password') => {
    setStep(newStep);
    setErrorMsg(null);
    if (onStepChange) onStepChange(newStep);
  };

  // ── Google OAuth Flow ──
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);

    try {
      if (mode === 'sign-in') {
        if (!isSignInLoaded || !signIn) {
          setErrorMsg(t.errors.generic);
          setGoogleLoading(false);
          return;
        }
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/chat',
        });
      } else {
        if (!isSignUpLoaded || !signUp) {
          setErrorMsg(t.errors.generic);
          setGoogleLoading(false);
          return;
        }
        await signUp.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/chat',
        });
      }
    } catch (err: any) {
      // Structured Clerk error logging (safe for console, not for UI)
      const clerkError = err?.errors?.[0];
      console.error('[Ñkyel Auth] Google OAuth error:', {
        step: 'google_redirect',
        code: clerkError?.code || 'unknown',
        message: clerkError?.message || err?.message,
        longMessage: clerkError?.longMessage,
        meta: clerkError?.meta,
      });
      const msg = clerkError?.longMessage || clerkError?.message || err?.message || t.errors.generic;
      setErrorMsg(msg);
      setGoogleLoading(false);
    }
  };

  // ── Initial Email Submit Flow ──
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(t.errors.invalidEmail);
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'sign-up') {
        if (!isSignUpLoaded || !signUp) {
          setErrorMsg(t.errors.generic);
          setLoading(false);
          return;
        }

        // Start sign up flow
        await signUp.create({
          emailAddress: email.trim(),
        });

        // Send email verification code
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        updateStep('verify_email_code');
      } else {
        // Sign-in flow
        if (!isSignInLoaded || !signIn) {
          setErrorMsg(t.errors.generic);
          setLoading(false);
          return;
        }

        const res = await signIn.create({
          identifier: email.trim(),
        });

        if (res.status === 'complete') {
          if (setSignInActive) {
            await setSignInActive({ session: res.createdSessionId });
          }
          router.push('/chat');
          return;
        }

        if (res.status === 'needs_first_factor') {
          const emailCodeFactor = res.supportedFirstFactors?.find(
            (f: any) => f.strategy === 'email_code'
          );

          if (emailCodeFactor) {
            await signIn.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: (emailCodeFactor as any).emailAddressId,
            });
            updateStep('verify_email_code');
          } else {
            const passwordFactor = res.supportedFirstFactors?.find(
              (f: any) => f.strategy === 'password'
            );
            if (passwordFactor) {
              updateStep('password');
            } else {
              updateStep('verify_email_code');
            }
          }
        } else {
          updateStep('verify_email_code');
        }
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      console.error('[Ñkyel Auth] Email initiation error:', {
        step: mode === 'sign-up' ? 'signup_create' : 'signin_create',
        code: clerkError?.code || 'unknown',
        message: clerkError?.message || err?.message,
        longMessage: clerkError?.longMessage,
        meta: clerkError?.meta,
      });
      const msg = clerkError?.longMessage || clerkError?.message || err?.message || t.errors.generic;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Verification Code Submit Flow ──
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setErrorMsg(t.errors.enterCode);
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'sign-up') {
        if (!isSignUpLoaded || !signUp) return;

        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: verificationCode.trim(),
        });

        if (completeSignUp.status === 'complete') {
          if (setSignUpActive) {
            await setSignUpActive({ session: completeSignUp.createdSessionId });
          }
          router.push('/chat');
        } else {
          setErrorMsg(t.errors.generic);
        }
      } else {
        if (!isSignInLoaded || !signIn) return;

        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: verificationCode.trim(),
        });

        if (completeSignIn.status === 'complete') {
          if (setSignInActive) {
            await setSignInActive({ session: completeSignIn.createdSessionId });
          }
          router.push('/chat');
        } else {
          setErrorMsg(t.errors.generic);
        }
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      console.error('[Ñkyel Auth] Code verification error:', {
        step: 'verify_email_code',
        code: clerkError?.code || 'unknown',
        message: clerkError?.message || err?.message,
        longMessage: clerkError?.longMessage,
        meta: clerkError?.meta,
      });
      const msg = clerkError?.longMessage || clerkError?.message || err?.message || t.errors.generic;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Password Submit Flow (Sign-in) ──
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg(t.errors.enterPassword);
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      if (!isSignInLoaded || !signIn) return;

      const res = await signIn.attemptFirstFactor({
        strategy: 'password',
        password,
      });

      if (res.status === 'complete') {
        if (setSignInActive) {
          await setSignInActive({ session: res.createdSessionId });
        }
        router.push('/chat');
      } else {
        setErrorMsg(t.errors.generic);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      console.error('[Ñkyel Auth] Password auth error:', {
        step: 'password_attempt',
        code: clerkError?.code || 'unknown',
        message: clerkError?.message || err?.message,
        longMessage: clerkError?.longMessage,
        meta: clerkError?.meta,
      });
      const msg = clerkError?.longMessage || clerkError?.message || err?.message || t.errors.generic;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend Code Flow ──
  const handleResendCode = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      if (mode === 'sign-up') {
        if (signUp) {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        }
      } else {
        if (signIn) {
          const emailCodeFactor = signIn.supportedFirstFactors?.find(
            (f: any) => f.strategy === 'email_code'
          );
          if (emailCodeFactor) {
            await signIn.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: (emailCodeFactor as any).emailAddressId,
            });
          }
        }
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      console.error('[Ñkyel Auth] Resend code error:', {
        step: 'resend_code',
        code: clerkError?.code || 'unknown',
        message: clerkError?.message || err?.message,
        longMessage: clerkError?.longMessage,
      });
      const msg = clerkError?.longMessage || clerkError?.message || err?.message || t.errors.generic;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nkyel-auth-form-wrapper">
      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="nkyel-auth-error-alert" role="alert">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 1 : INITIAL MINIMAL SCREEN (Email → Continue → OR → Google)
          ═══════════════════════════════════════════════════════════ */}
      {step === 'initial' && (
        <div className="nkyel-auth-step-container">
          <form onSubmit={handleEmailSubmit} className="nkyel-auth-main-form" noValidate>
            {/* Email Input Field */}
            <div className="nkyel-input-group">
              <label htmlFor="nkyel-auth-email" className="sr-only">
                {t.emailLabel}
              </label>
              <div className="nkyel-input-field-wrapper">
                <span className="nkyel-input-icon">
                  <MailIcon />
                </span>
                <input
                  id="nkyel-auth-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  autoFocus
                  autoComplete="email"
                  className="nkyel-auth-input"
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            {/* Primary Continue Button */}
            <button
              id="nkyel-auth-continue-btn"
              type="submit"
              disabled={loading || googleLoading || !email.trim()}
              className="nkyel-auth-btn-primary"
            >
              {loading ? (
                <span className="nkyel-btn-content">
                  <span className="nkyel-spinner-sm" />
                  <span>{t.loading}</span>
                </span>
              ) : (
                <span>{t.continueBtn}</span>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="nkyel-auth-divider" role="separator">
            <span className="nkyel-auth-divider-line" />
            <span className="nkyel-auth-divider-text">{t.orText}</span>
            <span className="nkyel-auth-divider-line" />
          </div>

          {/* Continue with Google Button */}
          <button
            id="nkyel-auth-google-btn"
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading || googleLoading}
            className="nkyel-auth-btn-google"
          >
            {googleLoading ? (
              <span className="nkyel-btn-content">
                <span className="nkyel-spinner-sm dark" />
                <span>{t.loading}</span>
              </span>
            ) : (
              <span className="nkyel-btn-content">
                <GoogleIcon className="nkyel-google-icon" />
                <span className="nkyel-google-btn-text">{t.googleBtn}</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 2 : EMAIL CODE OTP VERIFICATION
          ═══════════════════════════════════════════════════════════ */}
      {step === 'verify_email_code' && (
        <div className="nkyel-auth-step-container">
          <div className="nkyel-auth-step-info">
            <p className="nkyel-auth-step-desc">
              {t.codeSentTo} <strong className="nkyel-auth-step-email">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="nkyel-auth-main-form" noValidate>
            <div className="nkyel-input-group">
              <label htmlFor="nkyel-auth-code" className="sr-only">
                {t.codeLabel}
              </label>
              <input
                id="nkyel-auth-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder={t.codePlaceholder}
                required
                autoFocus
                autoComplete="one-time-code"
                className="nkyel-auth-input nkyel-auth-code-input"
                disabled={loading}
              />
            </div>

            <button
              id="nkyel-auth-verify-btn"
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="nkyel-auth-btn-primary"
            >
              {loading ? (
                <span className="nkyel-btn-content">
                  <span className="nkyel-spinner-sm" />
                  <span>{t.loading}</span>
                </span>
              ) : (
                <span>{t.verifyBtn}</span>
              )}
            </button>

            <div className="nkyel-auth-step-actions">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="nkyel-auth-sub-btn"
              >
                {t.resendBtn}
              </button>
              <span className="nkyel-auth-dot-sep">·</span>
              <button
                type="button"
                onClick={() => updateStep('initial')}
                disabled={loading}
                className="nkyel-auth-sub-btn"
              >
                {t.backBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 3 : PASSWORD ENTRY (Sign-in)
          ═══════════════════════════════════════════════════════════ */}
      {step === 'password' && (
        <div className="nkyel-auth-step-container">
          <form onSubmit={handlePasswordSubmit} className="nkyel-auth-main-form" noValidate>
            <div className="nkyel-input-group">
              <label htmlFor="nkyel-auth-password" className="sr-only">
                {t.passwordLabel}
              </label>
              <input
                id="nkyel-auth-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                autoFocus
                autoComplete="current-password"
                className="nkyel-auth-input"
                disabled={loading}
              />
            </div>

            <button
              id="nkyel-auth-pass-btn"
              type="submit"
              disabled={loading || !password}
              className="nkyel-auth-btn-primary"
            >
              {loading ? (
                <span className="nkyel-btn-content">
                  <span className="nkyel-spinner-sm" />
                  <span>{t.loading}</span>
                </span>
              ) : (
                <span>{t.continueBtn}</span>
              )}
            </button>

            <div className="nkyel-auth-step-actions">
              <button
                type="button"
                onClick={() => updateStep('initial')}
                disabled={loading}
                className="nkyel-auth-sub-btn"
              >
                {t.backBtn}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
