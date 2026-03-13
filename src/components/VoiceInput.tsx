import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

interface VoiceInputProps {
    onCommandParsed: (text: string) => void;
}

/**
 * RE-ACTIVATED VOICE INPUT COMPONENT
 * This version uses the 'expo-speech-recognition' module.
 * It will only work in a "Development Build" (npx expo run:ios).
 */
export default function VoiceInput({ onCommandParsed }: VoiceInputProps) {
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const transcriptRef = useRef('');

    // Active Speech Recognition Event Handlers
    useSpeechRecognitionEvent('start', () => {
        setIsRecognizing(true);
        transcriptRef.current = '';
        setTranscript('');
    });

    useSpeechRecognitionEvent('end', () => {
        setIsRecognizing(false);
        if (transcriptRef.current) {
            onCommandParsed(transcriptRef.current);
        }
    });

    useSpeechRecognitionEvent('result', (event) => {
        const text = event.results[0]?.transcript || '';
        transcriptRef.current = text;
        setTranscript(text);
    });

    useSpeechRecognitionEvent('error', (event) => {
        // 'no-speech' is common and can be ignored
        if (event.error !== 'no-speech') {
            Alert.alert('Error de Voz', event.message || 'Error desconocido');
        }
        setIsRecognizing(false);
    });

    const handlePress = async () => {
        // Safety check at runtime
        if (!ExpoSpeechRecognitionModule) {
            Alert.alert(
                'Módulo no detectado',
                'Esta app no ha sido compilada con soporte de voz. Usa npx expo run:ios para habilitarlo.'
            );
            return;
        }

        if (isRecognizing) {
            ExpoSpeechRecognitionModule.stop();
        } else {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted && result.status !== 'undetermined') {
                Alert.alert('Permiso Denegado', 'Se requiere acceso al micrófono para comandos de voz.');
                return;
            }
            
            try {
                ExpoSpeechRecognitionModule.start({
                    lang: 'es-ES',
                    interimResults: true,
                });
            } catch (err) {
                console.error("Error starting speech recognition:", err);
                Alert.alert('Error', 'No se pudo iniciar el reconocimiento de voz.');
            }
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
                activeOpacity={0.7}
            >
                {isRecognizing ? <MicOff color="white" size={24} /> : <Mic color="white" size={24} />}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        padding: 16,
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    transcriptContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        maxWidth: 250,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8
    },
    transcriptText: {
        textAlign: 'right',
        fontStyle: 'italic',
        color: '#1e293b',
        fontSize: 13,
        fontWeight: '500'
    },
    footerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6
    },
    btnActive: { backgroundColor: '#ef4444' },
    btnInactive: { backgroundColor: '#2563eb' }
});
