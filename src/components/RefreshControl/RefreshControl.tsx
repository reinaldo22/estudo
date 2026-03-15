import React from 'react';
import { RefreshControl } from 'react-native';

interface RefreshControlComponentProps {
    refreshing: boolean;
    onRefresh: () => void;
}

/**
 * Componente reutilizável para Pull-to-Refresh.
 * Pode ser usado em ScrollView ou FlatList.
 */
export function RefreshControlComponent({ refreshing, onRefresh }: RefreshControlComponentProps) {
    return (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2D6A4F']} // Cores para Android
            tintColor="#2D6A4F"   // Cor para iOS
            title="Atualizando..."  // Texto opcional (iOS)
            titleColor="#2D6A4F"
        />
    );
}
