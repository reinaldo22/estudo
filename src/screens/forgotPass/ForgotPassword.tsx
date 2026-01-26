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

        // 1. Resetar erros e iniciar loading
        setErrors({ email: '' });
        // Regex padrão para validação de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // 2. Validação de campo vazio
        if (!email.trim()) {
            setErrors({ email: 'O e-mail é obrigatório.' });
            return;
        }
        // 3. Validação de formato
        if (!emailRegex.test(email)) {
            setErrors({ email: 'Por favor, insira um e-mail válido.' });
            return;
        }
        // Se passar por aqui, o e-mail é válido! ✅
        setLoading(true);
        try {

            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                // MUITA ATENÇÃO AQUI:
                // Se estiver usando Expo Go em desenvolvimento, use o endereço do seu Metro Bundler
                // Exemplo: 'exp://192.168.0.10:8081' ou o esquema do seu app em produção
                redirectTo: 'exp://32fdg80-anonymous-8081.exp.direct/--/Senha',
            });
            if (error) {
                // Se o e-mail não existir ou houver erro de limite de envio (rate limit)
                Alert.alert("Erro", error.message);
            } else {
                Alert.alert(
                    "Sucesso!",
                    "O link de redefinição foi enviado para o seu e-mail.",
                    [{ text: "OK", onPress: () => navigation.navigate('Login') }]
                );
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