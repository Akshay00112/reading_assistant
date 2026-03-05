import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '📖',
      title: 'Upload & Read',
      description: 'Upload your PDFs and dive into immersive reading with AI-powered assistance.',
      color: '#3b82f6'
    },
    {
      icon: '🎵',
      title: 'Audio Guidance',
      description: 'Listen to perfect pronunciation and improve your reading fluency naturally.',
      color: '#8b5cf6'
    },
    {
      icon: '🎯',
      title: 'Smart Practice',
      description: 'Practice sentences with real-time feedback and track your improvement over time.',
      color: '#ec4899'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Visualize your learning journey with detailed analytics and performance metrics.',
      color: '#f59e0b'
    },
    {
      icon: '📚',
      title: 'Online Library',
      description: 'Access a curated collection of books and texts to practice with.',
      color: '#10b981'
    },
    {
      icon: '⚡',
      title: 'Instant Feedback',
      description: 'Get immediate, constructive feedback on your pronunciation and reading pace.',
      color: '#f87171'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Students Learning' },
    { number: '20+', label: 'Books Available' },
    { number: '98%', label: 'Success Rate' },
    { number: '24/7', label: 'Access Available' }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo-section">
            <span className="logo-icon"></span>
            <h1 className="logo-text">ZYLO</h1>
          </div>
          <div className="nav-buttons">
            <button
              className="nav-btn signin"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </button>
            <button
              className="nav-btn signup"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-title-wrapper">
            <h1 className="hero-title">
              Master Reading <span className="gradient-text">Your Way</span>
            </h1>
            <p className="hero-subtitle">
              An AI-powered reading assistant that adapts to your learning style,
              provides real-time feedback, and helps you become a confident reader.
            </p>
          </div>

          <div className="hero-buttons">
            <button
              className="btn-primary btn-large"
              onClick={() => navigate('/signup')}
            >
              <span>🚀 Start Reading Today</span>
            </button>
            <button
              className="btn-secondary btn-large"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            >
              <span>✨ Learn More</span>
            </button>
          </div>

          <div className="hero-image">
            <div className="reading-illustration">
              <div className="book-stack">
                <div className="book book-1"></div>
                <div className="book book-2"></div>
                <div className="book book-3"></div>
              </div>
              <div className="floating-icons">
                <div className="icon icon-1">📖</div>
                <div className="icon icon-2">🎵</div>
                <div className="icon icon-3">🎯</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2 className="section-title">
            Powerful Features <span className="gradient-text">for Better Learning</span>
          </h2>
          <p className="section-description">
            Everything you need to transform your reading experience
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${activeFeature === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveFeature(index)}
              style={{
                '--accent-color': feature.color,
                animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-highlight"></div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">
            How It Works - <span className="gradient-text">Three Simple Steps</span>
          </h2>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Upload Your Material</h3>
            <p>Share your PDF, text, or choose from our online library</p>
            <div className="step-icon">📤</div>
          </div>

          <div className="step-divider"></div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Read & Practice</h3>
            <p>Follow along with AI guidance and practice challenging sentences</p>
            <div className="step-icon">📖</div>
          </div>

          <div className="step-divider"></div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Track Progress</h3>
            <p>Monitor your improvement with detailed analytics and insights</p>
            <div className="step-icon">📊</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2 className="section-title">
              Transform Your <span className="gradient-text">Reading Journey</span>
            </h2>
            <ul className="benefits-list">
              <li>✅ Personalized learning paths adapted to your pace</li>
              <li>✅ Real-time pronunciation and fluency feedback</li>
              <li>✅ Comprehensive progress tracking and insights</li>
              <li>✅ Access 20+ books and texts from our library</li>
              <li>✅ Join 10,000+ students improving their skills daily</li>
              <li>✅ Available 24/7 on any device</li>
            </ul>
            <button
              className="btn-primary btn-large"
              onClick={() => navigate('/signup')}
            >
              🌟 Join the Community
            </button>
          </div>
          <div className="benefits-visual">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="feature-boxes">
              <div className="box box-1">AI Powered</div>
              <div className="box box-2">Smart Feedback</div>
              <div className="box box-3">Progress Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="cta-content">
          <h2>Ready to Improve Your Reading Skills?</h2>
          <p>Join thousands of learners transforming their reading journey</p>
          <div className="cta-buttons">
            <button
              className="btn-primary btn-large"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </button>
            <button
              className="btn-outline btn-large"
              onClick={() => navigate('/signin')}
            >
              Already Have an Account?
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Zylo</h4>
            <p>Master reading your way</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); }}>Features</a></li>
              <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How It Works</a></li>
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>Pricing</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About Us</a></li>
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a></li>
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/support'); }}>Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Zylo. Committed to helping you master reading. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
