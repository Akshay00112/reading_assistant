import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ProgressTracking = () => {
    const { user, pdfHistory, fetchHistory, cleanupDuplicates } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cleaning, setCleaning] = useState(false);
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalPages: 0,
        avgAccuracy: 0,
        completedBooks: 0
    });

    useEffect(() => {
        const loadProgress = async () => {
            setLoading(true);
            // Fetch the latest history data
            await fetchHistory();
            setLoading(false);
        };
        loadProgress();
    }, []);

    // Update stats whenever pdfHistory changes
    useEffect(() => {
        if (pdfHistory && pdfHistory.length > 0) {
            const total = pdfHistory.length;
            const completed = pdfHistory.filter(h => h.status === 'completed').length;
            const totalPages = pdfHistory.reduce((acc, curr) => acc + (curr.total_pages || 0), 0);

            setStats({
                totalBooks: total,
                totalPages: totalPages,
                avgAccuracy: 85, // Mock value
                completedBooks: completed
            });
        } else {
            setStats({
                totalBooks: 0,
                totalPages: 0,
                avgAccuracy: 0,
                completedBooks: 0
            });
        }
    }, [pdfHistory]);

    const formatDate = (isoString) => {
        if (!isoString) return 'Never';
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleContinueReading = (item) => {
        // Navigate to the reader with the PDF data
        navigate('/reader', { state: { pdf: item } });
    };

    // Feedback message for cleanup
    const [cleanupMsg, setCleanupMsg] = useState("");

    const handleCleanupDuplicates = async () => {
        setCleaning(true);
        setCleanupMsg("");
        const deleted = await cleanupDuplicates();
        if (deleted > 0) {
            setCleanupMsg(`✅ Removed ${deleted} duplicate entr${deleted === 1 ? 'y' : 'ies'}.`);
        } else {
            setCleanupMsg("No duplicates found.");
        }
        setCleaning(false);
    };

    return (
        <div className="App" style={{ backgroundColor: '#020617', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        ← Back
                    </button>
                    <div style={{ textAlign: 'right' }}>
                        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '5px' }}>Progress Tracking</h1>
                        <p style={{ color: '#94a3b8' }}>Tracking your journey to reading mastery</p>
                        <button
                            onClick={handleCleanupDuplicates}
                            disabled={cleaning}
                            style={{
                                marginTop: '10px',
                                background: cleaning ? 'rgba(59,130,246,0.2)' : 'linear-gradient(90deg,#3b82f6,#8b5cf6)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 18px',
                                fontWeight: '500',
                                cursor: cleaning ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cleaning ? 'Cleaning...' : '🧹 Cleanup Duplicates'}
                        </button>
                        {cleanupMsg && (
                            <div style={{ color: '#10b981', marginTop: '8px', fontSize: '1rem', fontWeight: '500' }}>{cleanupMsg}</div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#fff', marginTop: '100px' }}>Loading your statistics...</div>
                ) : (
                    <div className="fade-in">
                        {/* Summary Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div className="glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid #334155', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📚</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{stats.totalBooks}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Books Started</div>
                            </div>
                            <div className="glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid #334155', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{stats.totalPages}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Pages</div>
                            </div>
                            <div className="glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid #334155', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎯</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{stats.avgAccuracy}%</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Avg. Accuracy</div>
                            </div>
                            <div className="glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid #334155', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{stats.completedBooks}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Books Finished</div>
                            </div>
                        </div>

                        {/* Recent Activity Table */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '20px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #1e293b' }}>
                            <h2 style={{ color: '#fff', marginBottom: '25px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🕒</span> Reading History
                            </h2>
                            {pdfHistory.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                  <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '10px' }}>No reading history found yet.</p>
                                  <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                    💡 <strong>Tip:</strong> Upload a PDF from your dashboard to start practicing! Your uploaded books will be saved here and you can continue reading them anytime you log in.
                                  </p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                                                <th style={{ padding: '15px' }}>Document</th>
                                                <th style={{ padding: '15px' }}>Progress</th>
                                                <th style={{ padding: '15px' }}>Last Activity</th>
                                                <th style={{ padding: '15px' }}>Status</th>
                                                <th style={{ padding: '15px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pdfHistory.map((item) => {
                                                const progressPercent = item.total_pages > 0
                                                    ? Math.round((item.last_page / item.total_pages) * 100)
                                                    : 0;

                                                return (
                                                    <tr key={item.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} className="table-row-hover">
                                                        <td style={{ padding: '15px' }}>
                                                            <div style={{ fontWeight: '500', color: '#fff' }}>{item.pdf_name || 'Untitled Document'}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.isOnlineBook ? 'Online Library' : 'Uploaded PDF'}</div>
                                                        </td>
                                                        <td style={{ padding: '15px', minWidth: '200px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ flex: 1, height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                                                                    <div style={{
                                                                        width: `${progressPercent}%`,
                                                                        height: '100%',
                                                                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                                                        transition: 'width 0.5s ease-out'
                                                                    }}></div>
                                                                </div>
                                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{progressPercent}%</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '5px' }}>
                                                                Page {item.last_page} of {item.total_pages || '?'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                                            {formatDate(item.updated_at)}
                                                        </td>
                                                        <td style={{ padding: '15px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                                color: item.status === 'completed' ? '#10b981' : '#3b82f6',
                                                                border: item.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
                                                            }}>
                                                                {item.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '15px' }}>
                                                            {item.status !== 'completed' && (
                                                                <button
                                                                    onClick={() => handleContinueReading(item)}
                                                                    style={{
                                                                        padding: '6px 16px',
                                                                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                                                        color: '#fff',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.85rem',
                                                                        fontWeight: '500',
                                                                        transition: 'all 0.3s',
                                                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.transform = 'translateY(-2px)';
                                                                        e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.transform = 'translateY(0)';
                                                                        e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                                                    }}
                                                                >
                                                                    Continue Reading →
                                                                </button>
                                                            )}
                                                            {item.status === 'completed' && (
                                                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>✓ Finished</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .table-row-hover:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProgressTracking;
