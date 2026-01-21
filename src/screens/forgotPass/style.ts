import { StyleSheet } from 'react-native';


export const ResetPasswordStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9F5', // Um fundo claro como na imagem
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 10,
    },

    header: {
        marginBottom: 20,
        marginTop: 50,

    },

    logoContainer: {
        alignItems: 'flex-start', // Garante que o ícone vá para a esquerda ⬅️
        marginBottom: 30,
        marginTop: 30
    },
    iconBox: {
        width: 60,
        height: 60,
        backgroundColor: '#E9F5EE', // Aquele verde clarinho do fundo do ícone
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,            // Melhora a leitura do texto longo 📖
    },
    content: {
    marginTop: 30,             // Afasta o bloco de texto do ícone da folha ⬆️
    marginBottom: 35,          // Cria um espaço confortável antes do input ⬇️
},
form: {
        width: '100%',             // Garante que o formulário use a largura total disponível
        marginTop: 10,             // Pequeno ajuste para separar do subtítulo
    },
}) 