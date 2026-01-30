import { ConfirmCodeStyle } from './style';
import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/buttonRegister/Button';
import { Input } from '@/components/inputComponent/InputConponent';
import { supabase } from "@/services/supabase";

export function ConfirmCodePass() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Resgatando o e-mail da tela anterior
    const { email } = route.params || { email: '' };

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorCode, setErrorCode] = useState('');

    async function handleVerifyCode() {
        // Validação de preenchimento
        if (!code.trim()) {
            setErrorCode('O código é obrigatório.');
            return;
        }

        if (code.length < 6) { // Exemplo de trava mínima
            setErrorCode('Código muito curto.');
            return;
        }

        setLoading(true);
        setErrorCode('');

        try {
            // Buscando os dados na tabela 'profile' conforme sua estrutura
            const { data, error } = await supabase
                .from('profile')
                .select('reset_code, reset_expires_at')
                .eq('email', email)
                .single();

            if (error || !data) {
                Alert.alert("Erro", "Não encontramos um código para este e-mail.");
                return;
            }

            // Comparação ignorando maiúsculas/minúsculas para facilitar para o usuário
            if (data.reset_code.trim().toUpperCase() !== code.trim().toUpperCase()) {
                setErrorCode('Código inválido.');
                return;
            }

            // Validação de expiração (Time-to-Live)
            const now = new Date();
            if (data.reset_expires_at && new Date(data.reset_expires_at) < now) {
                setErrorCode('Este código expirou. Gere um novo.');
                return;
            }

            // Sucesso: Segue para a tela de criar a nova senha
            navigation.navigate('NewPasswordScreen', { email: email });

        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Erro ao processar verificação.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View style={ConfirmCodeStyle.container}>
                    <View style={ConfirmCodeStyle.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    <View style={ConfirmCodeStyle.logoContainer}>
                        <View style={ConfirmCodeStyle.iconBox}>
                            <Ionicons name="shield-checkmark-outline" size={40} color="#2D6A4F" />
                        </View>
                    </View>

                    <View style={ConfirmCodeStyle.content}>
                        <Text style={ConfirmCodeStyle.title}>Verifique seu e-mail</Text>
                        <Text style={ConfirmCodeStyle.subtitle}>
                            Digite o código de 6 dígitos enviado para{"\n"}
                            <Text style={{ fontWeight: 'bold', color: '#1A1A1A' }}>{email}</Text>
                        </Text>
                    </View>

                    <View style={ConfirmCodeStyle.form}>
                        <Input
                            label="Código"
                            icon="key-outline"
                            placeholder="Ex: A1B2C3"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            maxLength={6}
                            value={code}
                            error={errorCode}
                            onChangeText={(text) => {
                                setCode(text);
                                setErrorCode('');
                            }}
                        />

                        <View style={{ marginTop: 20 }}>
                            <PrimaryButton
                                title="Confirmar Código"
                                onPress={handleVerifyCode}
                                isLoading={loading}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}