import { StyleSheet, Dimensions } from 'react-native';

export const EmptySyle = StyleSheet.create({
    // emptyContainer: {
    //     flex: 1,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     paddingVertical: 50, // Dá um espaço para não grudar no título
    //     width: '100%',
    // },
    // emptyTitle: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     color: '#4A4A4A',
    //     marginTop: 10,
    // },
    // emptySubtitle: {
    //     fontSize: 14,
    //     color: '#999',
    //     textAlign: 'center',
    //     marginTop: 5,
    //     paddingHorizontal: 20,
    // },
    emptyContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 30,
        marginTop: 5,
    },
    resetFilterButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#2D6A4F',
        borderRadius: 8,
    },
    resetFilterText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});