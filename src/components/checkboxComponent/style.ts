import { StyleSheet } from 'react-native';

export const StyleCheckBox = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },
    circle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#2D6A4F',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    label: {
        fontSize: 14,
        color: '#718096',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
    },
    checked: {
        backgroundColor: '#2D6A4F',
    },
    innerPoint: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF',
    },

})