import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleRegister } from '@/screens/register/styles';

// 1. Definimos a interface com as propriedades que o componente aceita
interface InputProps extends TextInputProps {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    error?: string;
    onRightIconPress?: () => void;
}

export function Input({ label, icon, error, onRightIconPress, ...rest }: InputProps) {
    return (
        <View style={StyleRegister.inputWrapper}>
            {/* Rótulo do campo */}
            <Text style={StyleRegister.label}>{label}</Text>

            {/* Container do Input (ícone + texto + olhinho) */}
            <View style={[
                StyleRegister.inputContainer,
                error ? { borderColor: '#E53E3E', borderWidth: 1 } : {}
            ]}>
                {/* Ícone da esquerda */}
                <Ionicons name={icon} size={22} color='#A0AEC0' style={{ marginRight: 10 }} />
                
                {/* O campo de texto propriamente dito */}
                <TextInput
                    style={StyleRegister.textInput}
                    placeholderTextColor="#A0AEC0"
                    {...rest} 
                />

                {/* Botão da direita (ex: olhinho da senha) */}
                {onRightIconPress && (
                    <TouchableOpacity onPress={onRightIconPress}>
                        <Ionicons
                            name={rest.secureTextEntry ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color="#A0AEC0"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Mensagem de erro, se existir */}
            {error ? <Text style={StyleRegister.errorText}>{error}</Text> : null}
        </View>
    );
}