import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { NewPassStyle } from "./style"; // Reutilizando seus estilos
import { Input } from '@/components/inputComponent/InputConponent';
import { PrimaryButton } from '@/components/buttonRegister/Button';
import { supabase } from "@/services/supabase";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export function NewPasswordScreen() {

    const route = useRoute<any>();
    const { email, code } = route.params;

    const navigation = useNavigation<any>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleUpdatePassword() {
        if (!password || !confirmPassword) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke(
                'reset-password',
                {
                    body: {
                        email,
                        code,
                        newPassword: password,
                    },
                }
            );

            if (error) {
                Alert.alert("Erro", error.message || "Falha ao redefinir senha.");
                return;
            }

            Alert.alert(
                "Sucesso",
                "Senha redefinida com sucesso.",
                [
                    {
                        text: "Ir para Login",
                        onPress: () =>
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            }),
                    },
                ]
            );


        } catch (err) {
            Alert.alert("Erro", "Erro inesperado.");
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