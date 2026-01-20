import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { StyleLoginScreen } from "./styles";
import React, { useState } from 'react';
import { Input } from '@/components/inputComponent/InputConponent';
import { PrimaryButton } from '@/components/buttonRegister/Button';
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native'; // Hook para navegação 🚀
import { Checkbox } from "@/components/checkboxComponent/Checkbox";

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

                        <Checkbox
                            label="Mantenha-me logado"
                            value={keepLoggedIn}
                            onChange={setKeepLoggedIn}
                        />

                        <PrimaryButton
                            title='Login'
                            onPress={handleSignIn} isLoading={loading} />

                        {/* Link para Cadastro */}
                        <View style={StyleLoginScreen.footerContainer}>
                            <Text style={StyleLoginScreen.footerText}>É novo no mercado? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={StyleLoginScreen.signUpText}>Inscrever-se</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

