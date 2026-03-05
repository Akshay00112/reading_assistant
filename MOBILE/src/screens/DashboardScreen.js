import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const DashboardScreen = ({ navigation }) => {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const cards = [
        {
            icon: '🌐',
            title: 'Online Library',
            description: 'Explore our collection of curated books and stories to practice reading',
            screen: 'Books',
            borderColor: Colors.borderBlue,
            shadowColor: '#3b82f6',
        },
        {
            icon: '📂',
            title: 'Upload PDF',
            description: 'Select from your previously uploaded documents and practice reading',
            screen: 'Reader',
            borderColor: Colors.borderPurple,
            shadowColor: '#8b5cf6',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient
                colors={[Colors.bgDark, '#0f172a', '#1e1b4b']}
                style={styles.gradient}
            >
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.userSection}>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <View style={styles.headerSection}>
                        <Text style={styles.headerTitle}>📚 Reading Assistant</Text>
                        <Text style={styles.headerSubtitle}>Welcome back! What would you like to do?</Text>
                    </View>

                    {/* Feature Cards */}
                    <View style={styles.cardsContainer}>
                        {cards.map((card, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.card, { borderColor: Colors.border }]}
                                onPress={() => navigation.navigate(card.screen)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cardIcon}>{card.icon}</Text>
                                <Text style={styles.cardTitle}>{card.title}</Text>
                                <Text style={styles.cardDescription}>{card.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Progress Card */}
                    <TouchableOpacity
                        style={[styles.progressCard, { borderColor: Colors.border }]}
                        onPress={() => navigation.navigate('Progress')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.progressIcon}>📊</Text>
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressTitle}>Track Progress</Text>
                            <Text style={styles.progressDescription}>
                                View detailed statistics, reading history, and monitor your improvement journey
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: 50,
        paddingBottom: Spacing.md,
    },
    backText: { color: Colors.textSecondary, fontSize: FontSizes.md },
    userSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    userName: { color: Colors.textPrimary, fontWeight: '500', fontSize: FontSizes.md },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.sm,
    },
    logoutText: { color: Colors.textWhite, fontSize: FontSizes.sm },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.huge,
    },
    headerSection: { alignItems: 'center', marginBottom: Spacing.massive },
    headerTitle: {
        fontSize: FontSizes.xxxl,
        fontWeight: '800',
        color: Colors.textWhite,
        marginBottom: Spacing.sm,
    },
    headerSubtitle: { fontSize: FontSizes.lg, color: Colors.textSecondary },
    cardsContainer: { gap: Spacing.xl, marginBottom: Spacing.xxl },
    card: {
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xxl,
        borderWidth: 1,
        alignItems: 'center',
        ...Shadows.card,
    },
    cardIcon: { fontSize: 48, marginBottom: Spacing.lg },
    cardTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    cardDescription: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    progressCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xxl,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xxl,
        ...Shadows.card,
    },
    progressIcon: { fontSize: 48 },
    progressTextContainer: { flex: 1 },
    progressTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    progressDescription: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});

export default DashboardScreen;
