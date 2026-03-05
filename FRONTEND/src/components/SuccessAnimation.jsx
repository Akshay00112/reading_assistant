/**
 * Success Animation Component
 * Displays exciting animations when children successfully pronounce words/sentences
 */

import React, { useState, useEffect } from 'react';
import './SuccessAnimation.css';

const SuccessAnimation = ({ 
  show, 
  type = 'word', // 'word' or 'sentence'
  message = 'Perfect!',
  onComplete 
}) => {
  const [particles, setParticles] = useState([]);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate floating particles (emojis)
      const particleEmojis = ['⭐', '✨', '🎉', '💫', '🌟', '🎈', '👏', '🎯', '❤️', '🌈', '🎊', '🎁'];
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: particleEmojis[Math.floor(Math.random() * particleEmojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.2
      }));
      setParticles(newParticles);

      // Generate stars for star burst effect
      const newStars = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i * 360) / 8
      }));
      setStars(newStars);
      
      // Animation stays on screen until user clicks to practice again
      // No auto-timeout - let parent component control when to hide
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="success-animation-container">
      {/* Main Success Message */}
      <div className={`success-message ${type}`}>
        <div className="pulse-circle"></div>
        <div className="pulse-circle pulse-circle-2"></div>
        
        <div className="message-content">
          <div className="emoji-bounce">🎊</div>
          <h2 className="success-text">{message}</h2>
          <p className="encouragement-text">
            {type === 'word' 
              ? "Great job! You nailed that word! 👏" 
              : "Amazing! You completed the sentence perfectly! 🌟"}
          </p>
        </div>
        
        <div className="emoji-bounce emoji-bounce-2">🎉</div>
      </div>

      {/* Floating Particles (Emojis) */}
      <div className="particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="floating-particle"
            style={{
              left: `${particle.left}%`,
              '--delay': `${particle.delay}s`
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>

      {/* Star Burst Effect */}
      <div className="star-burst-container">
        {stars.map(star => (
          <div
            key={star.id}
            className="burst-star"
            style={{
              '--angle': `${star.angle}deg`
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      {/* Rainbow Wave Effect */}
      <div className="rainbow-wave"></div>

      {/* Celebration Counters */}
      <div className="celebration-counter">
        <div className="counter-item bounce-in">✓</div>
        <div className="counter-item bounce-in bounce-delay-1">✓</div>
        <div className="counter-item bounce-in bounce-delay-2">✓</div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
