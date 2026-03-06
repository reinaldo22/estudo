import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const DrawerStyle = StyleSheet.create({
    // Container do topo (Fundo cinza claro do design)
    headerContainer: {
        backgroundColor: '#F4F7F6',
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Estilo para quando não está logado
    loginPrompt: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
    },
    loginAvatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    // Avatar do usuário logado
    avatar: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    memberSince: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 2,
    },
    loginSub: {
        fontSize: 12,
        color: '#2D6A4F',
    },
    // Área dos itens do menu (Lista)
    menuItemsContainer: {
        flex: 1,
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    // Rodapé
    footerContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 30,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E74C3C', // Vermelho do design
        marginLeft: 20,
    },
});