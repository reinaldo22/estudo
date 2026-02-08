import React from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CardStyle } from './style'; // Certifique-se de que o nome no style.js é CardStyle

export const AdCard = ({ item, isLarge }) => {
    // Pegamos apenas a primeira imagem do array de no máximo 5
    const mainImage = item.imagens && item.imagens.length > 0 ? item.imagens[0] : null;

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
                <View style={CardStyle.badge}>
                    <Text style={CardStyle.badgeText}>
                        {item.tipo ? item.tipo.toUpperCase() : 'VENDA'}
                    </Text>
                </View>
            </View>

            <View style={CardStyle.infoContainer}>
                <Text numberOfLines={1} style={CardStyle.adTitle}>
                    {item.titulo}
                </Text>

                <View style={CardStyle.priceRow}>
                    <Text style={CardStyle.priceText}>
                        {item.preco === 0 ? 'GRÁTIS' : `R$ ${item.preco}/kg`}
                    </Text>
                </View>

                {/* Localização aparece apenas no card grande (Recentes) conforme seu design */}
                {isLarge && (
                    <View style={CardStyle.locationRow}>
                        <Icon name="location-on" size={14} color="#999" />
                        <Text style={CardStyle.locationText}>
                            {item.distancia}km de distância
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};