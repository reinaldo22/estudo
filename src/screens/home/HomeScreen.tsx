import { View, Text, FlatList, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { styleHome } from "./styles";
import { supabase } from "@/services/supabase";
import { AdCard } from "@/components/cardAdd/AdCard";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { AdCardSkeleton } from '@/components/Skeleton/Skeleton';
import { useRoute } from '@react-navigation/native';
import { EmptyState } from "@/components/EmptyStateComponent/EmptyState";

// Interfaces mantidas conforme seu original
interface AnuncioProps {
    id: string;
    titulo: string;
    preco: number;
    tipo: 'venda' | 'doação';
    imagens: string[];
    estado: string;
    cidade: string;
}

interface CategoriaProps {
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

    // --- LÓGICA DE FILTRO ATUALIZADA ---
    // Como você usa filtrosExtra = (route.params as any)?.filtros, buscamos aqui:
    const filtrosSalvos = params?.filtros;

    // O botão só ativa se houver algum valor dentro do objeto 'filtros'
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
    const [listaRegioes, setListaRegioes] = useState<RegiaoProps[]>([]);
    const [pagina, setPagina] = useState(0);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [temMais, setTemMais] = useState(true);
    const ITENS_POR_PAGINA = 4;

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
                const { data: dataRecentes } = await supabase
                    .from('anuncios')
                    .select('*')
                    .eq('status', 'ativo')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (dataRecentes) setRecentes(dataRecentes as AnuncioProps[]);
            }

            let query = supabase.from('anuncios').select('*').eq('status', 'ativo');

            const catId = categoriaId || categoriaSelecionada;
            if (catId && catId !== 'tudo') {
                query = query.eq('categoria_id', catId);
            }

            if (search.trim() !== "") {
                query = query.ilike('titulo', `%${search}%`);
            }

            if (filtrosExtra) {
                if (filtrosExtra.tipo && filtrosExtra.tipo !== 'todos') query = query.eq('tipo', filtrosExtra.tipo);
                if (filtrosExtra.estado) query = query.ilike('estado', `%${filtrosExtra.estado}%`);
                if (filtrosExtra.cidade) query = query.ilike('cidade', `%${filtrosExtra.cidade}%`);
                if (filtrosExtra.precoMin) query = query.gte('preco', parseFloat(filtrosExtra.precoMin));
                if (filtrosExtra.precoMax) query = query.lte('preco', parseFloat(filtrosExtra.precoMax));
            }

            const paginaAtual = isMore ? pagina + 1 : 0;
            const offset = paginaAtual * ITENS_POR_PAGINA;
            const limite = offset + ITENS_POR_PAGINA - 1;

            const { data, error } = await query
                .range(offset, limite)
                .order('created_at', { ascending: false });

            if (error) throw error;

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
            const { data } = await supabase.from('categorias').select('*').eq('ativo', true).order('nome', { ascending: true });
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
            const { data } = await supabase.from('localidades_ativas').select('*');
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

    useEffect(() => {
        if (categoriaSelecionada) {
            loadData(categoriaSelecionada, filtrosSalvos); // Usando filtrosSalvos aqui
        }
    }, [categoriaSelecionada, filtrosSalvos]);

    return (
        <ScrollView style={styleHome.container} showsVerticalScrollIndicator={false}>
            {/* 1. Header */}
            <View style={styleHome.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon name="menu" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styleHome.logo}>EcoMarket</Text>
                <TouchableOpacity>
                    <Icon name="notifications-none" size={28} color="#000" />
                </TouchableOpacity>
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
                        temFiltroAtivo && styleHome.filterButtonActive // Muda a cor no seu style.ts
                    ]}
                    onPress={() => navigation.navigate('FilterScreen', {
                        regioes: listaRegioes,
                        filtrosAtuais: filtrosSalvos // Envia os filtros para a tela de filtro "lembrar"
                    })}
                >
                    <Icon
                        name="tune"
                        size={24}
                        color={temFiltroAtivo ? "#FFF" : "#2D6A4F"} // Muda a cor do ícone
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

            {/* Listagens de Cards (Recentes e Recomendados) seguem seu padrão... */}
            <View style={styleHome.sectionHeader}>
                <Text style={styleHome.sectionTitle}>Anúncios Recentes</Text>
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
                    renderItem={({ item }) => <AdCard item={item} isLarge={true} />}
                    showsHorizontalScrollIndicator={false}
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
                        <AdCard key={item.id} item={item} isLarge={false} />
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
        </ScrollView>
    );
}