import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native'; // Adicionado TouchableOpacity
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { CardStyle } from './style';
import { useNavigation } from '@react-navigation/native'; // Importado para navegação

interface AdCardProps {
    item: {
        id: string;
        titulo: string;
        preco: number;
        tipo: 'venda' | 'doação';
        imagens: string[];
        estado: string;
        cidade: string;
        impulsionado?: boolean;
    };
    isLarge?: boolean;
}

export const AdCard = ({ item, isLarge }: AdCardProps) => {
    const navigation = useNavigation<any>(); // Inicializando o hook de navegação

    // Pegamos apenas a primeira imagem do array
    const mainImage = item.imagens && item.imagens.length > 0 ? item.imagens[0] : null;

    // Função para deixar a primeira letra maiúscula (ex: manaus -> Manaus)
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    return (
        <TouchableOpacity
            activeOpacity={0.8} // Efeito visual de clique
            onPress={() => navigation.navigate('Detalhes', { adId: item.id })}
            style={isLarge ? CardStyle.cardLarge : CardStyle.cardSmall}
        >
            <View style={CardStyle.imageContainer}>
                {mainImage && (
                    <Image
                        source={{ uri: mainImage }}
                        style={isLarge ? CardStyle.imageLarge : CardStyle.imageSmall}
                    />
                )}

                {/* Badge de Venda ou Doação */}
                <View style={[
                    CardStyle.badge,
                    item.tipo === 'doação' && { backgroundColor: '#2D6A4F' }
                ]}>
                    <Text style={[
                        CardStyle.badgeText,
                        item.tipo === 'doação' && { color: '#FFFFFF' }
                    ]}>
                        {item.tipo ? item.tipo.toUpperCase() : 'VENDA'}
                    </Text>
                </View>
            </View>

            <View style={CardStyle.infoContainer}>
                {item.impulsionado && (
                    <View style={CardStyle.boostLabelWrapper}>
                        <Icon name="bolt" size={10} color="#E65100" />
                        <Text style={CardStyle.boostLabelAbove}>DESTAQUE</Text>
                    </View>
                )}
                <Text numberOfLines={1} style={CardStyle.adTitle}>
                    {item.titulo}
                </Text>

                {/* Localização */}
                <View style={CardStyle.locationRow}>
                    <Icon name="location-on" size={12} color="#666" />
                    <Text style={CardStyle.locationText} numberOfLines={1}>
                        {capitalize(item.cidade || 'Localização')} - {item.estado?.toUpperCase() || 'S/E'}
                    </Text>
                </View>

                <View style={CardStyle.priceRow}>
                    <Text style={CardStyle.priceText}>
                        {item.tipo === 'doação' ? 'GRÁTIS' : `R$ ${item.preco}/kg`}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};