// frontend/src/components/PronunciationAnalyzer.jsx
/**
 * Pronunciation Analyzer Component
 * Displays detailed mispronunciation feedback and provides correction guidance
 */

import React, { useState, useEffect } from 'react';
import './PronunciationAnalyzer.css';

const PronunciationAnalyzer = ({ correctText, spokenText, onAnalysisComplete }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedError, setSelectedError] = useState(null);

    // Analyze pronunciation on component mount or when texts change
    useEffect(() => {
        if (correctText && spokenText) {
            analyzePronunciation();
        }
    }, [correctText, spokenText]);

    const analyzePronunciation = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/pronunciation/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correct_text: correctText,
                    spoken_text: spokenText
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAnalysis(data.analysis);
            
            if (onAnalysisComplete) {
                onAnalysisComplete(data.analysis);
            }
        } catch (err) {
            setError(err.message);
            console.error('Pronunciation analysis failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 0.95) return '#4CAF50'; // Green
        if (accuracy >= 0.85) return '#8BC34A'; // Light green
        if (accuracy >= 0.75) return '#FFC107'; // Amber
        if (accuracy >= 0.60) return '#FF9800'; // Orange
        return '#F44336'; // Red
    };

    const getErrorTypeIcon = (errorType) => {
        const icons = {
            'vowel_substitution': '🔤',
            'consonant_substitution': '🔤',
            'consonant_cluster': '🔤',
            'silent_letter': '🤐',
            'stress_rhythm': '🎵',
            'skipped_word': '⏭️',
            'significant_difference': '❌'
        };
        return icons[errorType] || '❓';
    };

    const getErrorSeverity = (errorType) => {
        const severities = {
            'skipped_word': 'critical',
            'significant_difference': 'high',
            'consonant_cluster': 'high',
            'vowel_substitution': 'medium',
            'consonant_substitution': 'medium',
            'silent_letter': 'low',
            'stress_rhythm': 'low'
        };
        return severities[errorType] || 'medium';
    };

    if (loading) {
        return (
            <div className="pronunciation-analyzer loading">
                <div className="spinner"></div>
                <p>Analyzing pronunciation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pronunciation-analyzer error">
                <div className="error-message">
                    <h3>⚠️ Analysis Error</h3>
                    <p>{error}</p>
                    <button onClick={analyzePronunciation} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return <div className="pronunciation-analyzer"></div>;
    }

    const accuracyPercent = (analysis.overall_accuracy * 100).toFixed(1);
    const phoneticPercent = (analysis.phonetic_accuracy * 100).toFixed(1);
    const errorCount = analysis.mispronunciations.length;

    return (
        <div className="pronunciation-analyzer">
            {/* Header with Score */}
            <div className="analyzer-header">
                <div className="accuracy-display">
                    <div 
                        className="accuracy-circle" 
                        style={{ 
                            borderColor: getAccuracyColor(analysis.overall_accuracy),
                            color: getAccuracyColor(analysis.overall_accuracy)
                        }}
                    >
                        <span className="accuracy-value">{accuracyPercent}%</span>
                        <span className="accuracy-label">Accuracy</span>
                    </div>
                    <div className="metrics">
                        <div className="metric">
                            <span className="label">Phonetic Accuracy:</span>
                            <span className="value">{phoneticPercent}%</span>
                        </div>
                        <div className="metric">
                            <span className="label">Errors Found:</span>
                            <span className="value">{errorCount}</span>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`status-badge ${analysis.is_acceptable ? 'acceptable' : 'needs-work'}`}>
                    {analysis.is_acceptable ? '✅ Acceptable' : '📝 Needs Work'}
                </div>
            </div>

            {/* Feedback Text */}
            <div className="feedback-section">
                <p className="detailed-feedback">{analysis.detailed_feedback}</p>
            </div>

            {/* Text Comparison */}
            <div className="text-comparison">
                <div className="comparison-column">
                    <h4>Expected Reading</h4>
                    <p className="text-correct">{analysis.correct_text}</p>
                </div>
                <div className="comparison-column">
                    <h4>Your Reading</h4>
                    <p className="text-spoken">{analysis.spoken_text}</p>
                </div>
            </div>

            {/* Errors Section */}
            {errorCount > 0 && (
                <div className="errors-section">
                    <h3 className="section-title">
                        🔴 {errorCount} Pronunciation Error{errorCount !== 1 ? 's' : ''} Found
                    </h3>

                    <div className="errors-list">
                        {analysis.mispronunciations.map((error, index) => (
                            <div 
                                key={index}
                                className={`error-item severity-${getErrorSeverity(error.error_type)} ${selectedError === index ? 'expanded' : ''}`}
                                onClick={() => setSelectedError(selectedError === index ? null : index)}
                            >
                                <div className="error-header">
                                    <span className="error-icon">{getErrorTypeIcon(error.error_type)}</span>
                                    
                                    <div className="error-main">
                                        <div className="error-words">
                                            <span className="word-correct">{error.correct_word}</span>
                                            <span className="arrow">→</span>
                                            <span className="word-spoken">{error.spoken_word}</span>
                                        </div>
                                        <div className="error-type-badge">
                                            {error.error_type.replace(/_/g, ' ').toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="error-confidence">
                                        <span className="confidence-label">Confidence:</span>
                                        <span className="confidence-value">{(error.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {selectedError === index && (
                                    <div className="error-details">
                                        <div className="detail-section">
                                            <h5>Why This Error?</h5>
                                            <p>{error.explanation}</p>
                                        </div>

                                        <div className="detail-section">
                                            <h5>💡 How to Fix It</h5>
                                            <p className="practice-tip">{error.practice_tip}</p>
                                        </div>

                                        <div className="detail-section">
                                            <h5>🎯 Correct Pronunciation</h5>
                                            <p className="correction">{error.correction}</p>
                                        </div>

                                        <button 
                                            className="practice-btn"
                                            onClick={(e) => handlePracticeWord(e, error.correct_word)}
                                        >
                                            📢 Hear Correct Pronunciation
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Improvement Areas */}
            {analysis.needs_improvement.length > 0 && (
                <div className="improvement-section">
                    <h3 className="section-title">📚 Areas for Improvement</h3>
                    <div className="improvement-areas">
                        {analysis.needs_improvement.map((area, index) => (
                            <div key={index} className="improvement-badge">
                                {area}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="recommendations-section">
                <h3 className="section-title">✨ Recommendations</h3>
                <div className="recommendations-list">
                    {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                            <span className="rec-number">{index + 1}</span>
                            <p>{rec}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Word Analysis */}
            <div className="word-analysis-section">
                <h3 className="section-title">📊 Word-by-Word Analysis</h3>
                <div className="word-list">
                    {analysis.word_analysis.map((word, index) => (
                        <div 
                            key={index} 
                            className={`word-item match-${word.match_type}`}
                            title={`Confidence: ${(word.confidence * 100).toFixed(0)}%`}
                        >
                            <span className="word-status">
                                {word.match_type === 'correct' ? '✅' : '❌'}
                            </span>
                            <span className="word-text">
                                {word.correct_word || word.spoken_word}
                            </span>
                            {word.match_type !== 'correct' && (
                                <span className="confidence-bar">
                                    <span 
                                        className="confidence-fill"
                                        style={{ width: `${word.confidence * 100}%` }}
                                    ></span>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    🔄 Try Again
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedError(null)}>
                    ↺ Collapse All
                </button>
            </div>
        </div>
    );

    async function handlePracticeWord(e, word) {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/pronunciation/get-pronunciation-guide/${word}`);
            const data = await response.json();
            
            if (data.success) {
                // Optionally, play audio or show guide
                alert(`Pronunciation of "${word}":\n${data.pronunciation_guide}`);
            }
        } catch (err) {
            console.error('Failed to get pronunciation guide:', err);
        }
    }
};

export default PronunciationAnalyzer;
