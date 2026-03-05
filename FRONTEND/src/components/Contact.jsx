import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPages.css';

const Contact = () => {
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
      console.log('Contact form submitted:', formData);
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
          <h1>Contact Us</h1>
          <p className="subtitle">Get in touch with the Zylo team</p>
        </div>

        <div className="info-content">
          <section className="info-section">
            <h2>We'd Love to Hear From You</h2>
            <p>
              Have questions, feedback, or just want to say hello? We're always excited to hear from 
              our users. Whether you have a question about our service, feedback on how we can improve, 
              or you'd like to discuss partnership opportunities, please don't hesitate to reach out.
            </p>
          </section>

          <section className="info-section contact-form-section">
            <h2>Send us a Message</h2>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  ✅ Thank you for your message! We'll get back to you within 24 hours.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  ❌ There was an error sending your message. Please try again.
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help?"
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
                  placeholder="Tell us more about your inquiry..."
                  rows="7"
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
            <h2>Contact Information</h2>
            <div className="contact-info-grid">
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>Email</h3>
                <p>
                  <a href="mailto:hello@zylo.com">Adharshrajan507@gmail.com</a>
                </p>
                <p className="small-text">We respond within 24 hours</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📱</div>
                <h3>Phone</h3>
                <p>
                  <a href="tel:+918129912781">+918129912781</a>
                </p>
                <p>
                  <a href="tel:+919605783449">+919605783449</a>
                </p>
                <p className="small-text">Mon-Fri, 9 AM - 6 PM EST</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">🏢</div>
                <h3>Address</h3>
                <p>
                  Zylo Learning<br />
                  123 Education Street<br />
                  Tech City, TC 12345
                </p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">💬</div>
                <h3>Social Media</h3>
                <p>
                  Follow us on social media for updates and tips!
                </p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>What We're Looking For</h2>
            <ul>
              <li><strong>Feature Requests:</strong> Have an idea for a new feature? We'd love to hear it!</li>
              <li><strong>Bug Reports:</strong> Found an issue? Let us know so we can fix it</li>
              <li><strong>Feedback:</strong> Your thoughts help us improve our service</li>
              <li><strong>Partnerships:</strong> Are you interested in working with us?</li>
              <li><strong>Educational Inquiries:</strong> Are you an educator? We have special programs for you</li>
              <li><strong>Testimonials:</strong> Share your success story with us!</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Response Time</h2>
            <div className="response-info">
              <p>
                We're committed to responding to all inquiries as quickly as possible. Here's our typical response times:
              </p>
              <ul>
                <li>📧 Email inquiries: Within 24 hours</li>
                <li>💬 Support tickets: Within 12 hours</li>
                <li>☎️ Phone calls: During business hours</li>
                <li>🤝 Partnership inquiries: Within 48 hours</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;
