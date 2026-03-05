import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import './App.css';
import Header from './components/Header';
import PdfUpload from './components/PdfUpload';
import DocumentReader from './components/DocumentReader';
import Status from './components/Status';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import ReadBooks from './components/ReadBooks';
import LandingPage from './components/LandingPage';
import ProgressTracking from './components/ProgressTracking';
import SuccessAnimation from './components/SuccessAnimation';
import About from './components/About';
import Support from './components/Support';
import Contact from './components/Contact';
import Pricing from './components/Pricing';
import VoiceService from './services/VoiceService';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/signin" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>Loading...</div>;
  }

  const isAdmin = user?.email === 'admin@gmail.com';
  return isAdmin ? children : <Navigate to="/" />;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" /> : <LandingPage />;
};

function ReadingAssistant() {
  const { logout, user, fetchHistory, addToHistory } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [allSentences, setAllSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [status, setStatus] = useState('Upload a PDF to begin');
  const [feedback, setFeedback] = useState('');
  const [wordFeedback, setWordFeedback] = useState([]);
  const [practiceResult, setPracticeResult] = useState(null);
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'dashboard', 'reading'
  const [readingSpeed, setReadingSpeed] = useState(120);
  const [sessionStats, setSessionStats] = useState({
    totalSentences: 0,
    completedSentences: 0,
    correctAttempts: 0,
    totalAttempts: 0,
  });
  const [isOnlineBook, setIsOnlineBook] = useState(false);
  const [textUrl, setTextUrl] = useState(null);
  const [currentSentenceText, setCurrentSentenceText] = useState(''); // Store current sentence text
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationType, setSuccessAnimationType] = useState('word'); // 'word' or 'sentence'
  const [successMessage, setSuccessMessage] = useState('Perfect!');
  const [lastAttemptSuccessful, setLastAttemptSuccessful] = useState(false); // Track if last attempt was perfect

  // Handle pre-loaded PDFs from history
  useEffect(() => {
    if (location.state?.pdf) {
      const pdf = location.state.pdf;
      console.log('[PDF] Loading from history:', pdf);
      loadPdfFromHistory(pdf);
    }
  }, [location.state?.pdf]);

  const loadPdfFromHistory = async (pdf) => {
    setIsProcessing(true);
    setStatus('Loading content...');
    try {
      // Check if this is an online book
      if (pdf.isOnlineBook) {
        // For online books, fetch and process the text from the URL
        setIsOnlineBook(true);
        setTextUrl(pdf.text_url);
        setPdfUrl(null);
        setStatus(`Processing "${pdf.title}"...`);
        
        try {
          const processResponse = await axios.post('/api/online-books/process', {
            text_url: pdf.text_url
          }, {
            withCredentials: true
          });

          if (processResponse.data.success) {
            setAllSentences(processResponse.data.sentences || []);
            setCurrentView('reading');
            setStatus(`"${pdf.title}" loaded successfully!`);
            setSessionStats({
              totalSentences: processResponse.data.total_sentences || 0,
              completedSentences: 0,
              correctAttempts: 0,
              totalAttempts: 0
            });
            
            // Save online book to history if it doesn't already have an ID (new reading)
            if (!pdf.id || !pdf.pdf_name) {
              const historyData = {
                pdf_name: pdf.title,
                pdf_path: `online_${pdf.id}`,
                total_pages: Math.ceil((processResponse.data.total_sentences || 0) / 15), // Estimate pages
                total_sentences: processResponse.data.total_sentences || 0,
                file_size: 0,
                isOnlineBook: true,
                text_url: pdf.text_url,
                author: pdf.author || 'Unknown',
                source: pdf.source || 'Project Gutenberg'
              };
              await addToHistory(historyData);
            }
            
            // Fetch history to update
            await fetchHistory();
          } else {
            setStatus(`Failed to load: ${processResponse.data.error || 'Unknown error'}`);
          }
        } catch (processError) {
          console.error('Online book processing error:', processError);
          setStatus(`Failed to process online book: ${processError.response?.data?.error || processError.message}`);
        }
      } else {
        // For uploaded PDFs, use the existing process
        const response = await axios.post('/api/pdf/load-pdf', {
          filename: pdf.pdf_path || pdf.filename || pdf.pdf_name
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          setIsOnlineBook(false);
          setAllSentences(response.data.sentences);
          setPdfUrl(response.data.pdf_url);
          setCurrentView('reading');
          setStatus('Document loaded successfully!');
          setSessionStats({
            totalSentences: response.data.total_sentences,
            completedSentences: 0,
            correctAttempts: 0,
            totalAttempts: 0
          });
          // Fetch history to update
          await fetchHistory();
        }
      }
    } catch (error) {
      console.error('Load error:', error);
      setStatus(`Failed to load content: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setStatus('Processing PDF...');
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post('/api/pdf/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (response.data.success) {
        setAllSentences(response.data.sentences);
        setPdfUrl(response.data.pdf_url);
        setCurrentView('reading');
        setStatus('Document loaded successfully!');
        
        // Save the uploaded PDF to history database for persistence
        const historyData = {
          pdf_name: response.data.original_filename,
          pdf_path: response.data.filename,
          total_pages: response.data.pages || 1,
          total_sentences: response.data.total_sentences || 0,
          file_size: file.size
        };
        
        await addToHistory(historyData);
        
        // Fetch history to update the progress tracking page
        await fetchHistory();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Upload failed: ${error.response?.data?.error || error.message} `);
    } finally {
      setIsProcessing(false);
    }
  };

  const readCurrentSentence = async () => {
    if (isProcessing || !allSentences[currentSentenceIndex]) return;
    setIsReading(!isReading);
    if (!isReading) {
      setStatus('Listening to sentence...');
    } else {
      setStatus('Stopped listening.');
    }
  };

  // Collection of success sounds
  const playSuccessSound = (soundType = 'default') => {
    const sounds = {
      word: 'https://assets.mixkit.co/active_storage/sfx/3222/3222-preview.mp3', // Clapping sound
      sentence: 'https://assets.mixkit.co/active_storage/sfx/3222/3222-preview.mp3', // Clapping sound
      clapping: 'https://assets.mixkit.co/active_storage/sfx/3222/3222-preview.mp3', // Clapping sound
      default: 'https://assets.mixkit.co/active_storage/sfx/3222/3222-preview.mp3' // Clapping sound
    };
    const audioUrl = sounds[soundType] || sounds.default;
    const audio = new Audio(audioUrl);
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Audio play failed", e));
  };

  const triggerConfetti = (intensity = 'normal') => {
    const configs = {
      word: {
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      },
      sentence: {
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#fbbf24', '#10b981']
      }
    };
    const config = configs[intensity] || configs.word;
    confetti(config);
  };

  const triggerEnhancedSuccess = (type = 'word', message = 'Perfect!') => {
    setSuccessAnimationType(type);
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    playSuccessSound(type);
    triggerConfetti(type);
    
    // Add voice encouragement - plays simultaneously with animation
    if (type === 'sentence') {
      VoiceService.speakEncouragement('perfect');
    } else {
      VoiceService.speakEncouragement('great');
    }
  };

  const practiceCurrentSentence = async (audioBlob) => {
    setIsProcessing(true);
    setShowSuccessAnimation(false); // Hide animation when user starts practicing
    setStatus('Evaluating pronunciation...');
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // Use currentSentenceText if available (for online books), otherwise use from allSentences
      const textToPractice = currentSentenceText ||
        allSentences[currentSentenceIndex]?.text ||
        '';

      if (!textToPractice) {
        setStatus('No sentence text available');
        setIsProcessing(false);
        return;
      }

      formData.append('word', textToPractice); // The backend uses 'word' key for the full text

      const response = await axios.post('/api/practice/evaluate-pronunciation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (response.data.success) {
        setPracticeResult(response.data);
        setWordFeedback(response.data.word_feedback || []);
        setFeedback(response.data.feedback);

        setSessionStats(prev => ({
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          correctAttempts: response.data.is_correct ? prev.correctAttempts + 1 : prev.correctAttempts
        }));

        // Check for word-level errors - STRICT enforcement
        const hasWordErrors = response.data.word_feedback?.some(w => 
          ['mispronounced', 'missed', 'article-error'].includes(w.status)
        );

        if (response.data.is_correct && !hasWordErrors) {
          // ALL words are correct - advance to next sentence
          triggerEnhancedSuccess('sentence', 'Amazing! Perfect Pronunciation! 🌟');
          setStatus('🎉 Fantastic! All words pronounced perfectly! Click Try Again for next sentence.');
          setLastAttemptSuccessful(true);
          
          // Animation stays on screen - will be hidden when user clicks Try Again or practices next sentence
          // Prepare data for next sentence but don't move yet
          setPracticeResult(null);
          setWordFeedback([]);
          setFeedback('');
        } else {
          // Any word errors or overall incorrect - stay on same sentence
          setStatus('Try again, you\'re so close! 💪 Focus on the words marked as different.');
          // NO success animation for mispronunciations - only encouraging text and voice feedback
          
          // Extract and read mispronounced words to user
          const mispronounceWords = response.data.word_feedback
            ?.filter(w => w.status === 'mispronounced')
            .map(w => w.word)
            .join(', ');
          
          const missedWords = response.data.word_feedback
            ?.filter(w => w.status === 'missed')
            .map(w => w.word)
            .join(', ');
          
          const articleErrors = response.data.word_feedback
            ?.filter(w => w.status === 'article-error')
            .map(w => w.word)
            .join(', ');
          
          // Immediate voice feedback for specific errors
          if (mispronounceWords) {
            VoiceService.speak('OOPS! Try again!', {
              pitch: 1.25,
              rate: 0.9,
              volume: 0.9
            });
          }
          
          if (missedWords) {
            VoiceService.speak('OOPS! You missed a word!', {
              pitch: 1.25,
              rate: 0.9,
              volume: 0.9
            });
          }
          
          if (articleErrors) {
            VoiceService.speak('OOPS! Check the articles!', {
              pitch: 1.25,
              rate: 0.9,
              volume: 0.9
            });
          }
          
          // Delay voice feedback to avoid overlap with animation sounds
          setTimeout(() => {
            const feedbackParts = [];
            
            if (mispronounceWords) {
              feedbackParts.push(`Let's focus on: ${mispronounceWords}`);
            }
            if (missedWords) {
              feedbackParts.push(`Don't skip: ${missedWords}`);
            }
            if (articleErrors) {
              feedbackParts.push(`Check articles in: ${articleErrors}`);
            }
            
            if (feedbackParts.length > 0) {
              VoiceService.speak(feedbackParts.join('. '), {
                pitch: 1.25,
                rate: 0.85,
                volume: 0.9
              });
            }
          }, 800);
          
          // Add voice encouragement for mispronunciation
          VoiceService.speakEncouragement('close');
        }
      }
    } catch (error) {
      console.error("Practice error:", error);
      setStatus('Practice encountered an error');
    } finally {
      setIsProcessing(false);
    }
  };

  const jumpToSentence = (index) => {
    setShowSuccessAnimation(false); // Hide animation when jumping to another sentence
    setCurrentSentenceIndex(index);
    setPracticeResult(null);
    setWordFeedback([]);
    setFeedback('');
    setStatus(`Listening to sentence ${index + 1} `);
  };

  const onRetry = () => {
    // Hide success animation when user clicks "Try Again"
    setShowSuccessAnimation(false);
    
    // If last attempt was successful, move to next sentence
    if (lastAttemptSuccessful) {
      setCurrentSentenceIndex(prev => prev + 1);
      setSessionStats(prev => ({
        ...prev,
        completedSentences: prev.completedSentences + 1
      }));
      setLastAttemptSuccessful(false);
      setStatus('Ready for next sentence');
    } else {
      // Otherwise, retry the same sentence
      setStatus('Ready to try again. Speak clearly!');
      // Add encouraging voice feedback
      VoiceService.speakEncouragement('close');
    }
    
    // Clear the practice result
    setPracticeResult(null);
    setWordFeedback([]);
    setFeedback('');
  };

  const restartSession = () => {
    setShowSuccessAnimation(false); // Hide animation when restarting session
    setCurrentSentenceIndex(0);
    setCurrentView('upload');
    setPdfFile(null);
    setPdfUrl(null);
    setAllSentences([]);
    setSessionStats({
      totalSentences: 0,
      completedSentences: 0,
      correctAttempts: 0,
      totalAttempts: 0
    });
  };

  return (
    <div className="App">
      {/* Success Animation Overlay */}
      <SuccessAnimation 
        show={showSuccessAnimation}
        type={successAnimationType}
        message={successMessage}
        onComplete={() => setShowSuccessAnimation(false)}
      />
      
      <div className="auth-header-info" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000 }}>
        <span className="user-name-display" style={{ color: '#fff', fontWeight: '500' }}>{user?.name}</span>
        <button onClick={handleLogout} className="logout-btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s' }}>Logout</button>
      </div>
      <Header />

      {currentView === 'reading' ? (
        <DocumentReader
          sentences={allSentences}
          currentIndex={currentSentenceIndex}
          onJumpTo={jumpToSentence}
          onRetry={onRetry}
          onRestart={restartSession}
          pdfUrl={pdfUrl}
          currentPdfName={isOnlineBook ? 'Online Book' : 'PDF'}
          stats={sessionStats}
          isReading={isReading}
          readingSpeed={readingSpeed}
          onReadAloud={readCurrentSentence}
          onPractice={practiceCurrentSentence}
          onSpeedChange={setReadingSpeed}
          isProcessing={isProcessing}
          practiceResult={practiceResult}
          isOnlineBook={isOnlineBook}
          textUrl={textUrl}
          onSentenceChange={setCurrentSentenceText}
        />
      ) : (
        <div className="container">
          <h1 className="gradient-text">Dyslexia Assistant</h1>
          <h2 className="text-secondary">Improve your reading with AI feedback</h2>

          {currentView === 'upload' && (
            <div className="fade-in">
              <PdfUpload onPdfUpload={handleFileUpload} isUploading={isProcessing} />
            </div>
          )}
        </div>
      )}

      {currentView === 'reading' && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 2001 }}>
          <Status status={status} feedback={feedback} />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/upload" element={
            <PrivateRoute>
              <ReadingAssistant />
            </PrivateRoute>
          } />
          <Route path="/books" element={
            <PrivateRoute>
              <ReadBooks />
            </PrivateRoute>
          } />
          <Route path="/progress" element={
            <PrivateRoute>
              <ProgressTracking />
            </PrivateRoute>
          } />
          <Route path="/reader" element={
            <PrivateRoute>
              <ReadingAssistant />
            </PrivateRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
