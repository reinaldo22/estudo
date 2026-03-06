import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2; // Para o grid de 2 colunas

export const CardStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    logo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 15,
        alignItems: 'center',
        height: 50,
        marginBottom: 20,
    },

    // --- Seções ---
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    viewAll: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
    },

    // --- Card Grande (Anúncios Recentes) ---
    cardLarge: {
        width: width * 0.75,
        marginRight: 15,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    imageLarge: {
        width: '100%',
        height: 250,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
    },

    // --- Card Pequeno (Grid Recomendados) ---
    cardSmall: {
        width: '48%',           // Em vez de Dimensions, use porcentagem para facilitar
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 15,       // Espaço entre a linha de cima e a de baixo
        // Adicione uma sombra leve para destacar os cards entre si
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageSmall: {
        width: '100%',
        height: 160,
        borderRadius: 10,
        backgroundColor: '#E0E0E0',
    },

    // --- Elementos Internos do Card ---
    badge: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
    },
    adTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 8,
        color: '#1A1A1A',
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D6A4F', // O verde do seu design
        marginTop: 2,
    },
    freeText: {
        color: '#40916C',
        fontWeight: 'bold',
    },
    // No seu arquivo style.js
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 2,
    },
    locationText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 2,
    },
    imageContainer: {
        position: 'relative', // Necessário para o Badge ficar por cima da imagem
    },
    infoContainer: {
        paddingVertical: 10,
        paddingHorizontal: 5, // Dá um leve respiro nas laterais do texto
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    boostBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#FF9800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    boostBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFF',
        marginLeft: 2,
    },
    boostLabelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    boostLabelAbove: {
        fontSize: 9,
        fontWeight: '900',
        color: '#E65100',
        marginLeft: 2,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
})