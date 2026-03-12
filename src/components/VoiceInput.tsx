import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

interface VoiceInputProps {
    onCommandParsed: (text: string) => void;
}

export default function VoiceInput({ onCommandParsed }: VoiceInputProps) {
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const transcriptRef = React.useRef('');

    useSpeechRecognitionEvent('start', () => {
        console.log('Voice recognition started');
        setIsRecognizing(true);
        transcriptRef.current = '';
        setTranscript('');
    });
    useSpeechRecognitionEvent('end', () => {
        console.log('Voice recognition ended. Final transcript:', transcriptRef.current);
        setIsRecognizing(false);
        if (transcriptRef.current) {
            onCommandParsed(transcriptRef.current);
        }
    });
    useSpeechRecognitionEvent('result', (event) => {
        const text = event.results[0]?.transcript || '';
        console.log('Voice transcript update:', text);
        transcriptRef.current = text;
        setTranscript(text);
    });
    useSpeechRecognitionEvent('error', (event) => {
        console.error('Voice recognition error:', event.error, event.message);
        if (event.error !== 'no-speech') {
            Alert.alert('Error de Voz', event.message || 'Error desconocido');
        }
        setIsRecognizing(false);
    });

    const handlePress = async () => {
        if (isRecognizing) {
            ExpoSpeechRecognitionModule.stop();
        } else {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            // On web it returns { granted: true } automatically as seen in logs
            if (!result.granted && result.status !== 'undetermined') {
                alert('Permission to access microphone was denied');
                return;
            }
            ExpoSpeechRecognitionModule.start({
                lang: 'es-ES',
                interimResults: true,
            });
        }
    };

    return (
        <View style={styles.footer}>
            {isRecognizing && (
                <View style={styles.transcriptContainer}>
                    <Text style={styles.transcriptText}>{transcript || 'Escuchando...'}</Text>
                </View>
            )}
            <TouchableOpacity
                style={[styles.footerButton, isRecognizing ? styles.btnActive : styles.btnInactive]}
                onPress={handlePress}
            >
                {isRecognizing ? <MicOff color="white" size={24} /> : <Mic color="white" size={24} />}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        padding: 12,
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'white',
        // No borders as requested
    },
    transcriptContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
        width: 'auto',
        maxWidth: 250,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2
    },
    transcriptText: {
        textAlign: 'right',
        fontStyle: 'italic',
        color: '#1e293b',
        fontSize: 12
    },
    footerButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3
    },
    btnActive: { backgroundColor: '#ef4444' },
    btnInactive: { backgroundColor: '#2563eb' }
});
