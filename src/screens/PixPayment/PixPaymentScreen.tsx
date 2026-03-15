import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    Platform,
    Alert,
    Share,
    ActivityIndicator,
    Animated,
    Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { styles } from './styles';
import PaymentsService from '@/services/PaymentsService';

interface PixPaymentScreenProps {
    navigation: any;
    route: any;
}

export function PixPaymentScreen({ navigation, route }: PixPaymentScreenProps) {
    const { adData, planData } = route.params || {};
    const [pixCode, setPixCode] = useState<string>("");
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isProcessing) {
            startSpin();
        } else {
            spinValue.setValue(0);
        }
    }, [isProcessing]);

    const startSpin = () => {
        spinValue.setValue(0);
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        generatePix();
    }, []);

    useEffect(() => {
        let subscription: any;
        let timeout: NodeJS.Timeout;

        if (isProcessing && paymentId) {
            console.log('Iniciando escuta Realtime para pagamento:', paymentId);

            // Timeout de 10 segundos
            timeout = setTimeout(() => {
                if (isProcessing) {
                    setIsProcessing(false);
                    Alert.alert(
                        'Processando...',
                        'Seu pagamento está sendo processado. Você pode acompanhar o status na tela "Meus Anúncios". Assim que confirmado, seu anúncio será ativado automaticamente.',
                        [{ text: 'Ver Meus Anúncios', onPress: () => navigation.navigate('Drawer', { screen: 'MyAds' }) }]
                    );
                }
            }, 10000);

            subscription = PaymentsService.subscribeToPaymentStatus(paymentId, (status) => {
                console.log('Mudança de status detectada:', status);
                if (status === 'CONFIRMED' || status === 'RECEIVED') {
                    if (timeout) clearTimeout(timeout);
                    handlePaymentSuccess();
                } else if (status === 'OVERDUE' || status === 'REFUNDED' || status === 'CANCELLED') {
                    if (timeout) clearTimeout(timeout);
                    setIsProcessing(false);
                    setPaymentError(status === 'OVERDUE' ? 'Tempo de expiração excedido' : 'O pagamento foi cancelado ou estornado');
                }
            });
        }

        return () => {
            if (subscription) {
                PaymentsService.unsubscribeFromPaymentStatus(subscription);
            }
            if (timeout) clearTimeout(timeout);
        };
    }, [isProcessing, paymentId]);

    const generatePix = async () => {
        try {
            setIsLoading(true);
            setPaymentError(null);
            setIsSuccess(false);

            const adId = adData?.id || adData?.ad_id;
            const planId = planData?.id;

            if (!adId || !planId) {
                console.error('Dados ausentes no PixPayment:', {
                    adData,
                    planData,
                    extractedAdId: adId,
                    extractedPlanId: planId
                });
                throw new Error("Não foi possível identificar o anúncio ou o plano selecionado. Volte e tente novamente.");
            }

            const data = await PaymentsService.generatePixPayment(adId, planId);

            if (data.success) {
                setPixCode(data.pixCode);
                setQrCodeBase64(data.encodedImage);
                setPaymentId(data.paymentId);
            } else {
                console.error('[PixPaymentScreen] Erro retornado pela API via PixService:', data);
                throw new Error("Erro ao gerar PIX");
            }
        } catch (error: any) {
            console.error('[PixPaymentScreen] Erro ao gerar PIX:', error);

            let errorMessage = "Tente novamente.";
            if (error.context?.json?.error) {
                errorMessage = error.context.json.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert(
                'Erro',
                `Não foi possível gerar o código PIX: ${errorMessage}`,
                [{ text: 'Voltar', onPress: () => navigation.goBack() }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (!pixCode) return;
        await Clipboard.setStringAsync(pixCode);
        Alert.alert('Sucesso', 'Código PIX copiado para a área de transferência!');
    };

    const handleConfirmPayment = () => {
        setIsProcessing(true);
        // Opcional: Adicionar um timeout manual caso o Realtime demore muito
        // setTimeout(() => {
        //     if (isProcessing) {
        //         setIsProcessing(false);
        //         setPaymentError('Não conseguimos confirmar seu pagamento a tempo. Tente novamente.');
        //     }
        // }, 60000);
    };

    const handlePaymentSuccess = () => {
        setIsProcessing(false);
        setIsSuccess(true);
    };

    const handleRetry = () => {
        setPaymentError(null);
        setIsProcessing(false);
        generatePix();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#16B37B" />
                <Text style={{ marginTop: 16, color: '#666', fontFamily: 'Inter_500Medium' }}>
                    Gerando seu QR Code PIX...
                </Text>
            </SafeAreaView>
        );
    }

    if (isSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Drawer', { screen: 'Home' })}
                    >
                        <Ionicons name="close" size={28} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Confirmação</Text>
                </View>

                <ScrollView
                    contentContainerStyle={[styles.processingContainer, { paddingTop: 40, paddingBottom: 40 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.successIconContainer}>
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark" size={48} color="#FFF" />
                        </View>
                        <View style={styles.boltBadge}>
                            <MaterialCommunityIcons name="lightning-bolt" size={18} color="#FFF" />
                        </View>
                    </View>

                    <Text style={styles.processingTitle}>Pagamento Confirmado!</Text>
                    <Text style={[styles.processingSubtitle, { marginBottom: 40 }]}>
                        Seu pagamento via PIX foi recebido com sucesso. O vendedor já foi notificado e o seu pedido está em processamento.
                    </Text>

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryInfo}>
                            <Text style={styles.summaryLabel}>RESUMO DA TRANSAÇÃO</Text>
                            <Text style={styles.summaryValue}>{planData?.priceLabel || 'R$ 0,00'}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="calendar-outline" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                                <Text style={styles.summaryDate}>
                                    {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                        {(adData?.imagens?.[0] || adData?.images?.[0]) && (
                            <Image
                                source={{ uri: adData.imagens?.[0] || adData.images?.[0] }}
                                style={styles.summaryImage}
                            />
                        )}
                    </View>

                    <View style={styles.protectionBox}>
                        <Ionicons name="shield-checkmark" size={24} color="#2D6A4F" />
                        <Text style={styles.protectionText}>
                            Sua transação está protegida pelo <Text style={styles.protectionHighlight}>EcoMarket Secure</Text>. O valor só será liberado ao vendedor após a entrega.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => navigation.navigate('Drawer', { screen: 'MyAds' })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>Ir para Meus Anúncios</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Drawer', { screen: 'Home' })}
                    >
                        <Text style={styles.secondaryButtonText}>Voltar para a Home</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (paymentError) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />

                {/* Close Button */}
                <TouchableOpacity
                    style={{ padding: 20, paddingTop: 10 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={28} color="#1A1A1A" />
                </TouchableOpacity>

                <View style={[styles.processingContainer, { paddingTop: 20 }]}>
                    <View style={styles.errorIconContainer}>
                        <View style={styles.errorIconCircle}>
                            <Ionicons name="alert" size={32} color="#FFF" />
                        </View>
                    </View>

                    <Text style={styles.errorTitle}>Ops! Algo deu errado.</Text>
                    <Text style={styles.errorSubtitle}>
                        Não conseguimos confirmar o seu pagamento via PIX neste momento.
                    </Text>

                    <View style={styles.errorCard}>
                        <View style={styles.errorCardRow}>
                            <Text style={styles.errorCardLabel}>VALOR</Text>
                            <Text style={styles.errorCardValue}>{planData?.priceLabel || 'R$ 0,00'}</Text>
                        </View>

                        <View style={styles.errorCardDivider} />

                        <View style={styles.errorCardRow}>
                            <Text style={styles.errorCardLabel}>MOTIVO</Text>
                            <Text style={styles.errorCardValue}>{paymentError}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.supportContainer}>
                        <Text style={styles.supportText}>Precisa de ajuda? Fale com o suporte</Text>
                        <MaterialCommunityIcons name="export-variant" size={18} color="#2D6A4F" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (isProcessing) {
        return (
            <SafeAreaView style={styles.processingContainer}>
                <StatusBar barStyle="dark-content" />

                <View style={styles.spinnerWrapper}>
                    <Animated.View style={[styles.spinnerProgress, { transform: [{ rotate: spin }] }]} />
                    <View style={styles.walletIconContainer}>
                        <MaterialCommunityIcons name="wallet-outline" size={32} color="#2D6A4F" />
                    </View>
                </View>

                <Text style={styles.processingTitle}>Processando Pagamento...</Text>
                <Text style={styles.processingSubtitle}>
                    Estamos validando sua transação via PIX. Isso pode levar alguns segundos.
                </Text>

                <TouchableOpacity
                    style={{ marginTop: 40 }}
                    onPress={() => setIsProcessing(false)}
                >
                    <Text style={{ color: '#2D6A4F', fontWeight: 'bold' }}>Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pagamento via PIX</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Total Section */}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total a pagar</Text>
                    <Text style={styles.totalValue}>{planData?.priceLabel || 'R$ 0,00'}</Text>
                </View>

                {/* QR Code Card */}
                <View style={styles.qrCard}>
                    <View style={styles.qrBorder}>
                        <View style={styles.qrPlaceholder}>
                            {qrCodeBase64 ? (
                                <Image
                                    source={{ uri: `data:image/png;base64,${qrCodeBase64}` }}
                                    style={styles.qrImage}
                                />
                            ) : (
                                <Image
                                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${pixCode}&color=16B37B` }}
                                    style={styles.qrImage}
                                />
                            )}
                        </View>
                    </View>

                    <Text style={styles.qrInstructionTitle}>Aponte a câmera para escanear</Text>
                    <Text style={styles.qrInstructionText}>
                        Abra o app do seu banco e escolha a opção PIX para pagar com QR Code.
                    </Text>
                </View>

                {/* Pix Copia e Cola Section */}
                <View style={styles.pixSection}>
                    <Text style={styles.pixLabel}>PIX Copia e Cola</Text>
                    <View style={styles.pixCodeContainer}>
                        <Text style={styles.pixCodeText} numberOfLines={2}>
                            {pixCode}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={handleCopyCode}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="content-copy" size={20} color="#2D6A4F" />
                        <Text style={styles.copyButtonText}>Copiar Código</Text>
                    </TouchableOpacity>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#2D6A4F" />
                    <Text style={styles.infoText}>
                        O pagamento é processado pelo Asaas. Após concluir no seu banco, o status do anúncio será atualizado automaticamente em instantes.
                    </Text>
                </View>
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmPayment}
                    activeOpacity={0.8}
                >
                    <Text style={styles.confirmButtonText}>Já fiz o pagamento</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
