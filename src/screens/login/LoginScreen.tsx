import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { StyleLoginScreen } from "./styles";
import React, { useState } from 'react';
import { Input } from '@/components/inputComponent/InputConponent';
import { PrimaryButton } from '@/components/buttonRegister/Button';
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native'; // Hook para navegação 🚀
import { Checkbox } from "@/components/checkboxComponent/Checkbox";
import { supabase } from "@/services/supabase";

export function LoginScreen() {
    const navigation = useNavigation<any>();

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);

    async function handleSignIn() {
        // 1. Criamos um objeto para validar os campos atuais
        let currentErrors = {
            email: !email ? "O e-mail é obrigatório" : "",
            password: !password ? "A senha é obrigatória" : ""
        };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            currentErrors.email = "Por favor, insira um e-mail válido";
        }

        setErrors(currentErrors);

        // 2. Verificamos se existe algum erro antes de prosseguir
        const hasErrors = Object.values(currentErrors).some(error => error !== "");
        if (hasErrors) return;

        setLoading(true);


        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })

            if (authError) {
                if (authError.message === 'Invalid login credentials') {
                    Alert.alert("Erro no Login", "E-mail ou senha incorretos. 🔑");
                } else {
                    Alert.alert("Erro", authError.message);
                }
            } else {
                navigation.replace('Home'); // 'replace' impede que o usuário volte para o login ao clicar em voltar
            }
        } catch (error) {
            Alert.alert("Erro", "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }

    }


    // 2. Depois declaramos a função de atualização 🛠️
    function updateField(field: string, value: string) {
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);

        setErrors(prev => ({ ...prev, [field]: '' }));
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}

                showsVerticalScrollIndicator={false}>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={StyleLoginScreen.container}>
                        {/* 1. Topo com Título e Seta */}
                        <View style={StyleLoginScreen.header}>
                            <Text style={StyleLoginScreen.headerTitle}>Login</Text>
                        </View>

                        {/* 2. Área do Ícone (Logo) */}
                        <View style={StyleLoginScreen.logoContainer}>
                            <View style={StyleLoginScreen.iconBox}>
                                <Ionicons name="leaf" size={40} color="#2D6A4F" />
                            </View>
                        </View>

                        {/* 3. Bloco de Texto (Hierarquia de Títulos) */}
                        <View style={StyleLoginScreen.content}>
                            <Text style={StyleLoginScreen.mainTitle}>Bem Vindo</Text>
                            <Text style={StyleLoginScreen.subtitle}>
                                Continue sua jornada no marketing para um mundo mais limpo.
                            </Text>
                        </View>



                        <Input
                            label="EMAIL"
                            icon="mail-outline"
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            value={email}
                            error={errors.email}
                            onChangeText={(text) => updateField('email', text)}
                        />

                        <Input
                            label="SENHA"
                            icon="lock-closed-outline"
                            placeholder="********"
                            secureTextEntry={!showPassword}
                            value={password}
                            error={errors.password}
                            onChangeText={(text) => updateField('password', text)}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />

                        <PrimaryButton
                            title='Login'
                            onPress={handleSignIn} isLoading={loading} />

                        <View style={StyleLoginScreen.footerContainer}>
                            {/* Lado Esquerdo: Cadastro */}
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={StyleLoginScreen.signUpText}>Inscrever-se</Text>
                            </TouchableOpacity>

                            {/* Lado Direito: Redefinir */}
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={StyleLoginScreen.forgotPasswordText}>Redefinir senha</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

