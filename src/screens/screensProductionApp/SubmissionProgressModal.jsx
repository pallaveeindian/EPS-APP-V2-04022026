import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

export default function SubmissionProgressModal({
    visible,
    progress,
    message,
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <ActivityIndicator size="large" />

                    <Text style={styles.title}>
                        Submitting Enterprise
                    </Text>

                    <Text style={styles.message}>
                        {message}
                    </Text>

                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progress}%`,
                                },
                            ]}
                        />
                    </View>

                    <Text style={styles.percent}>
                        {Math.round(progress)}%
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 15,
        textAlign: 'center',
    },

    message: {
        marginTop: 10,
        textAlign: 'center',
        color: '#666',
    },

    progressBar: {
        height: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 20,
        marginTop: 20,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        backgroundColor: '#2563eb',
    },

    percent: {
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '700',
        fontSize: 16,
    },
});