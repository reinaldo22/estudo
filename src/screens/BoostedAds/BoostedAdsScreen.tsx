import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { AdCard } from '@/components/cardAdd/AdCard';
import { styleBoosted } from './styles';

interface AnuncioProps {
    id: string;
    titulo: string;
    preco: number;
    tipo: 'venda' | 'doação';
    imagens: string[];
    estado: string;
    cidade: string;
}

export function BoostedAdsScreen({ navigation }: any) {
    const [ads, setAds] = useState<AnuncioProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoostedAds();
    }, []);

    async function fetchBoostedAds() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('anuncios')
                .select('*')
                .eq('status', 'ativo')
                .eq('impulsionado', true)
                .gt('impulsionado_ate', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setAds(data as AnuncioProps[]);
        } catch (error) {
            console.error("Erro ao carregar anúncios impulsionados:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styleBoosted.container}>
            <View style={styleBoosted.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styleBoosted.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styleBoosted.headerTitle}>Anúncios Impulsionados</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styleBoosted.loadingContainer}>
                    <ActivityIndicator size="large" color="#2D6A4F" />
                </View>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styleBoosted.cardWrapper}>
                            <AdCard item={item} />
                        </View>
                    )}
                    contentContainerStyle={styleBoosted.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styleBoosted.emptyContainer}>
                            <Ionicons name="megaphone-outline" size={60} color="#CCC" />
                            <Text style={styleBoosted.emptyText}>Nenhum anúncio impulsionado no momento.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
