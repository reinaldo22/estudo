import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/services/supabase'; // auth.getUser only
import AnunciosService from '@/services/AnunciosService';
import { AdCard } from '@/components/cardAdd/AdCard';
import { EmptyState } from '@/components/EmptyStateComponent/EmptyState';
import { AdCardSkeleton } from '@/components/Skeleton/Skeleton';
import { styleMyAds } from './style';
import { RefreshControlComponent } from '@/components/RefreshControl/RefreshControl';

interface AdProps {
    id: string;
    titulo: string;
    preco: number;
    tipo: 'venda' | 'doação';
    imagens: string[];
    estado: string;
    cidade: string;
    status: string;
    impulsionado: boolean;
    impulsionado_ate: string;
}

export function MyAdsScreen({ navigation }: any) {
    const [ads, setAds] = useState<AdProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'ativos' | 'finalizados'>('ativos');

    useFocusEffect(
        useCallback(() => {
            loadMyAds();
        }, [activeTab])
    );

    async function loadMyAds() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const data = await AnunciosService.getMyAds(user.id, activeTab);
            if (data) setAds(data as AdProps[]);
        } catch (error) {
            console.error("Erro ao carregar meus anúncios:", error);
        } finally {
            setLoading(false);
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadMyAds();
        } catch (error) {
            console.error("Erro ao atualizar meus anúncios:", error);
        } finally {
            setRefreshing(false);
        }
    }, [activeTab]);

    async function toggleStatus(id: string, currentStatus: string) {
        try {
            const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
            await AnunciosService.toggleAdStatus(id, newStatus);

            // Remove localmente da aba atual para evitar refresh visual total
            setAds(prev => prev.filter(ad => ad.id !== id));
        } catch (error) {
            console.error("Erro ao alterar status:", error);
            Alert.alert("Erro", "Não foi possível alterar o status do anúncio.");
        }
    }

    async function handleDeleteAd(item: AdProps) {
        // Bloqueio de segurança: Anúncios impulsionados ativos não podem ser excluídos
        if (item.impulsionado && item.impulsionado_ate) {
            const agora = new Date();
            const validade = new Date(item.impulsionado_ate);
            if (validade > agora) {
                Alert.alert(
                    "Ação Bloqueada",
                    "Anúncios impulsionados não podem ser excluídos enquanto estiverem em destaque. Você pode apenas pausá-los."
                );
                return;
            }
        }

        Alert.alert(
            "Excluir Anúncio",
            "Deseja realmente excluir este anúncio permanentemente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AnunciosService.deleteAd(item.id);

                            // Remove localmente para evitar refresh visual total
                            setAds(prev => prev.filter(ad => ad.id !== item.id));
                        } catch (error) {
                            console.error("Erro ao excluir anúncio:", error);
                            Alert.alert("Erro", "Não foi possível excluir o anúncio.");
                        }
                    }
                }
            ]
        );
    }

    const renderAdItem = ({ item }: { item: AdProps }) => {
        const isBoostedActive = item.impulsionado && item.impulsionado_ate && new Date(item.impulsionado_ate) > new Date();

        return (
            <View style={styleMyAds.adCard}>
                {item.status !== 'ativo' && !isBoostedActive && (
                    <TouchableOpacity
                        style={styleMyAds.deleteButton}
                        onPress={() => handleDeleteAd(item)}
                    >
                        <Icon name="delete-outline" size={22} color="#D32F2F" />
                    </TouchableOpacity>
                )}
                <View style={styleMyAds.cardMainInfo}>
                    <Image
                        source={{ uri: item.imagens?.[0] || 'https://via.placeholder.com/150' }}
                        style={styleMyAds.adImage}
                    />
                    <View style={[
                        styleMyAds.adDetails,
                        (item.status !== 'ativo' && !isBoostedActive) && { paddingRight: 40 }
                    ]}>
                        <Text style={styleMyAds.adTitle} numberOfLines={2}>
                            {item.titulo}
                        </Text>
                        <View style={styleMyAds.tagsWrapper}>
                            <View style={[
                                styleMyAds.tagContainer,
                                { backgroundColor: item.tipo === 'venda' ? '#E8F5E9' : '#E3F2FD' }
                            ]}>
                                <Text style={[
                                    styleMyAds.tagText,
                                    { color: item.tipo === 'venda' ? '#2D6A4F' : '#1976D2' }
                                ]}>
                                    {item.tipo}
                                </Text>
                            </View>

                            {item.impulsionado && (
                                <View style={[styleMyAds.tagContainer, styleMyAds.boostedTag]}>
                                    <Text style={[styleMyAds.tagText, styleMyAds.boostedTagText]}>
                                        Impulsionado
                                    </Text>
                                </View>
                            )}

                            {item.status === 'desativado' && (
                                <View style={[styleMyAds.tagContainer, { backgroundColor: '#FFF4E5' }]}>
                                    <Text style={[styleMyAds.tagText, { color: '#B7791F' }]}>
                                        Aguardando Pagamento
                                    </Text>
                                </View>
                            )}
                        </View>
                        {item.tipo === 'venda' ? (
                            <Text style={styleMyAds.priceText}>
                                R$ {item.preco.toFixed(2).replace('.', ',')}/kg
                            </Text>
                        ) : (
                            <Text style={styleMyAds.freeText}>Grátis</Text>
                        )}
                    </View>
                </View>

                <View style={styleMyAds.cardButtons}>
                    <TouchableOpacity
                        style={styleMyAds.actionButton}
                        onPress={() => navigation.navigate('CreateAd', { ad: item })}
                    >
                        <Icon name="edit" size={16} color="#4A4A4A" style={styleMyAds.actionButtonIcon} />
                        <Text style={styleMyAds.actionButtonText}>Editar</Text>
                    </TouchableOpacity>

                    {!isBoostedActive && item.tipo === 'venda' && (
                        <TouchableOpacity
                            style={[
                                styleMyAds.actionButton, 
                                { 
                                    backgroundColor: item.status === 'desativado' ? '#F5F5F5' : '#FDF2E9', 
                                    borderColor: item.status === 'desativado' ? '#E0E0E0' : '#E65100' 
                                }
                            ]}
                            disabled={item.status === 'desativado'}
                            onPress={() => navigation.navigate('BoostAd', { adData: item })}
                        >
                            <Icon 
                                name="bolt" 
                                size={16} 
                                color={item.status === 'desativado' ? '#A0A0A0' : '#E65100'} 
                                style={styleMyAds.actionButtonIconBoost} 
                            />
                            <Text style={[
                                styleMyAds.actionButtonText, 
                                { color: item.status === 'desativado' ? '#A0A0A0' : '#E65100' }
                            ]}>
                                Impulsionar
                            </Text>
                        </TouchableOpacity>
                    )}

                    {item.status !== 'desativado' && (
                        <TouchableOpacity
                            style={styleMyAds.actionButton}
                            onPress={() => toggleStatus(item.id, item.status)}
                        >
                            <Icon
                                name={item.status === 'ativo' ? "pause-circle-filled" : "play-circle-filled"}
                                size={18}
                                color={item.status === 'ativo' ? "#4A4A4A" : "#2D6A4F"}
                                style={styleMyAds.actionButtonIcon}
                            />
                            <Text style={[
                                styleMyAds.actionButtonText,
                                item.status !== 'ativo' && { color: '#2D6A4F' }
                            ]}>
                                {item.status === 'ativo' ? 'Pausar' : 'Reativar'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styleMyAds.container}>
            <View style={styleMyAds.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon name="menu" size={28} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styleMyAds.headerTitle}>Meus Anúncios</Text>
                <TouchableOpacity
                    style={styleMyAds.addButton}
                    onPress={() => navigation.navigate('CreateAd')}
                >
                    <Icon name="add" size={28} color="#2D6A4F" />
                </TouchableOpacity>
            </View>

            <View style={styleMyAds.toggleContainer}>
                <TouchableOpacity
                    style={[styleMyAds.toggleButton, activeTab === 'ativos' && styleMyAds.toggleButtonActive]}
                    onPress={() => setActiveTab('ativos')}
                >
                    <Text style={[styleMyAds.toggleText, activeTab === 'ativos' && styleMyAds.toggleTextActive]}>
                        Ativos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styleMyAds.toggleButton, activeTab === 'finalizados' && styleMyAds.toggleButtonActive]}
                    onPress={() => setActiveTab('finalizados')}
                >
                    <Text style={[styleMyAds.toggleText, activeTab === 'finalizados' && styleMyAds.toggleTextActive]}>
                        Finalizados
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styleMyAds.loadingContainer}>
                    <AdCardSkeleton isLarge={true} width="100%" />
                    <AdCardSkeleton isLarge={true} width="100%" />
                </View>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAdItem}
                    contentContainerStyle={[styleMyAds.listContent, { flexGrow: 1 }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<EmptyState />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2D6A4F']}
                            tintColor="#2D6A4F"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}
