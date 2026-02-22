import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styleProfile = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 160,
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', letterSpacing: 1 },
    avatarSection: { alignItems: 'center', marginTop: 20 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#26962f' },
    verifiedBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#2D6A4F',
        borderRadius: 12,
        padding: 2,
        borderWidth: 2,
        borderColor: '#FFF'
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginTop: 15 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    locationText: { color: '#666', marginLeft: 4, fontSize: 14 },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 30
    },
    statCard: {
        backgroundColor: '#F9FBF9',
        width: (width - 60) / 3,
        paddingVertical: 20,
        borderRadius: 25,
        alignItems: 'center',
    },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#2D6A4F' },
    statLabel: { fontSize: 10, color: '#666', marginTop: 5, textAlign: 'center' },
    statSubLabel: { fontSize: 10, color: '#666', textAlign: 'center' },
    sectionContainer: { marginTop: 40, paddingHorizontal: 20 },
    sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#999', marginBottom: 15, letterSpacing: 1 },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F7F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    menuTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#333' },
    memberSince: { textAlign: 'center', color: '#999', marginTop: 30, fontSize: 12 },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 10
    },
    logoutText: { color: '#E74C3C', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }
});