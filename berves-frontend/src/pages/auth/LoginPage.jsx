import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, HardHat } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { swError, swSuccess } from '../../lib/swal';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res   = await authApi.login({ email: data.email, password: data.password });
      const token = res.data.data.token;
      const user  = res.data.data.user;
      if (!token || !user) throw new Error('Invalid server response');
      login(user, token);
      swSuccess(`Welcome back, ${user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const d = err.response?.data;
      const msg =
        d?.message
        || d?.errors?.email?.[0]
        || (err.message === 'Invalid server response'
          ? 'Unexpected response from server. Try again or contact support.'
          : null)
        || (err.code === 'ERR_NETWORK' ? 'Cannot reach the API. Is the backend running?' : null)
        || 'Sign in failed. Please try again.';
      swError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, #0f2744 60%, #0d3350 100%)' }}>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--teal)' }}>
            <HardHat size={32} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold text-white">Berves Engineering</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Human Resource Management System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', boxShadow: 'var(--sh-lg)' }}>
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--ink)' }}>Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email" {...register('email')}
                className={`input ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@berves.com" />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} {...register('password')}
                  className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--ink-faint)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--ink-faint)' }}>
            Contact your HR administrator to reset your password
          </p>
        </div>
      </div>
    </div>
  );
};
