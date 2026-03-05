import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPages.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>

      <div className="info-container">
        <div className="info-header">
          <h1>About Zylo</h1>
          <p className="subtitle">Transforming Reading for Everyone</p>
        </div>

        <div className="info-content">
          <section className="info-section">
            <h2>Our Mission</h2>
            <p>
              Zylo is dedicated to transforming the reading experience for students with dyslexia 
              and other reading challenges. We believe that everyone deserves access to tools that 
              help them succeed in their educational journey.
            </p>
          </section>

          <section className="info-section">
            <h2>What We Do</h2>
            <p>
              We provide an AI-powered reading assistant that:
            </p>
            <ul>
              <li>Offers real-time pronunciation feedback</li>
              <li>Adapts to individual learning styles</li>
              <li>Provides comprehensive progress tracking</li>
              <li>Makes reading practice engaging and rewarding</li>
              <li>Supports both uploaded documents and our online library</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Why Choose Zylo?</h2>
            <ul>
              <li>✅ AI-Powered Technology - Intelligent feedback tailored to your needs</li>
              <li>✅ Personalized Learning - Adapts to your reading pace and style</li>
              <li>✅ Comprehensive Analytics - Track your progress with detailed insights</li>
              <li>✅ 24/7 Access - Practice whenever and wherever you want</li>
              <li>✅ Supportive Community - Join thousands of learners improving daily</li>
              <li>✅ Evidence-Based - Built on research in reading development</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Our Team</h2>
            <p>
              Zylo was founded by educators and technologists passionate about making reading 
              accessible to everyone. Our team combines expertise in education, artificial intelligence, 
              and user experience design to create tools that truly make a difference.
            </p>
          </section>

          <section className="info-section">
            <h2>Our Impact</h2>
            <div className="impact-stats">
              <div className="stat">
                <h3>10,000+</h3>
                <p>Students Helped</p>
              </div>
              <div className="stat">
                <h3>500,000+</h3>
                <p>Practice Sessions</p>
              </div>
              <div className="stat">
                <h3>98%</h3>
                <p>User Satisfaction</p>
              </div>
              <div className="stat">
                <h3>20+</h3>
                <p>Books Available</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>Our Commitment</h2>
            <p>
              We are committed to continuous improvement and making sure our platform serves 
              the needs of our users. Your feedback helps us grow and better support your 
              reading journey.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
