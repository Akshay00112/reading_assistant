/**
 * Progress Milestone Component
 * Celebrates when child reaches practice milestones (every 5 sentences, etc.)
 */

import React, { useState, useEffect } from 'react';
import './ProgressMilestone.css';

const ProgressMilestone = ({ 
  show, 
  milestone = 5,
  correctCount = 0,
  totalCount = 0,
  onComplete 
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate burst particles
      const particleEmojis = ['🏆', '⭐', '🎯', '💎', '👑', '🌈'];
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: particleEmojis[i % particleEmojis.length],
        angle: (i * 360) / 20
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  const accuracyPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="progress-milestone-container">
      {/* Medal/Trophy Background */}
      <div className="milestone-badge">
        <div className="trophy-glow"></div>
        
        <div className="trophy-icon">🏆</div>
        
        <div className="milestone-content">
          <h1 className="milestone-title">Milestone Reached!</h1>
          <p className="milestone-subtitle">{milestone} Sentences Completed!</p>
          
          <div className="accuracy-display">
            <div className="accuracy-circle">
              <svg viewBox="0 0 100 100" className="accuracy-ring">
                <circle cx="50" cy="50" r="45" className="ring-background"></circle>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  className="ring-progress"
                  style={{'--percentage': accuracyPercentage}}
                ></circle>
              </svg>
              <div className="accuracy-text">
                <span className="accuracy-number">{accuracyPercentage}%</span>
                <span className="accuracy-label">Accuracy</span>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-icon">✓</span>
              <span className="stat-value">{correctCount}</span> Correct
            </div>
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <span className="stat-value">{totalCount}</span> Total
            </div>
          </div>

          <p className="congratulations-message">
            🌟 Keep up the amazing work! You're doing fantastic! 🌟
          </p>
        </div>
      </div>

      {/* Burst Particles */}
      <div className="milestone-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="milestone-particle"
            style={{
              '--angle': `${particle.angle}deg`
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>

      {/* Confetti popper */}
      <div className="milestone-confetti-popper"></div>
    </div>
  );
};

export default ProgressMilestone;
