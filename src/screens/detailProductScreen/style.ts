import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styleDetail = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Fundo levemente cinza para destacar os cards brancos
    },
    // --- ÁREA DA IMAGEM ---
    imageContainer: {
        width: width,
        height: 350,
        backgroundColor: '#E0E0E0',
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 8,
        borderRadius: 20,
        elevation: 4,
    },
    headerActions: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 8,
        borderRadius: 20,
        marginLeft: 10,
        elevation: 4,
    },
    imageCounter: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
    },
    counterText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // --- CONTEÚDO ---
    content: {
        padding: 20,
        marginTop: -20, // Sobrepõe levemente a imagem para um efeito moderno
        backgroundColor: '#F8F9FA',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#2D6A4F',
        fontSize: 10,
        fontWeight: 'bold',
    },
    timeAgo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: '#999',
        fontSize: 12,
    },
    location: {
        color: '#666',
        fontSize: 13,
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 20,
    },

    // --- CARDS DE PREÇO ---
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    priceCard: {
        flex: 0.48,
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        elevation: 2,
    },
    activePrice: {
        borderColor: '#2D6A4F',
        borderWidth: 2,
    },
    priceLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    priceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D6A4F',
    },
    unit: {
        fontSize: 12,
        color: '#666',
        fontWeight: 'normal',
    },

    // --- ATRIBUTOS TÉCNICOS (Specs) ---
    specsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    specItem: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 12,
        marginHorizontal: 4,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 1,
    },
    specLabel: {
        fontSize: 9,
        color: '#999',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    specValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },

    // --- DESCRIÇÃO ---
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 25,
    },

    // --- VENDEDOR ---
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 15,
        elevation: 2,
        marginBottom: 20,
    },
    sellerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25, // Para ficar redondo
        backgroundColor: '#DDD', // Ajuda a visualizar se a imagem falhar
        marginRight: 12,
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    sellerRating: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    profileButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    profileButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2D6A4F',
    },

    // --- RODAPÉ FIXO ---
    footer: {
        position: 'absolute',
        bottom: 0,
        width: width,
        backgroundColor: '#FFF',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 35 : 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        flexDirection: 'row',
    },
    messageButton: {
        flex: 1,
        backgroundColor: '#2D6A4F',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 55,
        borderRadius: 12,
        elevation: 3,
    },
    messageButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});