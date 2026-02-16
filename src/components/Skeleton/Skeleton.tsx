import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const AdCardSkeleton = ({ isLarge }: { isLarge?: boolean }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={isLarge ? styles.cardLarge : styles.cardSmall}>
            {/* Espaço da Imagem */}
            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
            
            <View style={styles.infoContainer}>
                {/* Linha do Título */}
                <Animated.View style={[styles.lineTitle, { opacity }]} />
                {/* Linha do Preço */}
                <Animated.View style={[styles.linePrice, { opacity }]} />
                
                {isLarge && (
                    <Animated.View style={[styles.lineLocation, { opacity }]} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardSmall: { width: '48%', marginBottom: 15, borderRadius: 12, backgroundColor: '#FFF', overflow: 'hidden' },
    cardLarge: { width: 280, marginRight: 15, borderRadius: 12, backgroundColor: '#FFF', overflow: 'hidden' },
    imagePlaceholder: { width: '100%', height: 120, backgroundColor: '#E1E9EE' },
    infoContainer: { padding: 10 },
    lineTitle: { width: '80%', height: 12, backgroundColor: '#E1E9EE', borderRadius: 4, marginBottom: 8 },
    linePrice: { width: '40%', height: 12, backgroundColor: '#E1E9EE', borderRadius: 4, marginBottom: 8 },
    lineLocation: { width: '60%', height: 10, backgroundColor: '#E1E9EE', borderRadius: 4 },
});