import { StyleSheet, Dimensions } from 'react-native';

export const styleModal = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Escurece o fundo
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 25,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    closeButton: {
        backgroundColor: '#F5F5F5',
        padding: 5,
        borderRadius: 20,
    },
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    alterarFotoText: { color: '#2D6A4F', fontWeight: 'bold', marginTop: 10, fontSize: 12 },
    form: { marginBottom: 30 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#999', marginBottom: 10, letterSpacing: 0.5 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F9F7',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 55,
        marginBottom: 20,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: '#333', fontSize: 15 },
    saveButton: {
        backgroundColor: '#2D6A4F',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    avatarContainer: {
        position: 'relative',
        width: 100,  // Adicione a mesma largura da imagem
        height: 100, // Adicione a mesma altura da imagem
        alignItems: 'center',
        justifyContent: 'center',
    },


    // Adicione ou atualize estas classes no seu styleModal.ts:


avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0', // Cor de fundo caso a imagem falhe
    overflow: 'hidden',         // Garante que a imagem fique redonda
    borderWidth: 1,
    borderColor: '#E0E0E0',
},

avatar: { width: 100, height: 100, borderRadius: 60, borderWidth: 3, borderColor: '#26962f' },


cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2D6A4F',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 5,               // Sombra no Android
    zIndex: 10,                 // Garante que o ícone fique por cima
},
});