import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { NewPassStyle } from "./style"; // Reutilizando seus estilos
import { Input } from '@/components/inputComponent/InputConponent';
import { PrimaryButton } from '@/components/buttonRegister/Button';
import { supabase } from "@/services/supabase";
import { useNavigation } from '@react-navigation/native';

export function NewPasswordScreen() {
    const navigation = useNavigation<any>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleUpdatePassword() {
        // 1. Validações básicas de UI
        if (!password || !confirmPassword) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();


            if (sessionError || !session) {
                console.log("Erro de sessão:", sessionError);
                Alert.alert(
                    "Sessão Inválida",
                    "Não conseguimos validar seu acesso. Por favor, solicite um novo e-mail de recuperação."
                );
                return;
            }
            // 2. Agora que temos certeza que há uma sessão, atualizamos a senha
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                Alert.alert("Erro ao atualizar", error.message);
            } else {
                // 3. Sucesso! Limpar sessão e mandar para o login
                await supabase.auth.signOut(); // Opcional: desloga para forçar login com a nova senha
                Alert.alert("Sucesso", "Sua senha foi atualizada com sucesso!", [
                    { text: "Ir para Login", onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (err) {
            Alert.alert("Erro", "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={NewPassStyle.container}>

                        <View style={NewPassStyle.header}>
                            <Text style={NewPassStyle.headerTitle}>Nova Senha</Text>
                        </View>

                        <View style={NewPassStyle.content}>
                            <Text style={NewPassStyle.mainTitle}>Quase lá!</Text>
                            <Text style={NewPassStyle.subtitle}>
                                Digite sua nova senha abaixo para recuperar o acesso à sua conta.
                            </Text>
                        </View>

                        <Input
                            label="NOVA SENHA"
                            icon="lock-closed-outline"
                            placeholder="********"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />

                        <Input
                            label="CONFIRMAR SENHA"
                            icon="lock-closed-outline"
                            placeholder="********"
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <PrimaryButton
                            title='Atualizar Senha'
                            onPress={handleUpdatePassword}
                            isLoading={loading}
                        />

                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}