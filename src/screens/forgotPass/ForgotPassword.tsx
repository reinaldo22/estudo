import { ResetPasswordStyle } from './style';
import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native'; // Hook para navegação 🚀
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/buttonRegister/Button';
import { Input } from '@/components/inputComponent/InputConponent';
import { supabase } from "@/services/supabase"; // Importe seu supabase

export function ForgotPassScreen() {
    const navigation = useNavigation<any>();

    // Todos os states juntos no topo do componente 🔝
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '' });

    async function handleResetPassword() {

        setErrors({ email: '' });

        setErrors({ email: '' });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            setErrors({ email: 'O e-mail é obrigatório.' });
            return;
        }
        if (!emailRegex.test(email)) {
            setErrors({ email: 'Por favor, insira um e-mail válido.' });
            return;
        }
        setLoading(true);
        try {

            // Verifica se usuário existe
            const { data, error } = await supabase.from('Users').select('email').eq('email', email).single();

            if (error) {
                setErrors({ email: 'E-mail não encontrado' });
                return;
            } else {
                navigation.navigate('Senha', { email });
            }
        } catch (error) {
            Alert.alert("Erro", "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}

                showsVerticalScrollIndicator={false}>

                <View style={ResetPasswordStyle.container}>
                    {/* 1. Botão de Voltar */}
                    <View style={ResetPasswordStyle.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    {/* 2. Área do Ícone (Logo) - Alinhado à esquerda */}
                    <View style={ResetPasswordStyle.logoContainer}>
                        <View style={ResetPasswordStyle.iconBox}>
                            <Ionicons name="leaf" size={40} color="#2D6A4F" />
                        </View>
                    </View>

                    {/* Aqui entrarão os textos e o input que vimos na imagem... */}
                    <View style={ResetPasswordStyle.content}>
                        <Text style={ResetPasswordStyle.title}>Redefinir Senha</Text>
                        <Text style={ResetPasswordStyle.subtitle}>
                            Não se preocupe, isso acontece. Insira seu endereço de e-mail cadastrado abaixo e enviaremos um link para redefinir sua senha.
                        </Text>
                    </View>

                    {/* 4. Formulário */}
                    <View style={ResetPasswordStyle.form}>
                        <Input
                            label="Email"
                            icon="mail-outline"
                            placeholder="name@example.com"
                            keyboardType="email-address"
                            value={email} // Precisamos criar esse state!
                            error={errors.email}
                            onChangeText={setEmail}
                        />

                        <View style={{ marginTop: 20 }}>
                            <PrimaryButton
                                title="Enviar Link"
                                onPress={handleResetPassword}
                                isLoading={loading}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}