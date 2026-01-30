import { StyleSheet } from 'react-native';

export const StyleRegister = StyleSheet.create({
    container: {

        backgroundColor: '#F8F9F5',
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        height: 60,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3748',
        fontFamily: 'sans-serif',

    },
    backButton: {
        position: 'absolute',
        left: 0,
        zIndex: 10,
        padding: 10,
        bottom: 2
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
    },
    iconBox: {
        width: 80,
        height: 80,
        backgroundColor: '#E6F4EA',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },

    mainTitle: {
        fontSize: 27,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 10,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
    },
    inputWrapper: {
        flexDirection: 'column',
        marginTop: 20,
        marginBottom: 8,
        width: '100%'
    },
    label: {
        fontSize: 13,
        color: '#718096',
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 5,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
        height: '100%',
    },

    button: {
        backgroundColor: '#2D6A4F',
        flexDirection: 'row',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        elevation: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    errorText: {
        color: '#E53E3E',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 18,
        fontWeight: '500',
    },
});