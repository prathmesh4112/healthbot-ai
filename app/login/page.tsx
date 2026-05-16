'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Redirect on success
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-black dark:to-gray-900 overflow-hidden relative">
      {/* Enhanced Animated background elements */}
      <div className="fixed inset-0 z-0">
        {/* Gradient orbs with smooth floating animation */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-300/40 via-purple-300/30 to-fuchsia-300/40 dark:from-violet-600/30 dark:via-purple-600/20 dark:to-fuchsia-600/30 rounded-full filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-300/40 via-blue-300/30 to-indigo-300/40 dark:from-cyan-600/30 dark:via-blue-600/20 dark:to-indigo-600/30 rounded-full filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-rose-300/30 via-pink-300/20 to-orange-300/30 dark:from-rose-600/25 dark:via-pink-600/15 dark:to-orange-600/25 rounded-full filter blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),transparent_50%)] animate-pulse-slow"></div>
      </div>

      {/* Custom keyframe animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translate(var(--tw-translate-x), var(--tw-translate-y)) translateY(0px) scale(1); 
          }
          33% { 
            transform: translate(var(--tw-translate-x), var(--tw-translate-y)) translateY(-30px) scale(1.05); 
          }
          66% { 
            transform: translate(var(--tw-translate-x), var(--tw-translate-y)) translateY(15px) scale(0.95); 
          }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.7s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-fadeInUp">
          {/* Logo/Brand */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 bg-black dark:bg-white rounded-full shadow-lg">
              <div className="w-6 h-6 bg-white dark:bg-black rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to access your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="Email address"
                className={`w-full px-4 py-3 text-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-600 ${ focusedField === 'email' ? 'ring-2 ring-black dark:ring-white' : ''
                }`}
                required
              />
              {focusedField === 'email' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  className={`w-full px-4 py-3 pr-12 text-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-600 ${focusedField === 'password' ? 'ring-2 ring-black dark:ring-white' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {focusedField === 'password' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm mt-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded cursor-pointer transition-all"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <Link href="/forgot-password" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-8 mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:scale-105 font-medium text-sm">
              Google
            </button>
            <button className="px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:scale-105 font-medium text-sm">
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-black dark:text-white hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}