import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { styleProfile } from './style';
import { supabase } from '@/services/supabase';
import ProfileService from '@/services/ProfileService';
import { CommonActions } from '@react-navigation/native';
import { EditProfileModal } from './EditProfileModal/EditProfileModal';

export function ProfileScreen({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [qtdAnuncios, setQtdAnuncios] = useState<any>(null);
    const [endereco, setEndereco] = useState<any>(null);
    const [impactoTotal, setImpactoTotal] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const statsData = await ProfileService.getProfileWithStats();
        if (statsData) {
            setQtdAnuncios(statsData.anuncios?.length || 0);
            const somaPeso = statsData.anuncios?.reduce((acc: number, curr: any) => acc + (Number(curr.peso) || 0), 0);
            setImpactoTotal(somaPeso);
            setUser(statsData);
        }
    }

    // 2. Função que será chamada quando o usuário clicar em salvar no Modal
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Erro', 'Não foi possível sair da conta.');
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Drawer' }], // Redirecionando para a Home (Drawer)
                })
            );
        }
    };

    const handleDeactivate = async () => {
        Alert.alert(
            "Desativar Conta",
            "Sua conta ficará inativa. Você poderá reativá-la entrando em contato com o suporte. Deseja continuar?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            await ProfileService.updateProfile({ is_active: false } as any);
                            handleLogout();
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível desativar sua conta.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert(
            "Excluir Conta DEFINITIVAMENTE",
            "Esta ação NÃO pode ser desfeita. Todos os seus dados serão apagados. Tem certeza?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "EXCLUIR TUDO",
                    onPress: async () => {
                        try {
                            // 1. Pegamos a sessão atual de forma assíncrona
                            const { data: { session } } = await supabase.auth.getSession();

                            if (!session?.access_token) {
                                console.error("DEBUG: Nenhuma sessão ativa encontrada.");
                                Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
                                return;
                            }

                            // 2. Chamada da função de exclusão
                            try {
                                await ProfileService.deleteUser(session.access_token);
                                Alert.alert("Sucesso", "Sua conta foi excluída.");
                                handleLogout();
                            } catch (error) {
                                // Se cair aqui, a função retornou erro (provavelmente o 401)
                                console.error("Erro retornado pela função:", error);
                                Alert.alert("Erro", "A função de exclusão falhou. Verifique os logs no Supabase.");
                            }
                        } catch (err) {
                            console.error("Erro inesperado na chamada:", err);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleOptionsPress = () => {
        Alert.alert(
            "Gerenciar Conta",
            "Escolha uma opção:",
            [
                { text: "Desativar Conta", onPress: handleDeactivate },
                { text: "Excluir Conta DEFINITIVAMENTE", onPress: handleDelete, style: "destructive" },
                { text: "Fechar", style: "cancel" }
            ]
        );
    };

    const handleSaveProfile = async (updatedData: any) => {
        try {
            // 1. Limpeza de dados
            const documentoLimpo = (updatedData.documento || '').replace(/\D/g, '');
            const telefoneLimpo = (updatedData.phone || '').replace(/\D/g, '');

            if (!documentoLimpo) {
                alert("Por favor, preencha o CPF ou CNPJ.");
                return;
            }
            // Lógica sugerida: 14 caracteres = CNPJ, caso contrário CPF
            const ehCnpj = documentoLimpo.length > 11;

            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            let finalImageUrl = user?.avatar_url;

            // 2. Lógica de Imagem
            if (updatedData.newImage && updatedData.newImage.startsWith('file://')) {
                // Deleta foto antiga da storage se existir (simplificado)
                // Deleta foto antiga da storage se existir
                if (user?.avatar_url) {
                    await ProfileService.removeAvatar(user.avatar_url);
                }

                // O ProfileService assume upload
                finalImageUrl = await ProfileService.uploadAvatar(updatedData.newImage);
            }

            // 3. Persistência no Banco
            await ProfileService.updateProfile({
                full_name: updatedData.nome,
                cpf: documentoLimpo,
                phone: telefoneLimpo,
                endereco: updatedData.endereco,
                avatar_url: finalImageUrl,
                is_cnpj: ehCnpj
            });

            setIsModalVisible(false);
            loadProfile();
            alert(`Perfil de ${ehCnpj ? 'Empresa' : 'Pessoa Física'} atualizado! 🚀`);

        } catch (error: any) {
            console.error("Erro completo:", error);
            if (error.code == "23505") {
                alert("CPF ou CNPJ já cadastrado!");
            } else {
                alert("Erro ao salvar: ");
            }
            throw error; // Repassa o er    ro para o Modal parar o loading
        }
    };
    const StatCard = ({ label, value, subLabel }: any) => (
        <View style={styleProfile.statCard}>
            <Text style={styleProfile.statValue}>{value}</Text>
            <Text style={styleProfile.statLabel}>{label}</Text>
            <Text style={styleProfile.statSubLabel}>{subLabel}</Text>
        </View>
    );

    const MenuOption = ({ icon, title, onPress }: any) => (
        <TouchableOpacity style={styleProfile.menuOption} onPress={onPress}>
            <View style={styleProfile.menuIconContainer}>
                <Icon name={icon} size={22} color="#2D6A4F" />
            </View>
            <Text style={styleProfile.menuTitle}>{title}</Text>
            <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styleProfile.container}>
            {/* Header com botões de ação */}
            <View style={styleProfile.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon name="menu" size={32} color="#333" />
                </TouchableOpacity>
                <Text style={styleProfile.headerTitle}>PERFIL</Text>
                <TouchableOpacity onPress={handleOptionsPress}>
                    <Icon name="more-horiz" size={28} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Avatar e Nome */}
                <View style={styleProfile.avatarSection}>
                    <View style={styleProfile.avatarContainer}>
                        <Image
                            source={{ uri: user?.avatar_url || 'https://via.placeholder.com/150' }}
                            style={styleProfile.avatar}
                        />
                        <View style={styleProfile.verifiedBadge}>
                            <Icon name="verified" size={18} color="#FFF" />
                        </View>
                    </View>
                    <Text style={styleProfile.userName}>{user?.full_name || 'Alex Johnson'}</Text>
                    <View style={styleProfile.locationRow}>
                        <Icon name="place" size={16} color="#666" />
                        <Text style={styleProfile.locationText}>{user?.endereco?.split('-').pop() || 'Brooklyn, New York'}</Text>
                    </View>
                </View>

                {/* Grid de Estatísticas */}
                <View style={styleProfile.statsGrid}>
                    <StatCard value={qtdAnuncios ?? 0} label="ANÚNCIOS" subLabel="ATIVOS" />
                    <StatCard value={impactoTotal} label="IMPACTO" subLabel="(KG)" />
                    <StatCard value={(user?.rating || '0.0') + " ★"} label="AVALIAÇÃO" subLabel="" />
                </View>

                {/* Seção de Configurações */}
                <View style={styleProfile.sectionContainer}>
                    <Text style={styleProfile.sectionHeader}>CONFIGURAÇÕES</Text>
                    {/* AQUI ESTAVA O QUE FALTAVA: O BOTÃO PARA ABRIR O MODAL */}
                    <MenuOption
                        icon="person-add-alt"
                        title="Editar Perfil"
                        onPress={() => setIsModalVisible(true)}
                    />


                    <MenuOption
                        icon="location-on"
                        title="Endereços de Retirada"
                        onPress={() => { }}
                    />
                </View>

                {/* Footer Info */}
                <Text style={styleProfile.memberSince}>
                    Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Janeiro 2023'}
                </Text>

                <TouchableOpacity style={styleProfile.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={20} color="#E74C3C" />
                    <Text style={styleProfile.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>
            </ScrollView>
            {/* 4. O Modal fica aqui no final do JSX, como um "vizinho" do ScrollView */}
            <EditProfileModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                userData={user}
                onSave={handleSaveProfile}
            />
        </SafeAreaView>
    );
}