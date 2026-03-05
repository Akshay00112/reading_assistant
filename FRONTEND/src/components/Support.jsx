import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPages.css';

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      console.log('Support form submitted:', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info-page">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>

      <div className="info-container">
        <div className="info-header">
          <h1>Support & Help Center</h1>
          <p className="subtitle">We're here to help you succeed</p>
        </div>

        <div className="info-content">
          <section className="info-section">
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-item">
              <h3>How do I upload a PDF?</h3>
              <p>
                Once you're logged in, go to your Dashboard and click on "Upload PDF". 
                Select your document and our system will automatically process it and 
                break it into sentences for practice.
              </p>
            </div>

            <div className="faq-item">
              <h3>How does the pronunciation feedback work?</h3>
              <p>
                Our AI system analyzes your speech in real-time using advanced natural language 
                processing. It compares your pronunciation to the reference and provides 
                immediate feedback on difficult words and areas to improve.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I practice offline?</h3>
              <p>
                Currently, you need an internet connection to use Zylo as it relies on 
                our AI processing systems. We're working on offline capabilities for 
                future releases.
              </p>
            </div>

            <div className="faq-item">
              <h3>How is my progress tracked?</h3>
              <p>
                We track metrics including sentences completed, accuracy rates, reading speed, 
                and specific words you struggle with. Visit your Progress page to see 
                detailed analytics and improvements over time.
              </p>
            </div>

            <div className="faq-item">
              <h3>What books are available in the online library?</h3>
              <p>
                We have a curated collection of 20+ books suitable for different reading levels 
                and interests. You can browse them from the Online Library section and start 
                practicing immediately without uploading documents.
              </p>
            </div>

            <div className="faq-item">
              <h3>How long should I practice each day?</h3>
              <p>
                We recommend 15-30 minutes of daily practice for best results. Regular, 
                consistent practice is more effective than occasional longer sessions. 
                You can adjust your pace based on your comfort level.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Getting Started Tips</h2>
            <ul>
              <li><strong>Start Small:</strong> Begin with shorter texts and work your way to longer documents</li>
              <li><strong>Use Headphones:</strong> Headphones give better audio feedback for pronunciation</li>
              <li><strong>Practice Regularly:</strong> Daily practice yields better results than occasional sessions</li>
              <li><strong>Review Feedback:</strong> Pay attention to words flagged in your feedback and practice them</li>
              <li><strong>Adjust Speed:</strong> Use the speed control to go at your own pace</li>
              <li><strong>Check Analytics:</strong> Review your progress page to see improvements over time</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Technical Support</h2>
            <div className="support-info">
              <div className="support-card">
                <h3>🔧 Browser Compatibility</h3>
                <p>Zylo works best on modern browsers: Chrome, Firefox, Safari, and Edge. 
                   For the best experience, keep your browser updated.</p>
              </div>
              <div className="support-card">
                <h3>🎤 Microphone Setup</h3>
                <p>Ensure your microphone is properly connected and has permission to access 
                   audio. Check your browser's microphone settings if audio capture isn't working.</p>
              </div>
              <div className="support-card">
                <h3>📱 Mobile Support</h3>
                <p>Zylo is optimized for desktop and tablet use. Mobile support is limited 
                   due to audio input constraints.</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>Contact Support</h2>
            <p>Couldn't find what you're looking for? Send us a message and we'll get back to you as soon as possible.</p>
            
            <form className="support-form" onSubmit={handleSubmit}>
              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  ✅ Thank you for reaching out! We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  ❌ There was an error submitting your message. Please try again.
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your issue or question..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </section>

          <section className="info-section">
            <h2>Other Ways to Reach Us</h2>
            <div className="contact-methods">
              <div className="contact-method">
                <h3>📧 Email</h3>
                <p><a href="mailto:support@zylo.com">support@zylo.com</a></p>
              </div>
              <div className="contact-method">
                <h3>💬 Live Chat</h3>
                <p>Available during business hours (9 AM - 6 PM EST)</p>
              </div>
              <div className="contact-method">
                <h3>📚 Knowledge Base</h3>
                <p>Visit our comprehensive help documentation</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Support;
