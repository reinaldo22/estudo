import { EmptySyle } from "./style";
import React from 'react';
import { View, Text } from 'react-native';
// Exemplo de uma função simples para renderizar o estado vazio
import { MaterialIcons as Icon } from '@expo/vector-icons';

export const EmptyState = () => (
    <View style={EmptySyle.emptyContainer}>
        <Icon name="sentiment-dissatisfied" size={80} color="#CCC" />
        <Text style={EmptySyle.emptyTitle}>Nenhum anúncio encontrado</Text>
        <Text style={EmptySyle.emptySubtitle}>
            Tente ajustar seus filtros ou pesquisar por outro termo.
        </Text>
    </View>
);