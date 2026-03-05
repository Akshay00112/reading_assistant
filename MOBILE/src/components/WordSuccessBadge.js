import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const WordSuccessBadge = ({ word, status }) => {
    const getWordColor = () => {
        switch (status) {
            case 'correct': return Colors.wordCorrect;
            case 'mispronounced': return Colors.wordMispronounced;
            case 'missed': return Colors.wordMissed;
            case 'extra': return Colors.wordExtra;
            case 'article-error': return Colors.wordArticleError;
            default: return Colors.textPrimary;
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'correct': return '✓';
            case 'mispronounced': return '✗';
            case 'missed': return '⊘';
            default: return '!';
        }
    };

    return (
        <View style={[styles.badge, { borderBottomColor: getWordColor() }]}>
            <Text style={[styles.text, { color: getWordColor() }]}>{word}</Text>
            {status !== 'correct' && (
                <Text style={[styles.status, { color: getWordColor() }]}>{getStatusIcon()}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderBottomWidth: 3,
        marginBottom: Spacing.sm,
        marginRight: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    text: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
    },
    status: {
        fontSize: FontSizes.xs,
        textAlign: 'center',
        marginTop: 2,
    },
});

export default WordSuccessBadge;
