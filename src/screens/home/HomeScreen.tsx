import { View, Text, FlatList, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { styleHome } from "./styles";
import { supabase } from "@/services/supabase";
import { AdCard } from "@/components/cardAdd/AdCard";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AnuncioProps {
    id: string;
    titulo: string;
    preco: number;
    tipo: 'venda' | 'doação';
    imagens: string[];
    distancia?: number;
}

interface CategoriaProps {
    id: string;
    nome: string;
    slug: string;
}

export function HomeScreen({ navigation }: any) {
    const [recentes, setRecentes] = useState<AnuncioProps[]>([]);
    const [recomendados, setRecomendados] = useState<AnuncioProps[]>([]);
    const [listaCategorias, setListaCategorias] = useState<CategoriaProps[]>([]);
    const [search, setSearch] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);

    // Função para buscar dados do Supabase (com filtro de Categoria e Busca)
    async function loadData(categoriaId?: string) {
        // 1. Busca anúncios recentes
        const { data: dataRecentes } = await supabase
            .from('anuncios')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // 2. Prepara a query de recomendados
        let query = supabase.from('anuncios').select('*').eq('status', 'ativo');

        // Filtro por ID de categoria
        if (categoriaId && categoriaId !== 'tudo') {
            query = query.eq('id_categoria', categoriaId);
        }

        // Filtro por Texto da Busca
        if (search.trim() !== "") {
            query = query.ilike('titulo', `%${search}%`);
        }

        const { data: dataRecomendados } = await query;

        if (dataRecentes) setRecentes(dataRecentes as AnuncioProps[]);
        if (dataRecomendados) setRecomendados(dataRecomendados as AnuncioProps[]);
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

    useEffect(() => {
        async function init() {
            await fetchCategorias();
            await loadData();
        }
        init();
    }, []);

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

                <TouchableOpacity style={styleHome.filterButton}>
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

            <FlatList
                horizontal
                data={recentes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AdCard item={item} isLarge={true} />}
                showsHorizontalScrollIndicator={false}
            />

            {/* 5. Seção de Recomendados */}
            <View style={styleHome.sectionHeader}>
                <Text style={styleHome.sectionTitle}>Recomendados para Você</Text>
            </View>

            <View style={styleHome.gridContainer}>
                {recomendados.map((item) => (
                    <AdCard key={item.id} item={item} isLarge={false} />
                ))}
            </View>
        </ScrollView>
    );
}