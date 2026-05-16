'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const passwordStrength = {
    hasLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.email) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordStrong && passwordsMatch) {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Signup failed');
        }

        // Redirect on success
        window.location.href = '/login';
        
      } catch (err: any) {
        setError(err.message || 'An error occurred during signup');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-black dark:to-gray-900 overflow-hidden relative">
      {/* Enhanced Animated background elements */}
      <div className="fixed inset-0 z-0">
        {/* Gradient orbs with smooth floating animation */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-300/40 via-teal-300/30 to-cyan-300/40 dark:from-emerald-600/30 dark:via-teal-600/20 dark:to-cyan-600/30 rounded-full filter blur-3xl opacity-70 translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-300/40 via-orange-300/30 to-red-300/40 dark:from-amber-600/30 dark:via-orange-600/20 dark:to-red-600/30 rounded-full filter blur-3xl opacity-70 -translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-indigo-300/30 via-purple-300/20 to-pink-300/30 dark:from-indigo-600/25 dark:via-purple-600/15 dark:to-pink-600/25 rounded-full filter blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}></div>
        
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
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.7s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md animate-fadeInUp">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${ step >= 1
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${ step >= 2
                ? 'bg-black dark:bg-white'
                : 'bg-gray-200 dark:bg-gray-800'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${step >= 2
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                2
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
              {step === 1 ? 'Create your account' : 'Set your password'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {step === 1
                ? 'Join us and start your journey'
                : 'Secure your account with a strong password'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4 animate-slideInRight">
              {/* First Name */}
              <div className="relative group">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="First name"
                  className={`w-full px-4 py-3 text-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-600 ${focusedField === 'firstName' ? 'ring-2 ring-black dark:ring-white' : ''
                  }`}
                  required
                />
                {focusedField === 'firstName' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
                )}
              </div>

              {/* Last Name */}
              <div className="relative group">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Last name"
                  className={`w-full px-4 py-3 text-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-600 ${focusedField === 'lastName' ? 'ring-2 ring-black dark:ring-white' : ''
                  }`}
                  required
                />
                {focusedField === 'lastName' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
                )}
              </div>

              {/* Email */}
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  className={`w-full px-4 py-3 text-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-600 ${focusedField === 'email' ? 'ring-2 ring-black dark:ring-white' : ''
                  }`}
                  required
                />
                {focusedField === 'email' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 pt-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 mt-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded cursor-pointer transition-all" required />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  I agree to the{' '}
                  <Link href="#" className="underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Next Button */}
              <button
                type="submit"
                className="w-full mt-8 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Continue</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-slideInRight">
              {/* Password */}
              <div className="relative group">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Create password"
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

              {/* Password Strength Indicators */}
              {formData.password && (
                <div className="space-y-2 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg animate-fadeInUp">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Password strength
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all ${passwordStrength.hasLength ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all ${passwordStrength.hasUppercase ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all ${passwordStrength.hasNumber ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all ${passwordStrength.hasSpecial ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        One special character (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative group">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Confirm password"
                    className={`w-full px-4 py-3 pr-12 text-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 ${formData.confirmPassword && !passwordsMatch
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                    } placeholder:text-gray-500 dark:placeholder:text-gray-600 ${focusedField === 'confirmPassword' ? 'ring-2 ring-black dark:ring-white' : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {focusedField === 'confirmPassword' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
                )}
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-xs text-red-500">Passwords do not match</p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check size={14} /> Passwords match
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm text-black dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:scale-105"
                >
                  Back
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordStrong || !passwordsMatch}
                  className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          {step === 1 && (
            <>
              <div className="relative mt-8 mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-4">
                <button className="px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:scale-105 font-medium text-sm">
                  Google
                </button>
                <button className="px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:scale-105 font-medium text-sm">
                  GitHub
                </button>
              </div>
            </>
          )}

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-black dark:text-white hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}