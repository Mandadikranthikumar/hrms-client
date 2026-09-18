import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLoginUser } from '../../services/api';
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { normalizeRole } from '../../utils/permission.js';
import logo from '../../assets/infinetra-logo.png';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const googleButtonRef = useRef(null);


  useEffect(() => {
    const scriptId = 'google-identity-script';

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
          console.error('VITE_GOOGLE_CLIENT_ID is missing - check client/.env');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 300
          });
        }
      }
    };

    if (document.getElementById(scriptId)) {
      initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);

      const data = await googleLoginUser(response.credential);

      login({
        user: data.user,
        token: data.token
      });

      showToast('success', 'Google login successful');

      const userRole = normalizeRole(data.user?.role);
      setTimeout(() => {
        if (userRole === 'super_admin') {
          navigate('/super-admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (error) {
      console.error('Google login error:', error);

      const errorMessage = error?.message?.toLowerCase() || '';

      if (
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('networkerror')
      ) {
        showToast('error', 'Unable to connect to server');
      } else {
        showToast('error', error?.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const realGoogleButton = googleButtonRef.current
      ? googleButtonRef.current.querySelector('div[role="button"]')
      : null;

    if (realGoogleButton) {
      realGoogleButton.click();
    } else {
      showToast(
        'error',
        'Google Sign-In is still loading. Please try again.'
      );
    }
  };

  const openPasskeyModal = () => {
    setShowPasskeyModal(true);
  };

  const closePasskeyModal = () => {
    setShowPasskeyModal(false);
  };

  const handlePasskeySuccess = () => {
  
    sessionStorage.setItem('passkeyVerified', 'true');

    setShowPasskeyModal(false);
    showToast('success', 'Passkey verified');
    navigate('/register');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      showToast('error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: email.trim(),
        password
      });

      login({
        user: data.user,
        token: data.token
      });

      showToast('success', 'Login successful');

      const userRole = normalizeRole(data.user?.role);
      setTimeout(() => {
        if (userRole === 'super_admin') {
          navigate('/super-admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (error) {
      console.error('Login error:', error);

      const errorMessage = error?.message?.toLowerCase() || '';

      if (
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('incorrect email or password')
      ) {
        showToast('error', 'Incorrect email or password');
      } else if (
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('networkerror')
      ) {
        showToast('error', 'Unable to connect to server');
      } else {
        showToast('error', error?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container login-page">
      <div className="login-left">
        <div className="brand-section">
          <img
            src={logo}
            alt="Infinetra Logo"
            className="logo-image"
          />

          <h1>Infinetra HRMS</h1>

          <p className="brand-description">
            Elevating productivity through intelligent employee management and seamless human resource workflows.
          </p>

          <div className="feature-cards">
            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="2" width="6" height="6" rx="1" />
                  <rect x="12" y="2" width="6" height="6" rx="1" />
                  <rect x="2" y="12" width="6" height="6" rx="1" />
                  <rect x="12" y="12" width="6" height="6" rx="1" />
                </svg>
              </span>

              <h4>Unified Dashboard</h4>
              <p>Real-time metrics at your fingertips.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 2C7.23858 2 5 4.23858 5 7V9C4.44772 9 4 9.44772 4 10V14C4 15.6569 5.34315 17 7 17H13C14.6569 17 16 15.6569 16 14V10C16 9.44772 15.5523 9 15 9V7C15 4.23858 12.7614 2 10 2Z"
                    opacity="0.25"
                  />

                  <path
                    d="M7.75 10.75L9.5 12.5L12.75 9.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <h4>Secure Access</h4>
              <p>Enterprise-grade data protection.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          {/* Mobile-only logo header */}
          <div className="mobile-logo-header">
            <img src={logo} alt="Infinetra Logo" className="mobile-logo" />
            <div className="mobile-brand-meta">
              <span className="mobile-brand-name">Infinetra HRMS</span>
              <span className="mobile-brand-sub">Enterprise Portal</span>
            </div>
          </div>

          <div className="login-header-text">
            <h2>Welcome back</h2>
            <p className="subtitle">
              Sign in to continue to your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-row">
              <Link
                to="/forgot-password"
                className="link"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading-content">
                  <span className="spinner-dots" aria-hidden="true"></span>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="divider">
              <span></span>
              <p>OR</p>
              <span></span>
            </div>

            <div
              ref={googleButtonRef}
              style={{
                position: 'absolute',
                top: '-9999px',
                left: '-9999px'
              }}
            ></div>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleClick}
              disabled={loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          <p className="powered-by">
            POWERED BY INFINETRA TECH
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;