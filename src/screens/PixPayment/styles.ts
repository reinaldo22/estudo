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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    totalContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    totalLabel: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    totalValue: {
        fontSize: 42,
        fontWeight: '800',
        color: '#1A1A1A',
    },

    // QR Code Section
    qrCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    qrBorder: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#D4EBE0',
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    qrPlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    qrInstructionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    qrInstructionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },

    // Pix Copia e Cola
    pixSection: {
        marginBottom: 30,
    },
    pixLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    pixCodeContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    pixCodeText: {
        fontSize: 12,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    copyButton: {
        flexDirection: 'row',
        backgroundColor: '#E8F5E9',
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    copyButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D6A4F',
        marginLeft: 8,
    },

    // Info Box
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0FAF5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 40,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1A4D35',
        marginLeft: 12,
        lineHeight: 18,
    },

    // Bottom Bar
    bottomBar: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    confirmButton: {
        backgroundColor: '#2D6A4F',
        width: '100%',
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#2D6A4F',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },

    // Processing View Styles
    processingContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    spinnerWrapper: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },

    spinnerProgress: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 6,
        borderColor: '#2D6A4F',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: [{ rotate: '45deg' }],
    },
    walletIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#F0FAF5',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 16,
    },
    processingSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 24,
    },

    // Error View Styles
    errorIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#FFF5F5',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    errorIconCircle: {
        width: 60,
        height: 60,
        backgroundColor: '#FF4D4D',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
    },
    errorSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    errorCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    errorCardRow: {
        marginBottom: 20,
    },
    errorCardLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    errorCardValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    errorCardDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2D6A4F',
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
    supportContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingBottom: 20,
    },
    supportText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D6A4F',
        marginRight: 6,
    },

    // Success View Styles
    successIconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F0FAF5',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    successIconCircle: {
        width: 80,
        height: 80,
        backgroundColor: '#2D6A4F',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    boltBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 32,
        height: 32,
        backgroundColor: '#2D6A4F',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#F0FAF5',
    },
    summaryCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        width: '100%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryInfo: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D6A4F',
        marginBottom: 4,
    },
    summaryDate: {
        fontSize: 14,
        color: '#8E8E93',
    },
    summaryImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        marginLeft: 16,
    },
    protectionBox: {
        flexDirection: 'row',
        backgroundColor: '#F0FAF5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D4EBE0',
    },
    protectionText: {
        flex: 1,
        fontSize: 13,
        color: '#1A4D35',
        marginLeft: 12,
        lineHeight: 18,
    },
    protectionHighlight: {
        fontWeight: '700',
    },
    secondaryButton: {
        marginTop: 20,
        padding: 10,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8E8E93',
    }
});
