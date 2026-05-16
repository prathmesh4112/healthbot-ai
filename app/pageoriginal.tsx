'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gray-100 dark:bg-gray-900 rounded-full filter blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gray-100 dark:bg-gray-900 rounded-full filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 sm:px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white dark:bg-black rounded-full"></div>
            </div>
            <span className="font-bold text-lg text-black dark:text-white hidden sm:inline">
              HealthBot AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="px-6 sm:px-10 py-20 sm:py-32">
          <div className="max-w-2xl mx-auto text-center animate-fadeInUp">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white mb-6 text-balance">
              Welcome To{''}
              <span className="relative">
                <span className="relative z-10">  HealthBot AI</span>
                <div className="absolute inset-x-0 bottom-2 h-3 bg-gray-300 dark:bg-gray-700 -z-0 opacity-50 rounded-sm"></div>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Your intelligent health companion powered by advanced AI. Get quick symptom analysis, health guidance, and personalized wellness insights — available 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/login"
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                 Login
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-black dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                Try Sign Up
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-5xl mx-auto mt-24">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-12 text-center">
              Why Choose Us
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: '24/7 Available',
                  description: 'Available At Any time',
                  icon: '✨',
                },
                {
                  title: 'Private & Secure',
                  description: 'We donot disclose any information',
                  icon: '🎨',
                },
                {
                  title: 'AI Powered',
                  description: '',
                  icon: '✓',
                },
                {
                  title: 'Fully Responsive',
                  description: 'Works flawlessly on all devices - mobile, tablet, desktop with optimized layouts.',
                  icon: '📱',
                },
                {
                  title: 'Dark Mode Ready',
                  description: 'Full dark mode support with beautiful contrast ratios and accessibility compliance.',
                  icon: '🌙',
                },
                {
                  title: 'Production Ready',
                  description: 'Built with Next.js and Tailwind CSS, ready to integrate into any modern application.',
                  icon: '🚀',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:scale-105 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-2xl mx-auto mt-24 text-center">
            <div className="p-8 sm:p-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Sign up now 
              </p>
              <Link
                href="/signup"
                className="inline-flex px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all items-center gap-2 group"
              >
                Create Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-300 dark:border-gray-700 mt-24 px-6 sm:px-10 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white dark:bg-black rounded-full"></div>
                  </div>
                  <span className="font-bold text-black dark:text-white">HealthBot AI</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  HealthBot AI provides general health information and guidance only. This is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Documentation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 HealthBot AI. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">GitHub</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
