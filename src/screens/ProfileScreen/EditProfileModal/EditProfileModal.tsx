import React, { useEffect, useState } from 'react';
import {
    Modal, View, Text, TouchableOpacity, TextInput,
    Image, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { styleModal } from './style';
import { maskDocument, maskPhone } from '@/utils/formatMask';
import * as ImagePicker from 'expo-image-picker';
import { PrimaryButton } from '@/components/buttonRegister/Button'; // ajuste o caminho

interface EditProfileProps {
    visible: boolean;
    onClose: () => void;
    userData: any;
    onSave: (data: any) => void;
}

export function EditProfileModal({ visible, onClose, userData, onSave }: EditProfileProps) {
    const [nome, setNome] = useState(userData?.full_name || '');
    const [documento, setDocumento] = useState(userData?.documento || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [endereco, setEndereco] = useState(userData?.endereco || '');
    const [image, setImage] = useState<string | null>(userData?.avatar_url || null);
    const [isSaving, setIsSaving] = useState(false); // Novo estado de controle

    useEffect(() => {
        if (visible && userData) {
            setNome(userData.full_name || '');
            setDocumento(userData.cpf || '');
            setPhone(userData.phone || '');
            setEndereco(userData.endereco || '');
            setImage(userData.avatar_url || null);
        }
    }, [visible, userData]);

    const handlePressSave = async () => {
        setIsSaving(true);
        try {
            // Aguarda a execução da função onSave que vem lá da ProfileScreen
            await onSave({ nome, documento, phone, endereco, newImage: image });
        } finally {
            // Oculta o loading mesmo que dê erro
            setIsSaving(false);
        }
    };

    const pickImage = async () => {
        // Solicita permissão
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Precisamos de permissão para acessar suas fotos!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true, // Permite cortar a foto
            aspect: [1, 1],      // Força ser um quadrado para o avatar
            quality: 0.7,        // Comprime um pouco para o upload ser rápido
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styleModal.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styleModal.sheet}
                >
                    {/* Barra de arraste no topo */}
                    <View style={styleModal.dragHandle} />

                    <View style={styleModal.header}>
                        <Text style={styleModal.title}>Editar Perfil</Text>
                        <TouchableOpacity onPress={onClose} style={styleModal.closeButton}>
                            <Icon name="close" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Avatar com botão de alterar foto */}
                        <View style={styleModal.avatarSection}>
                            <View style={styleModal.avatarContainer}>
                                <Image
                                    key={image} // Isso força o refresh da imagem
                                    source={{ uri: image || userData?.avatar_url || 'https://via.placeholder.com/150' }}
                                    style={styleModal.avatar}
                                />
                                {/* 5. Chama a função no clique do ícone de câmera */}
                                <TouchableOpacity style={styleModal.cameraIcon} onPress={pickImage}>
                                    <Icon name="photo-camera" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styleModal.alterarFotoText}>ALTERAR FOTO</Text>
                        </View>

                        {/* Campos de Input */}
                        <View style={styleModal.form}>
                            <Text style={styleModal.label}>NOME COMPLETO</Text>
                            <View style={styleModal.inputContainer}>
                                <Icon name="person" size={20} color="#999" style={styleModal.inputIcon} />
                                <TextInput
                                    style={styleModal.input}
                                    value={nome}
                                    onChangeText={setNome}
                                    placeholder="Nome completo"
                                />
                            </View>

                            <Text style={styleModal.label}>CPF OU CNPJ</Text>
                            <View style={styleModal.inputContainer}>
                                <Icon name="card-membership" size={20} color="#999" style={styleModal.inputIcon} />
                                <TextInput
                                    style={styleModal.input}
                                    value={maskDocument(documento)}
                                    onChangeText={setDocumento}
                                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                    keyboardType="numeric"
                                />
                            </View>

                            <Text style={styleModal.label}>NÚMERO DE TELEFONE</Text>
                            <View style={styleModal.inputContainer}>
                                <Icon name="phone" size={20} color="#999" style={styleModal.inputIcon} />
                                <TextInput
                                    style={styleModal.input}
                                    value={maskPhone(phone)}
                                    onChangeText={setPhone}
                                    placeholder="(11) 98765-4321"
                                    keyboardType="numeric"
                                />
                            </View>

                            <Text style={styleModal.label}>ENDEREÇO</Text>
                            <View style={styleModal.inputContainer}>
                                <Icon name="place" size={20} color="#999" style={styleModal.inputIcon} />
                                <TextInput
                                    style={styleModal.input}
                                    value={endereco}
                                    onChangeText={setEndereco}
                                    placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo"
                                />
                            </View>
                        </View>

                        {/* Substituímos o TouchableOpacity pelo seu componente PrimaryButton */}
                        <PrimaryButton
                            title="Salvar Alterações"
                            onPress={handlePressSave}
                            isLoading={isSaving}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}