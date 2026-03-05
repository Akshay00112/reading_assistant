/**
 * Word Success Badge Component
 * Shows a quick celebration for correct words during practice
 */

import React, { useState, useEffect } from 'react';
import './WordSuccessBadge.css';

const WordSuccessBadge = ({ show, word = '', onHide, type = 'correct' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  const messages = {
    correct: { emoji: '✅', text: 'Perfect!' },
    excellent: { emoji: '⭐', text: 'Excellent!' },
    close: { emoji: '👏', text: 'Close!' },
  };

  const msg = messages[type] || messages.correct;

  return (
    <div className={`word-success-badge badge-${type}`}>
      <div className="badge-content">
        <span className="badge-emoji">{msg.emoji}</span>
        <span className="badge-text">{msg.text}</span>
      </div>
      <div className="badge-glow"></div>
    </div>
  );
};

export default WordSuccessBadge;
