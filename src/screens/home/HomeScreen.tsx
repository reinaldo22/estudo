import { View, Text, FlatList, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { styleHome } from "./styles";
import { supabase } from "@/services/supabase";
import CategoriasService from "@/services/CategoriasService";
import AnunciosService from "@/services/AnunciosService";
import { AdCard } from "@/components/cardAdd/AdCard";
import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { AdCardSkeleton } from '@/components/Skeleton/Skeleton';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { EmptyState } from "@/components/EmptyStateComponent/EmptyState";
import { AuthModal } from "@/components/AuthModal/AuthModal";
import { RefreshControlComponent } from "@/components/RefreshControl/RefreshControl";

// Interfaces mantidas conforme seu original
export interface AnuncioProps {
    id: string;
    titulo: string;
    preco: number;
    tipo: 'venda' | 'doação';
    imagens: string[];
    estado: string;
    cidade: string;
    impulsionado: boolean;
    impulsionado_ate: string;
}

export interface CategoriaProps {
    id: string;
    nome: string;
    slug: string;
}

interface RegiaoProps {
    estado: string;
    cidade: string;
}

export function HomeScreen({ navigation }: any) {
    const route = useRoute();
    const params = route.params as any;

    const filtrosSalvos = params?.filtros;

    const temFiltroAtivo = !!(
        filtrosSalvos?.precoMin ||
        filtrosSalvos?.precoMax ||
        filtrosSalvos?.tipo ||
        filtrosSalvos?.estado ||
        filtrosSalvos?.cidade
    );

    const [recentes, setRecentes] = useState<AnuncioProps[]>([]);
    const [recomendados, setRecomendados] = useState<AnuncioProps[]>([]);
    const [listaCategorias, setListaCategorias] = useState<CategoriaProps[]>([]);
    const [search, setSearch] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [listaRegioes, setListaRegioes] = useState<RegiaoProps[]>([]);
    const [pagina, setPagina] = useState(0);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [temMais, setTemMais] = useState(true);
    const ITENS_POR_PAGINA = 4;

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Verifica o estado inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });

        // Ouve mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Funções de carregamento mantidas
    async function loadData(categoriaId?: string, filtrosExtra?: any, isMore = false) {
        if (isMore) {
            setCarregandoMais(true);
        } else {
            setLoading(true);
            setPagina(0);
        }

        try {
            if (!isMore) {
                const dataRecentes = await AnunciosService.getBoostedAds(5);
                if (dataRecentes) setRecentes(dataRecentes as AnuncioProps[]);
            }

            const catId = categoriaId || categoriaSelecionada;
            
            const paginaAtual = isMore ? pagina + 1 : 0;
            const offset = paginaAtual * ITENS_POR_PAGINA;
            const limite = offset + ITENS_POR_PAGINA - 1;

            const data = await AnunciosService.getAds(offset, limite, catId, search, filtrosExtra);

            if (data) {
                if (isMore) {
                    setRecomendados(prev => [...prev, ...data]);
                    setPagina(paginaAtual);
                } else {
                    setRecomendados(data as AnuncioProps[]);
                }
                setTemMais(data.length === ITENS_POR_PAGINA);
            }

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
            setCarregandoMais(false);
        }
    }

    async function fetchCategorias() {
        try {
            const cachedCats = await AsyncStorage.getItem('@categorias_cache');
            if (cachedCats !== null) {
                const parsed = JSON.parse(cachedCats);
                setListaCategorias(parsed);
                if (parsed.length > 0 && !categoriaSelecionada) setCategoriaSelecionada(parsed[0].id);
                return;
            }
            const data = await CategoriasService.getCategorias();
            if (data) {
                setListaCategorias(data as CategoriaProps[]);
                await AsyncStorage.setItem('@categorias_cache', JSON.stringify(data));
                if (!categoriaSelecionada) setCategoriaSelecionada(data[0].id);
            }
        } catch (e) { console.error(e); }
    }

    async function fetchRegioes() {
        try {
            const cached = await AsyncStorage.getItem('@regioes_cache');
            if (cached) setListaRegioes(JSON.parse(cached));
            const data = await AnunciosService.getRegioes();
            if (data) {
                setListaRegioes(data as RegiaoProps[]);
                await AsyncStorage.setItem('@regioes_cache', JSON.stringify(data));
            }
        } catch (e) { console.warn(e); }
    }

    useEffect(() => {
        fetchCategorias();
        fetchRegioes();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData(categoriaSelecionada || 'tudo', filtrosSalvos);
        }, [categoriaSelecionada, filtrosSalvos])
    );

    async function handleAdPress(adId: string) {
        if (isLoggedIn) {
            navigation.navigate('Detalhes', { adId });
        } else {
            setShowAuthModal(true);
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                loadData(categoriaSelecionada || 'tudo', filtrosSalvos),
                fetchCategorias(),
                fetchRegioes()
            ]);
        } catch (error) {
            console.error("Erro ao atualizar home:", error);
        } finally {
            setRefreshing(false);
        }
    }, [categoriaSelecionada, filtrosSalvos]);

    return (
        <ScrollView 
            style={styleHome.container} 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#2D6A4F']}
                    tintColor="#2D6A4F"
                    progressViewOffset={50}
                />
            }
        >
            {/* 1. Header */}
            <View style={styleHome.header}>
                {isLoggedIn ? (
                    <>
                        <TouchableOpacity onPress={() => navigation.openDrawer()}>
                            <Icon name="menu" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styleHome.logo}>EcoMarket</Text>
                        <TouchableOpacity>
                            <Icon name="notifications-none" size={28} color="#000" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* Botão de menu escondido quando deslogado */}
                        <View style={{ width: 28 }} />
                        <Text style={styleHome.logo}>EcoMarket</Text>
                        <View style={{ width: 28 }} />
                    </>
                )}
            </View>

            {/* 2. Barra de Busca e Filtro Atualizada */}
            <View style={styleHome.searchContainer}>
                <View style={styleHome.searchBar}>
                    <Icon name="search" size={22} color="#999" />
                    <TextInput
                        placeholder="O que você procura?"
                        style={styleHome.searchInput}
                        value={search}
                        onChangeText={(text) => setSearch(text)}
                        onSubmitEditing={() => loadData(categoriaSelecionada || 'tudo', filtrosSalvos)}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styleHome.filterButton,
                        temFiltroAtivo && styleHome.filterButtonActive
                    ]}
                    onPress={() => navigation.navigate('FilterScreen', {
                        regioes: listaRegioes,
                        filtrosAtuais: filtrosSalvos
                    })}
                >
                    <Icon
                        name="tune"
                        size={24}
                        color={temFiltroAtivo ? "#FFF" : "#2D6A4F"}
                    />
                    {temFiltroAtivo && <View style={styleHome.filterBadge} />}
                </TouchableOpacity>
            </View>

            {/* Categorias */}
            <FlatList
                horizontal
                data={listaCategorias}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                style={styleHome.categoriesContainer}
                renderItem={({ item }) => {
                    const isSelected = categoriaSelecionada === item.id;
                    return (
                        <TouchableOpacity
                            style={styleHome.categoryItem}
                            onPress={() => setCategoriaSelecionada(item.id)}
                        >
                            <Text style={[styleHome.categoryText, isSelected && styleHome.categoryTextSelected]}>
                                {item.nome}
                            </Text>
                            {isSelected && <View style={styleHome.selectedIndicator} />}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Anúncios Impulsionados */}
            <View style={styleHome.sectionHeader}>
                <Text style={styleHome.sectionTitle}>Anúncios Impulsionados</Text>
                <TouchableOpacity onPress={() => navigation.navigate('BoostedAds')}>
                    <Text style={styleHome.viewAll}>Ver mais</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flexDirection: 'row', paddingLeft: 15 }}>
                    <AdCardSkeleton isLarge={true} />
                    <AdCardSkeleton isLarge={true} />
                </View>
            ) : (
                <FlatList
                    horizontal
                    data={recentes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AdCard
                            item={item}
                            isLarge={true}
                            onPress={() => handleAdPress(item.id)}
                        />
                    )}
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={<EmptyState />}
                />
            )}

            <View style={styleHome.sectionHeader}>
                <Text style={styleHome.sectionTitle}>Recomendados para Você</Text>
            </View>

            <View style={styleHome.gridContainer}>
                {loading ? (
                    <>
                        <AdCardSkeleton isLarge={false} /><AdCardSkeleton isLarge={false} />
                    </>
                ) : recomendados.length > 0 ? (
                    recomendados.map((item) => (
                        <AdCard
                            key={item.id}
                            item={item}
                            isLarge={false}
                            onPress={() => handleAdPress(item.id)}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </View>

            {temMais && recomendados.length > 0 && (
                <TouchableOpacity
                    style={styleHome.loadMoreButton}
                    onPress={() => loadData(categoriaSelecionada || undefined, filtrosSalvos, true)}
                    disabled={carregandoMais}
                >
                    {carregandoMais ? <ActivityIndicator color="#2D6A4F" /> : <Text style={styleHome.loadMoreText}>Carregar mais anúncios</Text>}
                </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />

            <AuthModal
                isVisible={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLogin={() => {
                    setShowAuthModal(false);
                    navigation.navigate('Login');
                }}
                onRegister={() => {
                    setShowAuthModal(false);
                    navigation.navigate('Register');
                }}
            />
        </ScrollView>
    );
}