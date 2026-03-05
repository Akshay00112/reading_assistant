import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import VoiceService from '../services/VoiceService';
import api from '../services/api';
import Config from '../config';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

// Modular Components
import Header from '../components/Header';
import Status from '../components/Status';
import WordSuccessBadge from '../components/WordSuccessBadge';
import SuccessAnimation from '../components/SuccessAnimation';

const ReaderScreen = ({ navigation, route }) => {
    const { fetchHistory, addToHistory } = useAuth();

    // State
    const [allSentences, setAllSentences] = useState([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('Upload a PDF to begin');
    const [feedback, setFeedback] = useState('');
    const [wordFeedback, setWordFeedback] = useState([]);
    const [currentView, setCurrentView] = useState('upload'); // 'upload' or 'reading'
    const [sessionStats, setSessionStats] = useState({
        totalSentences: 0,
        completedSentences: 0,
        correctAttempts: 0,
        totalAttempts: 0,
    });
    const [lastAttemptSuccessful, setLastAttemptSuccessful] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const recordingRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Load PDF from history (if coming from Books/Progress)
    React.useEffect(() => {
        if (route.params?.pdf) {
            loadPdfFromHistory(route.params.pdf);
        }
    }, [route.params?.pdf]);

    const loadPdfFromHistory = async (pdf) => {
        setIsProcessing(true);
        setStatus('Loading content...');
        try {
            if (pdf.isOnlineBook) {
                setStatus(`Processing "${pdf.title}"...`);
                const response = await api.post('/api/online-books/process', { text_url: pdf.text_url });
                if (response.data.success) {
                    setAllSentences(response.data.sentences || []);
                    setCurrentView('reading');
                    setStatus(`"${pdf.title}" loaded!`);
                    setSessionStats({
                        totalSentences: response.data.total_sentences || 0,
                        completedSentences: 0,
                        correctAttempts: 0,
                        totalAttempts: 0,
                    });
                    if (!pdf.id) {
                        await addToHistory({ ...pdf, pdf_name: pdf.title, isOnlineBook: true });
                    }
                    await fetchHistory();
                } else {
                    setStatus(`Failed to load: ${response.data.error}`);
                }
            } else {
                const response = await api.post('/api/pdf/load-pdf', {
                    filename: pdf.pdf_path || pdf.filename || pdf.pdf_name,
                });
                if (response.data.success) {
                    setAllSentences(response.data.sentences);
                    setCurrentView('reading');
                    setStatus('Document loaded successfully!');
                    setSessionStats({
                        totalSentences: response.data.total_sentences || 0,
                        completedSentences: 0,
                        correctAttempts: 0,
                        totalAttempts: 0,
                    });
                    await fetchHistory();
                }
            }
        } catch (error) {
            console.error('Load error:', error);
            setStatus('Failed to load content');
        } finally {
            setIsProcessing(false);
        }
    };

    const WAV_OPTIONS = {
        android: {
            extension: '.wav',
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
        },
        ios: {
            extension: '.wav',
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {
            mimeType: 'audio/wav',
            bitsPerSecond: 128000,
        },
    };

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
            if (result.canceled) return;
            const file = result.assets[0];
            setIsProcessing(true);
            setStatus('Processing PDF...');
            const formData = new FormData();
            formData.append('pdf', { uri: file.uri, name: file.name, type: 'application/pdf' });
            const response = await api.post('/api/pdf/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: Config.UPLOAD_TIMEOUT,
            });
            if (response.data.success) {
                setAllSentences(response.data.sentences);
                setCurrentView('reading');
                setStatus('Document loaded successfully!');
                setSessionStats({ totalSentences: response.data.total_sentences || 0, completedSentences: 0, correctAttempts: 0, totalAttempts: 0 });
                await addToHistory({
                    pdf_name: response.data.original_filename,
                    pdf_path: response.data.filename,
                    total_pages: response.data.pages || 1,
                    total_sentences: response.data.total_sentences || 0,
                    file_size: file.size || 0,
                });
                await fetchHistory();
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus('Upload failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) return;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(WAV_OPTIONS);
            recordingRef.current = recording;
            setIsRecording(true);
            setStatus('🎤 Recording... Speak now!');
            Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])).start();
        } catch (err) { console.error(err); }
    };

    const stopRecording = async () => {
        if (!recordingRef.current) return;
        setIsRecording(false);
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            if (uri) await practiceCurrentSentence(uri);
        } catch (err) { console.error(err); }
    };

    const practiceCurrentSentence = async (audioUri) => {
        setIsProcessing(true);
        setShowConfetti(false);
        setStatus('Evaluating pronunciation...');
        try {
            const textToPractice = allSentences[currentSentenceIndex]?.text || '';
            const formData = new FormData();
            formData.append('audio', { uri: audioUri, name: 'recording.wav', type: 'audio/wav' });
            formData.append('word', textToPractice);
            const response = await api.post('/api/practice/evaluate-pronunciation', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                setWordFeedback(response.data.word_feedback || []);
                setFeedback(response.data.feedback);
                setSessionStats((prev) => ({
                    ...prev,
                    totalAttempts: prev.totalAttempts + 1,
                    correctAttempts: response.data.is_correct ? prev.correctAttempts + 1 : prev.correctAttempts,
                }));

                const hasErrors = response.data.word_feedback?.some((w) => ['mispronounced', 'missed', 'article-error'].includes(w.status));

                if (response.data.is_correct && !hasErrors) {
                    setShowConfetti(true);
                    setStatus('🎉 Perfect! All words correct!');
                    setLastAttemptSuccessful(true);
                    VoiceService.speakEncouragement('perfect');
                } else {
                    setStatus("So close! Try again! 💪");
                    VoiceService.speakEncouragement('close');
                }
            }
        } catch (error) { console.error(error); setStatus('Error with evaluation'); }
        finally { setIsProcessing(false); }
    };

    const onRetry = () => {
        setShowConfetti(false);
        if (lastAttemptSuccessful) {
            setCurrentSentenceIndex((prev) => Math.min(prev + 1, allSentences.length - 1));
            setSessionStats((prev) => ({ ...prev, completedSentences: prev.completedSentences + 1 }));
            setLastAttemptSuccessful(false);
            setStatus('Ready for next sentence');
        } else {
            setStatus('Ready to try again!');
        }
        setWordFeedback([]);
        setFeedback('');
    };

    const restartSession = () => {
        setCurrentView('upload');
        setAllSentences([]);
        setWordFeedback([]);
        setFeedback('');
        setLastAttemptSuccessful(false);
        setStatus('Upload a PDF to begin');
    };

    const currentSentence = allSentences[currentSentenceIndex];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient colors={[Colors.bgDark, '#0f172a', '#1e1b4b']} style={styles.gradient}>

                <SuccessAnimation
                    show={showConfetti}
                    onComplete={() => setShowConfetti(false)}
                    message="Fantastic Reading!"
                />

                <Header
                    title={currentView === 'upload' ? 'Upload' : `Sentence ${currentSentenceIndex + 1}/${allSentences.length}`}
                    showBack={true}
                    onBack={currentView === 'upload' ? () => navigation.goBack() : restartSession}
                />

                {currentView === 'upload' ? (
                    <View style={styles.uploadContent}>
                        <TouchableOpacity style={styles.uploadCard} onPress={handleFileUpload} disabled={isProcessing} activeOpacity={0.8}>
                            {isProcessing ? (
                                <View style={styles.uploadCardInner}>
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                    <Text style={styles.uploadCardText}>{status}</Text>
                                </View>
                            ) : (
                                <View style={styles.uploadCardInner}>
                                    <Text style={styles.uploadIcon}>📄</Text>
                                    <Text style={styles.uploadCardTitle}>Tap to Upload PDF</Text>
                                    <Text style={styles.uploadCardText}>Improve your reading with AI feedback</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.readingContent} showsVerticalScrollIndicator={false}>
                        <Status status={status} feedback={feedback} />

                        <View style={styles.sentenceCard}>
                            <Text style={styles.sentenceLabel}>Read this sentence:</Text>
                            {wordFeedback.length > 0 ? (
                                <View style={styles.wordRow}>
                                    {wordFeedback.map((word, index) => (
                                        <WordSuccessBadge key={index} word={word.word} status={word.status} />
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.sentenceText}>{currentSentence?.text}</Text>
                            )}
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.listenButton} onPress={() => VoiceService.speak(currentSentence?.text)} activeOpacity={0.8}>
                                <Text style={styles.listenButtonText}>🔊 Listen</Text>
                            </TouchableOpacity>

                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <TouchableOpacity style={[styles.recordButton, isRecording && styles.recordButtonActive]} onPress={isRecording ? stopRecording : startRecording} disabled={isProcessing} activeOpacity={0.8}>
                                    <LinearGradient colors={isRecording ? ['#ef4444', '#dc2626'] : [Colors.primary, Colors.accent]} style={styles.recordButtonGradient}>
                                        {isProcessing ? <ActivityIndicator size="large" color={Colors.textWhite} /> : (
                                            <><Text style={styles.recordIcon}>{isRecording ? '⏹' : '🎤'}</Text>
                                                <Text style={styles.recordText}>{isRecording ? 'Stop' : 'Start Reading'}</Text></>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>

                            <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
                                <Text style={styles.retryButtonText}>{lastAttemptSuccessful ? '➡️ Next' : '🔄 Retry'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.statsCard}>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}><Text style={styles.statValue}>{sessionStats.correctAttempts}</Text><Text style={styles.statLabel}>Success</Text></View>
                                <View style={styles.statItem}><Text style={styles.statValue}>{sessionStats.totalAttempts}</Text><Text style={styles.statLabel}>Attempts</Text></View>
                                <View style={styles.statItem}><Text style={styles.statValue}>{Math.round((sessionStats.correctAttempts / (sessionStats.totalAttempts || 1)) * 100)}%</Text><Text style={styles.statLabel}>Accuracy</Text></View>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    uploadContent: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl },
    uploadCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xxxl, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dotted', ...Shadows.card },
    uploadCardInner: { alignItems: 'center' },
    uploadIcon: { fontSize: 64, marginBottom: Spacing.lg },
    uploadCardTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textWhite, marginBottom: Spacing.sm },
    uploadCardText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center' },
    readingContent: { paddingBottom: Spacing.huge },
    sentenceCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xxl, marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
    sentenceLabel: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginBottom: Spacing.lg, fontWeight: '700', textTransform: 'uppercase' },
    sentenceText: { color: Colors.textWhite, fontSize: FontSizes.xl, lineHeight: 32 },
    wordRow: { flexDirection: 'row', flexWrap: 'wrap' },
    actionButtons: { paddingHorizontal: Spacing.xl, gap: Spacing.lg, marginBottom: Spacing.xxl },
    listenButton: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    listenButtonText: { color: Colors.blueLight, fontSize: FontSizes.md, fontWeight: '600' },
    recordButton: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.glow },
    recordButtonGradient: { paddingVertical: Spacing.xl, alignItems: 'center' },
    recordIcon: { fontSize: 40, marginBottom: Spacing.xs },
    recordText: { color: Colors.textWhite, fontSize: FontSizes.lg, fontWeight: '700' },
    retryButton: { backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' },
    retryButtonText: { color: Colors.accentLight, fontSize: FontSizes.md, fontWeight: '600' },
    statsCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginHorizontal: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { color: Colors.textWhite, fontSize: FontSizes.xl, fontWeight: '800' },
    statLabel: { color: Colors.textSecondary, fontSize: 10, textTransform: 'uppercase' },
});

export default ReaderScreen;
