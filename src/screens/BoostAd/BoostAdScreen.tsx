import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from './styles';
import ImpulsionamentosService, { BoostPlan } from '@/services/ImpulsionamentosService';

interface BoostAdScreenProps {
    navigation: any;
    route: any;
}

export function BoostAdScreen({ navigation, route }: BoostAdScreenProps) {
    const { adData } = route.params || {};
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [plans, setPlans] = useState<BoostPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const mappedPlans = await ImpulsionamentosService.getBoostPlans();

            if (mappedPlans.length > 0) {
                setPlans(mappedPlans);

                // Select the first plan by default or the one that is best value
                const defaultPlan = mappedPlans.find(p => p.bestValue) || mappedPlans[0];
                if (defaultPlan) {
                    setSelectedPlan(defaultPlan.id);
                }
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentPlan = plans.find(p => p.id === selectedPlan);

    const handlePay = () => {
        const adId = adData?.id || adData?.ad_id;

        if (!adId) {
            console.error('ID do anúncio ausente no handlePay:', adData);
            Alert.alert('Erro', 'Não foi possível identificar o anúncio. Por favor, tente novamente.');
            return;
        }

        navigation.navigate('PixPayment', {
            adData: {
                ...adData,
                id: adId // Garante que o ID vá com a chave correta
            },
            planData: currentPlan
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Impulsionar Anúncio</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Selected Ad Section */}
                <Text style={styles.sectionLabel}>Anúncio Selecionado</Text>
                <View style={styles.adCard}>
                    <Image
                        source={{ uri: adData?.imagens?.[0] || adData?.images?.[0] || 'https://via.placeholder.com/150' }}
                        style={styles.adImage}
                    />
                    <View style={styles.adInfo}>
                        <Text style={styles.adTitle} numberOfLines={1}>
                            {adData?.titulo || adData?.title || 'Título do Anúncio'}
                        </Text>
                        <Text style={styles.adPrice}>
                            {adData?.preco || adData?.price ? `R$ ${adData.preco || adData.price} /kg` : 'Sob consulta'}
                        </Text>
                        <View style={styles.adLocationRow}>
                            <Ionicons name="location-sharp" size={14} color="#8E8E93" />
                            <Text style={styles.adLocationText}>
                                {adData?.cidade || adData?.city}, {(adData?.estado || adData?.state)?.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Why Boost Section */}
                <View style={styles.whyBoostContainer}>
                    <View style={styles.whyBoostHeader}>
                        <Ionicons name="sparkles" size={20} color="#16B37B" />
                        <Text style={styles.whyBoostTitle}>Por que impulsionar?</Text>
                    </View>

                    <View style={styles.benefitRow}>
                        <View style={[styles.benefitIcon, { backgroundColor: '#2D6A4F', borderRadius: 12, padding: 4 }]}>
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                        <View style={styles.benefitTextContainer}>
                            <Text style={styles.benefitTitle}>Sempre no topo</Text>
                            <Text style={styles.benefitDescription}>
                                Seu anúncio ganha prioridade máxima nas buscas.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.benefitRow}>
                        <View style={[styles.benefitIcon, { backgroundColor: '#2D6A4F', borderRadius: 12, padding: 4 }]}>
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                        <View style={styles.benefitTextContainer}>
                            <Text style={styles.benefitTitle}>3× mais visualizações</Text>
                            <Text style={styles.benefitDescription}>
                                Alcance coletores e empresas de reciclagem rapidamente.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.benefitRow}>
                        <View style={[styles.benefitIcon, { backgroundColor: '#2D6A4F', borderRadius: 12, padding: 4 }]}>
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                        <View style={styles.benefitTextContainer}>
                            <Text style={styles.benefitTitle}>Venda mais rápido</Text>
                            <Text style={styles.benefitDescription}>
                                Anúncios impulsionados vendem em média 2 dias antes.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Choose Plan Section */}
                <Text style={styles.sectionLabel}>Escolha um plano</Text>

                {isLoading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#666' }}>Carregando planos...</Text>
                    </View>
                ) : plans.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#666' }}>Nenhum plano disponível no momento.</Text>
                    </View>
                ) : (
                    plans.map(plan => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planCard,
                                selectedPlan === plan.id && styles.planCardSelected
                            ]}
                            onPress={() => setSelectedPlan(plan.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.planInfo}>
                                <View style={styles.bestValueContainer}>
                                    <Text style={styles.planTitle}>{plan.title}</Text>
                                    {plan.bestValue && (
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>MELHOR VALOR</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.planDescription}>{plan.description}</Text>
                            </View>
                            <Text style={styles.planPrice}>{plan.priceLabel}</Text>
                        </TouchableOpacity>
                    ))
                )}

                {/* Payment Method Section */}
                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Método de Pagamento</Text>
                <TouchableOpacity style={styles.paymentCard} activeOpacity={0.7}>
                    <View style={styles.paymentIconContainer}>
                        <MaterialCommunityIcons name="qrcode-scan" size={20} color="#16B37B" />
                    </View>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>PIX</Text>
                        <Text style={styles.paymentSubtitle}>Pagamento instantâneo</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total a pagar:</Text>
                    <Text style={styles.totalValue}>{currentPlan?.priceLabel}</Text>
                </View>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePay}
                    activeOpacity={0.8}
                >
                    <Ionicons name="flash" size={18} color="#FFF" />
                    <Text style={styles.payButtonText}>Pagar e Impulsionar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
