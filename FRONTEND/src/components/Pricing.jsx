import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPages.css';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '✅ Upload 2 PDFs per month',
        '✅ Basic pronunciation feedback',
        '✅ Progress tracking',
        '✅ Access to 5 online books',
        '✅ Community support'
      ],
      buttonText: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '₹299',
      period: '/month',
      description: 'Best for active learners',
      features: [
        '✅ Unlimited PDF uploads',
        '✅ Advanced pronunciation analysis',
        '✅ Real-time feedback with AI coaching',
        '✅ Access to 20+ online books',
        '✅ Detailed analytics & insights',
        '✅ Priority email support',
        '✅ Monthly progress reports'
      ],
      buttonText: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Premium',
      price: '₹599',
      period: '/month',
      description: 'For dedicated improvement',
      features: [
        '✅ Everything in Pro',
        '✅ 1-on-1 coaching sessions (2/month)',
        '✅ Custom learning plans',
        '✅ Offline mode access',
        '✅ Family account (up to 5 users)',
        '✅ Ad-free experience',
        '✅ 24/7 priority support'
      ],
      buttonText: 'Start Free Trial',
      highlighted: false
    }
  ];

  return (
    <div className="info-page">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>

      <div className="info-container">
        <div className="info-header">
          <h1>Simple, Transparent Pricing</h1>
          <p className="subtitle">Choose the plan that fits your learning journey</p>
        </div>

        <div className="info-content">
          <section className="info-section">
            <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '40px' }}>
              All plans include a 7-day free trial. No credit card required. Cancel anytime.
            </p>

            <div className="pricing-grid">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
                  style={{
                    background: plan.highlighted
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))'
                      : 'rgba(30, 41, 59, 0.5)',
                    border: plan.highlighted
                      ? '2px solid rgba(59, 130, 246, 0.6)'
                      : '1px solid rgba(96, 165, 250, 0.2)',
                    transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {plan.highlighted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: 'white',
                        padding: '4px 16px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ⭐ Most Popular
                    </div>
                  )}

                  <h3 style={{ fontSize: '1.5rem', color: '#e2e8f0', marginBottom: '10px' }}>
                    {plan.name}
                  </h3>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa' }}>
                      {plan.price}
                    </div>
                    <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>{plan.period}</div>
                  </div>

                  <p style={{ color: '#cbd5e1', marginBottom: '30px', minHeight: '40px' }}>
                    {plan.description}
                  </p>

                  <button
                    onClick={() => navigate('/signup')}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: plan.highlighted
                        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                        : 'rgba(96, 165, 250, 0.2)',
                      color: plan.highlighted ? 'white' : '#60a5fa',
                      border: plan.highlighted
                        ? 'none'
                        : '1px solid rgba(96, 165, 250, 0.4)',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginBottom: '30px'
                    }}
                    onMouseEnter={(e) => {
                      if (plan.highlighted) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)';
                      } else {
                        e.target.style.background = 'rgba(96, 165, 250, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                      if (!plan.highlighted) {
                        e.target.style.background = 'rgba(96, 165, 250, 0.2)';
                      }
                    }}
                  >
                    {plan.buttonText}
                  </button>

                  <div style={{ borderTop: '1px solid rgba(96, 165, 250, 0.2)', paddingTop: '20px' }}>
                    <h4 style={{ color: '#cbd5e1', marginBottom: '15px', fontSize: '1rem' }}>
                      What's included:
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          style={{
                            color: '#a0aec0',
                            fontSize: '0.95rem',
                            padding: '8px 0',
                            lineHeight: '1.6'
                          }}
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="info-section">
            <h2>Frequently Asked Questions</h2>

            <div className="faq-item">
              <h3>Can I change my plan anytime?</h3>
              <p>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect 
                at the start of your next billing cycle.
              </p>
            </div>

            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>
                We accept all major credit cards (Visa, Mastercard, American Express), 
                UPI, and digital wallets. All payments are processed securely.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is there a free trial?</h3>
              <p>
                Absolutely! All paid plans include a 7-day free trial. No credit card required 
                to start your trial. You can cancel anytime during the trial period.
              </p>
            </div>

            <div className="faq-item">
              <h3>What happens when my trial ends?</h3>
              <p>
                You'll receive a reminder email 3 days before your trial ends. If you don't 
                cancel, your subscription will begin and you'll be charged. You can always 
                cancel from your account settings.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is there a refund policy?</h3>
              <p>
                Yes! If you're not satisfied within the first 30 days, we offer a full refund. 
                No questions asked. Contact our support team for assistance.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do you offer discounts for annual billing?</h3>
              <p>
                Yes! Sign up for annual billing and save 20% compared to monthly payments. 
                You can switch to annual billing in your account settings.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Still have questions?</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              Our support team is here to help. Reach out to us anytime!
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/contact')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Contact Sales
              </button>
              <button
                onClick={() => navigate('/support')}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(96, 165, 250, 0.2)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(96, 165, 250, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(96, 165, 250, 0.2)';
                }}
              >
                View FAQ
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
