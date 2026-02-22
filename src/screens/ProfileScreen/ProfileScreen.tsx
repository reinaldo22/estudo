import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styleProfile } from './style';
import { supabase } from '@/services/supabase';
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
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const { data, error } = await supabase
                .from('profile') // Verifique se o nome é 'profile' ou 'profiles'
                .select(`
                *,
                anuncios (
                    peso,
                    status
                )
            `)
                .eq('id', authUser.id)
                .eq('anuncios.status', 'ativo')
                .single();

            if (error) {
                console.error("Erro na busca:", error.message);
                return;
            }

            if (data) {
                // 1. Quantidade de anúncios (tamanho do array de anúncios que voltaram)
                const contagem = data.anuncios?.length || 0;
                setQtdAnuncios(contagem);

                // 2. Cálculo do Impacto Total (soma dos pesos)
                const somaPeso = data.anuncios?.reduce((acc: number, curr: any) => {
                    return acc + (Number(curr.peso) || 0);
                }, 0);

                setImpactoTotal(somaPeso);

                // 3. Atualiza o usuário
                setUser(data);
            }
        }
    }

    // 2. Função que será chamada quando o usuário clicar em salvar no Modal
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
            const ehCnpj = documentoLimpo.length === 14;

            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            let finalImageUrl = user?.avatar_url;

            // 2. Lógica de Imagem
            if (updatedData.newImage && updatedData.newImage.startsWith('file://')) {

                // --- DELETAR FOTO ANTIGA (Se existir) ---
                // Substitua o bloco de deleção por este:
                if (user?.avatar_url) {
                    try {
                        // Pega apenas o nome do arquivo, ignorando query params (?v=123)
                        const urlWithoutQuery = user.avatar_url.split('?')[0];
                        const oldFileName = urlWithoutQuery.split('/').pop();

                        if (oldFileName && !oldFileName.includes('placeholder')) {
                            const { error: deleteError } = await supabase.storage
                                .from('avatars')
                                .remove([oldFileName]);

                            if (deleteError) console.log("Erro ao deletar:", deleteError.message);
                        }
                    } catch (e) {
                        console.log("Erro na lógica de limpeza:", e);
                    }
                }

                // --- UPLOAD DA FOTO NOVA ---
                const fileExt = updatedData.newImage.split('.').pop();
                const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;

                const formData = new FormData();
                formData.append('file', {
                    uri: updatedData.newImage,
                    name: fileName,
                    type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                } as any);

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, formData);

                if (uploadError) throw uploadError;

                // Pega a nova URL pública para salvar no banco
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                finalImageUrl = publicUrl;
            }

            // 3. Persistência no Banco (Tabela Profile)
            const { error: updateError } = await supabase
                .from('profile')
                .upsert({
                    id: authUser.id,
                    full_name: updatedData.nome,
                    cpf: documentoLimpo,      // Sua coluna existente
                    is_cnpj: ehCnpj,          // Nova coluna booleana
                    phone: telefoneLimpo,     // Coluna de telefone
                    endereco: updatedData.endereco,
                    avatar_url: finalImageUrl,
                    updated_at: new Date(),
                });

            if (updateError) throw updateError;

            setIsModalVisible(false);
            loadProfile();
            alert(`Perfil de ${ehCnpj ? 'Empresa' : 'Pessoa Física'} atualizado! 🚀`);

        } catch (error: any) {
            console.error("Erro completo:", error);
            alert("Erro ao salvar: " + error.message);
            throw error; // Repassa o erro para o Modal parar o loading
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={32} color="#333" />
                </TouchableOpacity>
                <Text style={styleProfile.headerTitle}>PERFIL</Text>
                <TouchableOpacity>
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

                <TouchableOpacity style={styleProfile.logoutButton} onPress={() => {/* sua lógica de logout aqui */ }}>
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