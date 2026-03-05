import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Dashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="App" style={{ backgroundColor: '#020617', minHeight: '100vh' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                    }}
                >
                    ← Back
                </button>
            </div>
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#e5e7eb', fontWeight: '500' }}>{user?.name || 'User'}</span>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '40px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '10px' }}>
                        📚 Reading Assistant
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.2rem' }}>
                        Welcome back! What would you like to do?
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '30px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {/* Online Library Card */}
                    <div
                        className="glass fade-in"
                        style={{
                            padding: '40px',
                            borderRadius: '16px',
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid #334155',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}
                        onClick={() => navigate('/books')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.borderColor = '#60a5fa';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#334155';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌐</div>
                        <h2 style={{ margin: '0 0 15px 0', color: '#e5e7eb', fontSize: '1.8rem' }}>
                            Online Library
                        </h2>
                        <p style={{ margin: '0', color: '#a0aec0', fontSize: '1rem', lineHeight: '1.6' }}>
                            Explore our collection of curated books and stories to practice reading
                        </p>
                    </div>

                    {/* Upload PDF Card */}
                    <div
                        className="glass fade-in"
                        style={{
                            padding: '40px',
                            borderRadius: '16px',
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid #334155',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}
                        onClick={() => navigate('/reader')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(139, 92, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#334155';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📂</div>
                        <h2 style={{ margin: '0 0 15px 0', color: '#e5e7eb', fontSize: '1.8rem' }}>
                            Uploaded PDF
                        </h2>
                        <p style={{ margin: '0', color: '#a0aec0', fontSize: '1rem', lineHeight: '1.6' }}>
                            Select from your previously uploaded documents and practice reading
                        </p>
                    </div>
                </div>

                {/* Progress Tracking Card (Below the others) */}
                <div style={{ maxWidth: '1200px', margin: '30px auto 0 auto' }}>
                    <div
                        className="glass fade-in"
                        style={{
                            padding: '40px',
                            borderRadius: '16px',
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid #334155',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '40px',
                            textAlign: 'left'
                        }}
                        onClick={() => navigate('/progress')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.borderColor = '#ec4899';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(236, 72, 153, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#334155';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '4.5rem' }}>📊</div>
                        <div>
                            <h2 style={{ margin: '0 0 10px 0', color: '#e5e7eb', fontSize: '2rem' }}>
                                Track Progress
                            </h2>
                            <p style={{ margin: '0', color: '#a0aec0', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                View detailed statistics, reading history, and monitor your improvement journey
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
