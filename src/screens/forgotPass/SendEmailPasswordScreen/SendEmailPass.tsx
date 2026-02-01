import { SendEmailPassStyle } from './style';
import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/buttonRegister/Button';
import { Input } from '@/components/inputComponent/InputConponent';
import { supabase } from "@/services/supabase";

export function SendEmailPass() {
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '' });

    async function handleResetPassword() {
        

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
            
            const { data, error } = await supabase
                .from('profile')
                .select('email')
                .eq('email', email.trim().toLowerCase())
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    setErrors({ email: 'E-mail não encontrado em nossa base.' });
                } else {
                    console.error('Erro técnico na consulta:', error.message);
                    setErrors({ email: 'Erro ao validar e-mail. Tente novamente.' });
                }
                return;
            }


            const { data: funcData, error: funcError } = await supabase.functions.invoke('send-reset-code', {
                body: { to: email.trim().toLowerCase() },
            });

            if (funcError) {
                console.error("Erro ao invocar function:", funcError);
                Alert.alert("Erro", "Falha ao enviar código de verificação. Tente novamente.");
                return;
            }

            navigation.navigate('ConfirmCode', { email: email.trim().toLowerCase() });

        } catch (error) {
            console.error("Erro inesperado:", error);
            Alert.alert("Erro", "Ocorreu um erro inesperado ao processar sua solicitação.");
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

                <View style={SendEmailPassStyle.container}>
                    {/* 1. Botão de Voltar */}
                    <View style={SendEmailPassStyle.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    {/* 2. Área do Ícone (Logo) - Alinhado à esquerda */}
                    <View style={SendEmailPassStyle.logoContainer}>
                        <View style={SendEmailPassStyle.iconBox}>
                            <Ionicons name="leaf" size={40} color="#2D6A4F" />
                        </View>
                    </View>

                    {/* Aqui entrarão os textos e o input que vimos na imagem... */}
                    <View style={SendEmailPassStyle.content}>
                        <Text style={SendEmailPassStyle.title}>Redefinir Senha</Text>
                        <Text style={SendEmailPassStyle.subtitle}>
                            Não se preocupe, isso acontece. Insira seu endereço de e-mail cadastrado abaixo e enviaremos um link para redefinir sua senha.
                        </Text>
                    </View>

                    {/* 4. Formulário */}
                    <View style={SendEmailPassStyle.form}>
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