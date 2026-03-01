import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { adActions } from './Actions'; // Suas novas funções
import { styleDetail } from './style';

const { width } = Dimensions.get('window');

export function AdDetail() {
    const route = useRoute();
    const navigation = useNavigation();
    const { adId } = route.params as { adId: string };

    // Estados
    const [loading, setLoading] = useState(true);
    const [ad, setAd] = useState<any>(null);
    const [fotoAtual, setFotoAtual] = useState(1);
    const [isFavorito, setIsFavorito] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAdDetails() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) setUserId(user.id);

                const { data: adData } = await supabase
                    .from('anuncios')
                    .select(`
                        *,
                        profile (
                            full_name,
                            avatar_url,
                            rating,
                            phone
                        )
                    `)
                    .eq('id', adId)
                    .single();

                if (adData) setAd(adData);

                if (user) {
                    const { data: favData } = await supabase
                        .from('favoritos')
                        .select('id')
                        .eq('ad_id', adId)
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (favData) setIsFavorito(true);
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAdDetails();
    }, [adId]);

    if (loading || !ad) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2D6A4F" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styleDetail.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* 1. CARROSSEL DE IMAGENS */}
                <View style={styleDetail.imageContainer}>
                    {ad?.imagens && ad.imagens.length > 0 ? (
                        <FlatList
                            data={ad.imagens}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, index) => index.toString()}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setFotoAtual(index + 1);
                            }}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: width, height: 350, resizeMode: 'cover' }}
                                />
                            )}
                        />
                    ) : (
                        <View style={[styleDetail.mainImage, { width: width, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' }]}>
                            <Icon name="image-not-supported" size={40} color="#CCC" />
                        </View>
                    )}

                    <TouchableOpacity style={styleDetail.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Ações de Topo Refatoradas */}
                    <View style={styleDetail.headerActions}>

                        {/* { <TouchableOpacity 
                            style={styleDetail.actionButton}
                            onPress={() => adActions.compartilhar(ad)} // <-- Função Externa
                        >
                            <Icon name="share" size={24} color="#000" />
                        </TouchableOpacity> } */}

                        <TouchableOpacity
                            style={styleDetail.actionButton}
                            onPress={() => adActions.toggleFavorito(adId, userId, isFavorito, setIsFavorito)} // <-- Função Externa
                        >
                            <Icon
                                name={isFavorito ? "favorite" : "favorite-border"}
                                size={24}
                                color={isFavorito ? "#E63946" : "#000"}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styleDetail.imageCounter}>
                        <Text style={styleDetail.counterText}>{fotoAtual}/{ad?.imagens?.length || 0}</Text>
                    </View>
                </View>

                {/* 2. CONTEÚDO */}
                <View style={styleDetail.content}>
                    <View style={styleDetail.statusRow}>
                        <View style={styleDetail.statusBadge}><Text style={styleDetail.statusText}>DISPONÍVEL</Text></View>
                        <View style={styleDetail.timeAgo}>
                            <Icon name="access-time" size={14} color="#999" />
                            <Text style={styleDetail.timeText}>
                                {ad?.created_at && ` Postado ${formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: ptBR })}`}
                            </Text>
                        </View>
                    </View>

                    <Text style={styleDetail.location}>
                        <Icon name="location-on" size={14} color="#666" />
                        {` ${ad?.cidade || 'Cidade'}, ${ad?.estado?.toUpperCase() || 'UF'}`}
                    </Text>

                    <Text style={styleDetail.title}>{ad.titulo}</Text>

                    {/* Preços */}
                    <View style={styleDetail.priceContainer}>
                        <View style={[styleDetail.priceCard, ad.tipo === 'venda' && styleDetail.activePrice]}>
                            <Text style={styleDetail.priceLabel}>PARA VENDA</Text>
                            <Text style={styleDetail.priceValue}>R$ {ad.preco?.toFixed(2)} <Text style={styleDetail.unit}>/kg</Text></Text>
                        </View>
                        <View style={[styleDetail.priceCard, ad.tipo === 'doação' && styleDetail.activePrice, { opacity: ad.tipo === 'doação' ? 1 : 0.5 }]}>
                            <Text style={styleDetail.priceLabel}>PARA DOAÇÃO</Text>
                            <Text style={styleDetail.priceValue}>Grátis</Text>
                        </View>
                    </View>

                    {/* Atributos */}
                    <View style={styleDetail.specsRow}>
                        <View style={styleDetail.specItem}><Text style={styleDetail.specLabel}>PESO</Text><Text style={styleDetail.specValue}>{ad.peso || 'N/A'} kg</Text></View>
                        <View style={styleDetail.specItem}><Text style={styleDetail.specLabel}>PUREZA</Text><Text style={styleDetail.specValue}>{ad.pureza || 'N/A'}%</Text></View>
                        <View style={styleDetail.specItem}><Text style={styleDetail.specLabel}>EMBALAGEM</Text><Text style={styleDetail.specValue}>{ad.embalagem || 'N/A'}</Text></View>
                    </View>

                    <Text style={styleDetail.descriptionTitle}>Descrição</Text>
                    <Text style={styleDetail.descriptionText}>{ad.descricao || 'Sem descrição informada.'}</Text>

                    {/* Perfil */}
                    <View style={styleDetail.sellerCard}>
                        <Image
                            source={{ uri: ad?.profile?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                            style={styleDetail.sellerAvatar}
                        />
                        <View style={styleDetail.sellerInfo}>
                            <Text style={styleDetail.sellerName}>{ad?.profile?.full_name || 'Usuário EcoMarket'}</Text>
                            <Text style={styleDetail.sellerRating}>⭐ {ad?.profile?.rating?.toFixed(1) || '5.0'} (Avaliações)</Text>
                        </View>
                        <TouchableOpacity style={styleDetail.profileButton}>
                            <Text style={styleDetail.profileButtonText}>Ver Perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* BOTÃO FIXO Refatorado */}
            <View style={styleDetail.footer}>
                <TouchableOpacity
                    style={styleDetail.messageButton}
                    activeOpacity={0.8}
                    onPress={() => adActions.abrirWhatsApp(ad?.profile?.phone, ad?.profile?.full_name, ad?.titulo)} // <-- Função Externa
                >
                    <Icon name="chat" size={20} color="#FFF" />
                    <Text style={styleDetail.messageButtonText}> Enviar Mensagem</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}