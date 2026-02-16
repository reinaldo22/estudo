import React from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CardStyle } from './style'; 

interface AdCardProps {
  item: {
    id: string;
    titulo: string;
    preco: number;
    tipo: 'venda' | 'doação';
    imagens: string[];
    estado: string;
    cidade: string;
  };
  isLarge?: boolean;
}

export const AdCard = ({ item, isLarge }: AdCardProps) => {
    // Pegamos apenas a primeira imagem do array
    const mainImage = item.imagens && item.imagens.length > 0 ? item.imagens[0] : null;
    
    // Função para deixar a primeira letra maiúscula (ex: manaus -> Manaus)
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    return (
        <View style={isLarge ? CardStyle.cardLarge : CardStyle.cardSmall}>
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
                    // Se for doação, aplica o fundo verde claro que você escolheu
                    item.tipo === 'doação' && { backgroundColor: '#2D6A4F' }
                ]}>
                    <Text style={[
                        CardStyle.badgeText,
                        // Se for doação, forçamos o texto a ser branco para não sumir no verde
                        item.tipo === 'doação' && { color: '#FFFFFF' }
                    ]}>
                        {item.tipo ? item.tipo.toUpperCase() : 'VENDA'}
                    </Text>
                </View>
            </View>

            <View style={CardStyle.infoContainer}>
                <Text numberOfLines={1} style={CardStyle.adTitle}>
                    {item.titulo}
                </Text>

                {/* Localização - Agora visível em todos ou apenas no Large, dependendo do seu estilo */}
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
        </View>
    );
};