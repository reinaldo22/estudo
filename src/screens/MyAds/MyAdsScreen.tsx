import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/services/supabase';
import { AdCard } from '@/components/cardAdd/AdCard';
import { EmptyState } from '@/components/EmptyStateComponent/EmptyState';
import { AdCardSkeleton } from '@/components/Skeleton/Skeleton';
import { styleMyAds } from './style';

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

            // Mapeamos a aba para o status no banco
            let query = supabase
                .from('anuncios')
                .select('*')
                .eq('user_id', user.id);

            if (activeTab === 'ativos') {
                query = query.eq('status', 'ativo');
            } else {
                query = query.in('status', ['vendido', 'inativo']);
            }

            // Ordenação por Impulsionados primeiro, depois por mais recentes
            query = query
                .order('impulsionado', { ascending: false })
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            if (data) setAds(data as AdProps[]);
        } catch (error) {
            console.error("Erro ao carregar meus anúncios:", error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleStatus(id: string, currentStatus: string) {
        try {
            const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
            const { error } = await supabase
                .from('anuncios')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

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
                            const { error } = await supabase
                                .from('anuncios')
                                .delete()
                                .eq('id', item.id);

                            if (error) throw error;

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
                        <Icon name="edit" size={18} color="#4A4A4A" />
                        <Text style={styleMyAds.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styleMyAds.actionButton}
                        onPress={() => toggleStatus(item.id, item.status)}
                    >
                        <Icon
                            name={item.status === 'ativo' ? "pause-circle-filled" : "play-circle-filled"}
                            size={18}
                            color={item.status === 'ativo' ? "#4A4A4A" : "#2D6A4F"}
                        />
                        <Text style={[
                            styleMyAds.actionButtonText,
                            item.status !== 'ativo' && { color: '#2D6A4F' }
                        ]}>
                            {item.status === 'ativo' ? 'Pausar' : 'Reativar'}
                        </Text>
                    </TouchableOpacity>
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
                    contentContainerStyle={styleMyAds.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<EmptyState />}
                />
            )}
        </SafeAreaView>
    );
}
