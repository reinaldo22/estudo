import { View, Text, FlatList, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { styleHome } from "./styles";
import { supabase } from "@/services/supabase";
import { AdCard } from "@/components/cardAdd/AdCard";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AdCardSkeleton } from '@/components/Skeleton/Skeleton';
import { useRoute } from '@react-navigation/native';
import { EmptyState } from "@/components/EmptyStateComponent/EmptyState";
import { EmptySyle } from "@/components/EmptyStateComponent/style";


// 1. Atualize a interface aqui no topo da HomeScreen
interface AnuncioProps {
    id: string;
    titulo: string;
    preco: number;
    tipo: 'venda' | 'doação';
    imagens: string[];
    estado: string;   // <--- ADICIONE ESTA LINHA
    cidade: string;   // <--- ADICIONE ESTA LINHA
    distancia?: number; // (Pode manter como opcional se for usar no futuro)
}

interface CategoriaProps {
    id: string;
    nome: string;
    slug: string;
}

// Defina uma interface simples para a região
interface RegiaoProps {
    estado: string;
    cidade: string;
}

export function HomeScreen({ navigation }: any) {
    const route = useRoute();

    const [recentes, setRecentes] = useState<AnuncioProps[]>([]);
    const [recomendados, setRecomendados] = useState<AnuncioProps[]>([]);
    const [listaCategorias, setListaCategorias] = useState<CategoriaProps[]>([]);
    const [search, setSearch] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // NOVO ESTADO
    const [listaRegioes, setListaRegioes] = useState<RegiaoProps[]>([]);

    // Captura os filtros que vêm da FilterScreen
    const filtrosExtras = (route.params as any)?.filtros;

    // Função para buscar dados do Supabase (com filtro de Categoria e Busca)
    async function loadData(categoriaId?: string, filtrosExtra?: any) {
        setLoading(true); // Começa o carregamento

        // Debug: Veja no terminal o que está chegando do filtro
        try {
            const { data: dataRecentes } = await supabase
                .from('anuncios')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            let query = supabase.from('anuncios').select('*').eq('status', 'ativo');

            // 1. Filtro por Categoria (da barra horizontal)
            const catId = categoriaId || categoriaSelecionada;
            if (catId && catId !== 'tudo') {
                query = query.eq('id_categoria', catId);
            }
            // 2. Filtro por Texto da Busca (TextInput)
            if (search.trim() !== "") {
                query = query.ilike('titulo', `%${search}%`);
            }

            // 3. Filtros que vieram da Tela de Filtros (Estado, Cidade, Tipo, Preço)
            if (filtrosExtra) {
                if (filtrosExtra.tipo) query = query.eq('tipo', filtrosExtra.tipo);
                if (filtrosExtra.estado) query = query.ilike('estado', `%${filtrosExtra.estado}%`);
                if (filtrosExtra.cidade) query = query.ilike('cidade', `%${filtrosExtra.cidade}%`);

                if (filtrosExtra.tipo !== 'doação') {
                    if (filtrosExtra.precoMin && filtrosExtra.precoMin > 0) {
                        query = query.gte('preco', filtrosExtra.precoMin);
                    }
                    if (filtrosExtra.precoMax && filtrosExtra.precoMax > 0) {
                        query = query.lte('preco', filtrosExtra.precoMax);
                    }
                }
            }

            const { data: dataRecomendados } = await query;

            if (dataRecentes) setRecentes(dataRecentes as AnuncioProps[]);
            if (dataRecomendados) setRecomendados(dataRecomendados as AnuncioProps[]);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false); // Finaliza o carregamento
        }
    }

    async function fetchCategorias() {
        try {
            const cachedCats = await AsyncStorage.getItem('@categorias_cache');

            if (cachedCats !== null) {
                const parsed = JSON.parse(cachedCats);
                setListaCategorias(parsed);
                if (parsed.length > 0 && !categoriaSelecionada) {
                    setCategoriaSelecionada(parsed[0].id);
                }
                return;
            }

            const { data } = await supabase
                .from('categorias')
                .select('*')
                .eq('ativo', true)
                .order('nome', { ascending: true });

            if (data) {
                setListaCategorias(data as CategoriaProps[]);
                await AsyncStorage.setItem('@categorias_cache', JSON.stringify(data));
                if (data.length > 0) setCategoriaSelecionada(data[0].id);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchRegioes() {
        try {
            const cached = await AsyncStorage.getItem('@regioes_cache');
            if (cached) setListaRegioes(JSON.parse(cached));

            // Adicionamos o <RegiaoProps> aqui também para o Supabase entender
            const { data } = await supabase.from('localidades_ativas').select('*');

            if (data) {
                // Agora o TypeScript aceita o setListaRegioes(data) sem reclamar
                setListaRegioes(data as RegiaoProps[]);
                await AsyncStorage.setItem('@regioes_cache', JSON.stringify(data));
            }
        } catch (e) {
            console.warn("Erro ao buscar regiões:", e);
        }
    }

    // Efeito para carregar as categorias uma única vez ao abrir o app
    // 1. Efeito de Inicialização (Roda apenas quando o App abre)
    useEffect(() => {
        async function prepararApp() {
            // Carrega as categorias e as regiões em paralelo para ser mais rápido
            await Promise.all([
                fetchCategorias(),
                fetchRegioes()
            ]);

            // Após carregar as configurações, busca os primeiros anúncios
            loadData(categoriaSelecionada || undefined, filtrosExtras);
        }

        prepararApp();
    }, []); // [] significa que só executa uma vez ao montar o componente

    // Efeito principal: recarrega os dados se a categoria ou os filtros mudarem
    // 2. Efeito de Reação (Roda sempre que o usuário interage com filtros ou categorias)
    useEffect(() => {
        // Só dispara se não for a primeira carga (para não repetir o que o init já faz)
        // Mas o React lida bem com isso, então podemos manter simples:
        loadData(categoriaSelecionada || undefined, filtrosExtras);
    }, [categoriaSelecionada, filtrosExtras]);
    // ^ O segredo está aqui: sempre que essas variáveis mudarem, a lista atualiza sozinha.

    return (
        <ScrollView style={styleHome.container} showsVerticalScrollIndicator={false}>
            {/* 1. Header */}
            <View style={styleHome.header}>

                {/* ESTE É O BOTÃO QUE ABRE O DRAWER */}
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon name="menu" size={28} color="#000" />
                </TouchableOpacity>

                <Text style={styleHome.logo}>EcoMarket</Text>
                <TouchableOpacity>
                    <Icon name="notifications-none" size={28} color="#000" />
                </TouchableOpacity>
            </View>

            {/* 2. Barra de Busca e Filtro (Correção da Estrutura) */}
            <View style={styleHome.searchContainer}>
                <View style={styleHome.searchBar}>
                    <Icon name="search" size={22} color="#999" />
                    <TextInput
                        placeholder="O que você procura?"
                        style={styleHome.searchInput}
                        value={search}
                        onChangeText={(text) => setSearch(text)}
                        placeholderTextColor="#999"
                        onSubmitEditing={() => loadData(categoriaSelecionada || 'tudo')}
                    />
                </View>

                <TouchableOpacity
                    style={styleHome.filterButton}
                    onPress={() => navigation.navigate('FilterScreen', {
                        regioes: listaRegioes // Passando a lista que buscamos no fetchRegioes
                    })}
                >
                    <Icon name="tune" size={24} color="#2D6A4F" />
                </TouchableOpacity>
            </View>

            {/* 3. Barra de Categorias */}
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
                            onPress={() => {
                                setCategoriaSelecionada(item.id);
                                loadData(item.id);
                            }}
                        >
                            <Text style={[
                                styleHome.categoryText,
                                isSelected && styleHome.categoryTextSelected
                            ]}>
                                {item.nome}
                            </Text>
                            {isSelected && <View style={styleHome.selectedIndicator} />}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* 4. Seção de Recentes */}
            <View style={styleHome.sectionHeader}>
                <Text style={styleHome.sectionTitle}>Anúncios Recentes</Text>
                <TouchableOpacity>
                    <Text style={styleHome.viewAll}>VER TUDO</Text>
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
                    renderItem={({ item }) => <AdCard item={item} isLarge={true} />}
                    showsHorizontalScrollIndicator={false}
                />
            )}

            {/* 5. Seção de Recomendados */}
            <View style={styleHome.sectionHeader}>
                <Text style={styleHome.sectionTitle}>Recomendados para Você</Text>
            </View>

            <View style={styleHome.gridContainer}>
                {loading ? (
                    // 1. Enquanto carrega, mostra os Skeletons
                    <>
                        <AdCardSkeleton isLarge={false} />
                        <AdCardSkeleton isLarge={false} />
                        <AdCardSkeleton isLarge={false} />
                        <AdCardSkeleton isLarge={false} />
                    </>
                ) : recomendados.length > 0 ? (
                    // 2. Se carregou e tem anúncios, mostra o mapa de cards
                    recomendados.map((item) => (
                        <AdCard key={item.id} item={item} isLarge={false} />
                    ))
                ) : (
                    <EmptyState /> // Seu componente com emoji triste
                    // 3. Se carregou e a lista veio vazia (Filtro não encontrou nada)
                    // <View style={EmptySyle.emptyContainer}>
                    //     <Icon name="sentiment-dissatisfied" size={80} color="#CCC" />
                    //     <Text style={EmptySyle.emptyTitle}>Não encontramos o que procura</Text>
                    //     <Text style={EmptySyle.emptySubtitle}>
                    //         Tente ajustar os filtros ou pesquisar por outro termo.
                    //     </Text>

                    //     {/* Botão extra para facilitar a vida do usuário */}
                    //     <TouchableOpacity
                    //         style={EmptySyle.resetFilterButton}
                    //         onPress={() => loadData('tudo', null)}
                    //     >
                    //         <Text style={EmptySyle.resetFilterText}>Limpar Filtros</Text>
                    //     </TouchableOpacity>
                    // </View>
                )}
            </View>
        </ScrollView>
    );
}