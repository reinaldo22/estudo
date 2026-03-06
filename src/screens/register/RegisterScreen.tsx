import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native'; // Hook para navegação 🚀
import { PrimaryButton } from '@/components/buttonRegister/Button';
import {
    View,
    Text,
    Alert,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback

} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { StyleRegister } from "./styles";
import { supabase } from "@/services/supabase";
import { Input } from '@/components/inputComponent/InputConponent';

export function RegisterScreen() {

    const navigation = useNavigation<any>();

    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSignUp() {


        let currentErrors = {
            fullName: !fullName ? "O nome é obrigatório" : "",
            email: !email ? "O e-mail é obrigatório" : "",
            phone: !phone ? "O telefone é obrigatório" : "",
            password: !password ? "A senha é obrigatória" : ""
        };


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            currentErrors.email = "Por favor, insira um e-mail válido";
        }
        setErrors(currentErrors);

        const hasErrors = Object.values(currentErrors).some(error => error !== "");
        if (hasErrors) return;


        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    }
                }
            })

            if (authError) {
                if (authError.message.includes('already registered')) {
                    setErrors(prev => ({
                        ...prev,
                        email: "Este e-mail já está em uso por outra conta."
                    }))

                }
            } else {
                Alert.alert(
                    "Sucesso!",
                    "Usuário cadastrado com sucesso!",
                    [
                        {
                            text: "Ir para Login",
                            onPress: () => navigation.navigate('Login') // Aqui nós REALMENTE usamos a variável! ✅
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert("Erro", "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    function updateField(field: string, value: string) {
        if (field === 'fullName') setFullName(value);
        if (field === 'email') setEmail(value);
        if (field === 'phone') setPhone(value);
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
                    <View style={StyleRegister.container}>
                        {/* 1. Topo com Título e Seta */}
                        <View style={StyleRegister.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={StyleRegister.backButton} // Aplique o estilo aqui!
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={26}
                                    color={"#2D3748"}
                                    style={StyleRegister.backButton}
                                />
                            </TouchableOpacity>
                            <Text style={StyleRegister.headerTitle}>Cadastre-se</Text>
                        </View>

                        {/* 2. Área do Ícone (Logo) */}
                        <View style={StyleRegister.logoContainer}>
                            <View style={StyleRegister.iconBox}>
                                <Ionicons name="leaf" size={40} color="#2D6A4F" />
                            </View>
                        </View>

                        {/* 3. Bloco de Texto (Hierarquia de Títulos) */}
                        <View style={StyleRegister.content}>
                            <Text style={StyleRegister.mainTitle}>Comece a negociar hoje</Text>
                            <Text style={StyleRegister.subtitle}>
                                Participe do nosso mercado unificado para comprar, vender e reciclar materiais de forma sustentável.
                            </Text>
                        </View>

                        {/* Campos de Entrada usando o novo Componente Input ⌨️ */}
                        <Input
                            label="NOME COMPLETO"
                            icon="person-outline"
                            placeholder="Seu Nome"
                            value={fullName}
                            error={errors.fullName}
                            onChangeText={(text) => updateField('fullName', text)}
                        />

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
                            label="TELEFONE"
                            icon="call-outline"
                            placeholder="+55 (00) 00000-0000"
                            keyboardType="phone-pad"
                            value={phone}
                            error={errors.phone}
                            onChangeText={(text) => updateField('phone', text)}
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
                            title='Create Account'
                            onPress={handleSignUp} isLoading={loading} />

                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
