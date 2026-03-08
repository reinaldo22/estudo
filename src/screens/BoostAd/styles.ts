import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 180, // Aumentado para dar mais espaço final e não ficar atrás da barra fixa
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        letterSpacing: 1,
        marginBottom: 15,
        textTransform: 'uppercase',
    },

    // Ad Preview Card
    adCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    adImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    adInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    adTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    adPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D6A4F',
        marginBottom: 8,
    },
    adLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adLocationText: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
    },

    // Why Boost Section
    whyBoostContainer: {
        backgroundColor: '#F0FAF5',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    whyBoostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    whyBoostTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A4D35',
        marginLeft: 10,
    },
    benefitRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    benefitIcon: {
        marginTop: 2,
    },
    benefitTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    benefitTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    benefitDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },

    // Plans Section
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    planCardSelected: {
        borderColor: '#2D6A4F',
        backgroundColor: '#F7FCF9',
    },
    planInfo: {
        flex: 1,
    },
    planTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
        maxWidth: 130, // Força a quebra de linha conforme o design
    },
    planDescription: {
        fontSize: 12,
        color: '#8E8E93',
    },
    planPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D6A4F',
    },
    badgeContainer: {
        backgroundColor: '#2D6A4F',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        marginLeft: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
    },
    bestValueContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },

    // Payment Section
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    paymentIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F0FAF5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentInfo: {
        flex: 1,
        marginLeft: 15,
    },
    paymentTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    paymentSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 35 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    payButton: {
        flexDirection: 'row',
        backgroundColor: '#2D6A4F',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#2D6A4F',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    }
});
