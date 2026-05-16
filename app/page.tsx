'use client';

import { ArrowRight, Sparkles, Shield, Zap, Clock, Brain, HeartPulse } from 'lucide-react';
import { useState, useEffect } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
};

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Large animated white orbs */}
        <div 
          className="absolute w-[600px] h-[600px] bg-white rounded-full filter blur-3xl opacity-5"
          style={{
            top: '10%',
            left: '5%',
            animation: 'float 25s ease-in-out infinite',
          }}
        ></div>
        <div 
          className="absolute w-[500px] h-[500px] bg-white rounded-full filter blur-3xl opacity-5"
          style={{
            bottom: '10%',
            right: '5%',
            animation: 'float 22s ease-in-out infinite',
            animationDelay: '3s',
          }}
        ></div>
        <div 
          className="absolute w-[700px] h-[700px] bg-white rounded-full filter blur-3xl opacity-5"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'float 30s ease-in-out infinite',
            animationDelay: '5s',
          }}
        ></div>

        {/* Animated Lines */}
        <div className="absolute inset-0">
          <div 
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            style={{
              top: '20%',
              width: '100%',
              animation: 'slideRight 15s linear infinite',
            }}
          ></div>
          <div 
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            style={{
              top: '50%',
              width: '100%',
              animation: 'slideLeft 20s linear infinite',
            }}
          ></div>
          <div 
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            style={{
              top: '80%',
              width: '100%',
              animation: 'slideRight 18s linear infinite',
            }}
          ></div>
        </div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: particle.x + '%',
              top: particle.y + '%',
              width: particle.size + 'px',
              height: particle.size + 'px',
              animation: 'floatParticle ' + particle.duration + 's ease-in-out infinite',
              animationDelay: particle.delay + 's',
              opacity: 0.3,
            }}
          ></div>
        ))}

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        ></div>

        {/* Mouse follower spotlight */}
        <div
          className="absolute w-[500px] h-[500px] bg-white rounded-full filter blur-3xl pointer-events-none transition-all duration-500 opacity-5"
          style={{
            left: mousePosition.x - 250,
            top: mousePosition.y - 250,
          }}
        ></div>

        {/* Rotating Rings */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="w-[800px] h-[800px] border border-white/10 rounded-full"
            style={{ animation: 'rotate 40s linear infinite' }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full"
            style={{ animation: 'rotate 30s linear infinite reverse' }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full"
            style={{ animation: 'rotate 20s linear infinite' }}
          ></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 sm:px-10 py-6 backdrop-blur-md bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/30 group-hover:shadow-white/50 transition-all group-hover:scale-110">
              <HeartPulse className="w-5 h-5 text-black animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-20"></div>
            </div>
            <span className="font-bold text-lg text-white hidden sm:inline">
              HealthBot AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:scale-105"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-semibold bg-white text-black rounded-lg hover:shadow-lg hover:shadow-white/50 hover:scale-105 transition-all"
            >
              Get Started
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="px-6 sm:px-10 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
              <span className="text-sm text-gray-300">Powered by Advanced AI</span>
            </div>

            <h1 
              className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-white mb-6 animate-fadeIn"
              style={{
                textShadow: '0 0 80px rgba(255, 255, 255, 0.3)',
              }}
            >
              Welcome To
              <br />
              <span className="relative inline-block mt-4 group">
                <span className="relative z-10 animate-pulse">
                  HealthBot AI
                </span>
                <div className="absolute inset-0 blur-2xl bg-white opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute inset-x-0 -bottom-2 h-1 bg-white animate-pulse"></div>
              </span>
            </h1>

            <p className="text-lg sm:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              Your intelligent health companion powered by advanced AI. Get quick symptom analysis, health guidance, and personalized wellness insights — available 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <a
                href="/login"
                className="group px-10 py-5 bg-white text-black font-semibold rounded-xl hover:shadow-2xl hover:shadow-white/30 hover:scale-110 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">Login</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </a>
              <a
                href="/signup"
                className="group px-10 py-5 border-2 border-white/50 bg-transparent backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white hover:text-black hover:scale-110 hover:shadow-xl hover:shadow-white/30 transition-all flex items-center justify-center gap-3"
              >
                <span>Try Sign Up</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </a>
            </div>

            {/* Floating stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              {[
                { label: 'Active Users', value: '50K+', icon: '👥' },
                { label: 'Consultations', value: '1M+', icon: '💬' },
                { label: 'Success Rate', value: '98%', icon: '✨' },
                { label: 'Countries', value: '120+', icon: '🌍' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/20 transition-all"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Why Choose Us
              </h2>
              <div className="w-20 h-1 bg-white mx-auto mb-4 animate-pulse"></div>
              <p className="text-xl text-gray-400">
                Experience healthcare reimagined with cutting-edge AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: '24/7 Available',
                  description: 'Round-the-clock access to health insights and guidance whenever you need it',
                  icon: Clock,
                },
                {
                  title: 'Private & Secure',
                  description: 'Your health data is encrypted and protected with enterprise-grade security',
                  icon: Shield,
                },
                {
                  title: 'AI Powered',
                  description: 'Advanced machine learning algorithms provide accurate health assessments',
                  icon: Brain,
                },
                {
                  title: 'Lightning Fast',
                  description: 'Get instant responses and analysis in seconds, not hours',
                  icon: Zap,
                },
                {
                  title: 'Personalized Care',
                  description: 'Tailored health recommendations based on your unique profile and history',
                  icon: HeartPulse,
                },
                {
                  title: 'Smart Insights',
                  description: 'Discover patterns and trends in your health data with intelligent analytics',
                  icon: Sparkles,
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 animate-fadeIn"
                    style={{ animationDelay: (index * 0.1) + 's' }}
                  >
                    <div className="relative w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-lg shadow-white/30">
                      <Icon className="w-7 h-7 text-black" />
                      <div className="absolute inset-0 rounded-xl border-2 border-white animate-ping opacity-0 group-hover:opacity-20"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="max-w-6xl mx-auto mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                How It Works
              </h2>
              <div className="w-20 h-1 bg-white mx-auto mb-4 animate-pulse"></div>
              <p className="text-xl text-gray-400">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Create Account',
                  description: 'Sign up in seconds and set up your personalized health profile',
                },
                {
                  step: '02',
                  title: 'Describe Symptoms',
                  description: 'Tell our AI about your symptoms or health concerns in natural language',
                },
                {
                  step: '03',
                  title: 'Get Insights',
                  description: 'Receive instant analysis, recommendations, and personalized guidance',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 animate-fadeIn group"
                  style={{ animationDelay: (index * 0.15) + 's' }}
                >
                  <div className="text-7xl font-bold text-white/10 mb-4 group-hover:text-white/20 transition-colors">{item.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-white/30 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-32">
            <div className="relative p-12 sm:p-16 rounded-3xl bg-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all overflow-hidden group">
              {/* Animated background shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 text-center">
                <h3 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                  Ready to Transform Your Health?
                </h3>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                  Join thousands of users who trust HealthBot AI for their daily health guidance and wellness insights.
                </p>
                <a
                  href="/signup"
                  className="inline-flex px-12 py-6 bg-white text-black text-lg font-semibold rounded-xl hover:shadow-2xl hover:shadow-white/50 hover:scale-110 transition-all items-center gap-3 group"
                >
                  <span>Create Free Account</span>
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </a>
                <p className="text-sm text-gray-500 mt-6">No credit card required • Free forever plan available</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="max-w-6xl mx-auto mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Loved by Users Worldwide
              </h2>
              <div className="w-20 h-1 bg-white mx-auto mb-4 animate-pulse"></div>
              <p className="text-xl text-gray-400">
                See what our community has to say
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Health Enthusiast',
                  avatar: '👩',
                  text: 'HealthBot AI has completely changed how I approach my wellness. The insights are incredibly accurate!',
                  rating: 5,
                },
                {
                  name: 'Michael Chen',
                  role: 'Busy Professional',
                  avatar: '👨',
                  text: 'Having 24/7 access to health guidance is invaluable. It\'s like having a doctor in my pocket.',
                  rating: 5,
                },
                {
                  name: 'Emma Williams',
                  role: 'Fitness Coach',
                  avatar: '👩‍⚕️',
                  text: 'I recommend HealthBot AI to all my clients. The personalized recommendations are spot-on.',
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/20 transition-all animate-fadeIn"
                  style={{ animationDelay: (index * 0.1) + 's' }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-white text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed italic">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-32 px-6 sm:px-10 py-16 bg-black/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/30">
                    <HeartPulse className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-bold text-xl text-white">HealthBot AI</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  HealthBot AI provides general health information and guidance only. This is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white hover:text-black border border-white/10 flex items-center justify-center text-gray-400 hover:scale-110 transition-all">
                    <span className="text-sm">𝕏</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white hover:text-black border border-white/10 flex items-center justify-center text-gray-400 hover:scale-110 transition-all">
                    <span className="text-sm">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white hover:text-black border border-white/10 flex items-center justify-center text-gray-400 hover:scale-110 transition-all">
                    <span className="text-sm">f</span>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4 text-lg">Product</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4 text-lg">Company</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4 text-lg">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">GDPR</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2025 HealthBot AI. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>Made with ❤️ for better health</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translate(100px, -100px);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideRight {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(-100%);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}