import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import coffeeLogo from '../../../assets/images/coffee crop logo.png';
import bgImage from '../../../assets/images/bg1.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });

  const validate = (values) => {
    const nextErrors = { username: '', password: '' };
    const uname = String(values.username || '').trim();
    const pwd = String(values.password || '');

    if (!uname) {
      nextErrors.username = 'Username is required';
    } else if (uname.length < 3 || uname.length > 32) {
      nextErrors.username = 'Username must be 3-32 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(uname)) {
      nextErrors.username = 'Use letters, numbers, dot, underscore or hyphen';
    }

    if (!pwd) {
      nextErrors.password = 'Password is required';
    } else if (pwd.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    return nextErrors;
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) navigate('/dashboard', { replace: true });
    } catch (_) {}
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const nextErrors = validate({ username, password });
    setErrors(nextErrors);
    setTouched({ username: true, password: true });
    if (nextErrors.username || nextErrors.password) return;

    setLoading(true);
    try {
      const res = await authAPI.login(String(username).trim(), password);
      if (res && res.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate({ username, password }));
  };

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    if (touched.username || touched.password) {
      setErrors(validate({ username: fieldValue('username', e), password: fieldValue('password', e) }));
    }
  };

  const fieldValue = (field, e) => {
    if (field === 'username') return field === e.target.name ? e.target.value : username;
    if (field === 'password') return field === e.target.name ? e.target.value : password;
    return '';
  };

  const container = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const card = {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 20px var(--shadow-color)',
    width: '100%',
    maxWidth: 400,
    border: '1px solid #e9ecef'
  };

  const input = {
    width: '100%',
    padding: '0.75rem 1rem',
    marginBottom: '0.75rem',
    borderRadius: 8,
    border: '1px solid #e9ecef',
    fontSize: '1rem',
    outline: 'none'
  };

  const button = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: 'none',
    background: 'var(--forest-green)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer'
  };

  const title = { marginBottom: '0.25rem', color: 'var(--dark-green)', textAlign: 'center' };
  const subtitle = { marginBottom: '1rem', color: 'var(--dark-brown)', textAlign: 'center', fontWeight: 500, fontSize: '0.95rem' };
  const err = { color: '#b00020', marginBottom: '0.75rem' };
  const label = { fontWeight: 600, color: 'var(--primary-green)', marginBottom: '0.25rem', display: 'block' };
  const fieldError = { color: '#b00020', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '0.5rem' };
  const headerWrap = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' };
  const logo = { height: 56, width: 'auto' };

  return (
    <div style={container}>
      <form style={card} onSubmit={handleSubmit} noValidate>
        <div style={headerWrap}>
          <img src={coffeeLogo} alt="Coffee Crop Logo" style={logo} />
          <h2 style={title}>Coffee Crop Monitoring</h2>
          <div style={subtitle}>Administrator Access</div>
        </div>
        {error ? <div style={err}>{error}</div> : null}

        <label style={label} htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          style={{
            ...input,
            borderColor: touched.username && errors.username ? '#b00020' : '#e9ecef',
            boxShadow: touched.username && errors.username ? '0 0 0 3px rgba(176,0,32,0.08)' : 'none'
          }}
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={handleChange(setUsername)}
          onBlur={handleBlur('username')}
          autoComplete="username"
          autoFocus
          required
          aria-invalid={Boolean(touched.username && errors.username)}
          aria-describedby="username-error"
        />
        {touched.username && errors.username ? (
          <div id="username-error" style={fieldError}>{errors.username}</div>
        ) : null}

        <label style={label} htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          style={{
            ...input,
            borderColor: touched.password && errors.password ? '#b00020' : '#e9ecef',
            boxShadow: touched.password && errors.password ? '0 0 0 3px rgba(176,0,32,0.08)' : 'none'
          }}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handleChange(setPassword)}
          onBlur={handleBlur('password')}
          autoComplete="current-password"
          required
          aria-invalid={Boolean(touched.password && errors.password)}
          aria-describedby="password-error"
        />
        {touched.password && errors.password ? (
          <div id="password-error" style={fieldError}>{errors.password}</div>
        ) : null}

        <button style={{
          ...button,
          opacity: loading ? 0.85 : 1,
          filter: loading ? 'grayscale(0.1)' : 'none'
        }} type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;


