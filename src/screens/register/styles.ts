import { StyleSheet } from 'react-native';

export const StyleRegister = StyleSheet.create({
    container: {

        backgroundColor: '#F8F9F5', // Um fundo claro como na imagem
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centraliza o conteúdo
        marginTop: 50, // Espaço para a barra de status
        height: 80,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        left: 10,
        position: 'static',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
    },
    iconBox: {
        width: 80,
        height: 80,
        backgroundColor: '#E6F4EA', // Verde bem clarinho 🍃
        borderRadius: 25, // Cantos arredondados
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',    // A seta "flutua" e não empurra o texto
        left: 20,                // Fixa a seta na esquerda
        top: 30,                 // Alinha verticalmente com o text
    },
    mainTitle: {
        fontSize: 27,         // Um tamanho bem grande para destaque 
        fontWeight: '400',   // O negrito que você escolheu
        color: '#000000',     // Preto puro
        textAlign: 'center',
        marginBottom: 10,     // Espaço entre o título e o subtítulo
    },
    content: {
        alignItems: 'center', // Garante que tudo no corpo fique centralizado
        paddingHorizontal: 30, // Dá um respiro nas laterais para o texto não tocar as bordas
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',     // Aquele cinza suave que conversamos ☁️
        textAlign: 'center',
        lineHeight: 24,       // Aumenta o espaço entre as linhas para facilitar a leitura
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
        marginBottom: 8,  // ↕️ Isso cria um pequeno espaço entre a label e a caixa branca dela
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
        backgroundColor: '#2D6A4F', // O verde escuro da folha 🍃
        flexDirection: 'row',       // Ícone e texto lado a lado
        height: 60,
        borderRadius: 30,           // Metade da altura para ser totalmente arredondado
        justifyContent: 'center',   // Centraliza horizontalmente
        alignItems: 'center',       // Centraliza verticalmente
        marginTop: 30,
        shadowColor: '#000',        // Sombra para dar profundidade
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        elevation: 5,               // Sombra no Android
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,            // Espaço antes da seta
    },
    errorText: {
        color: '#E53E3E', // Um tom de vermelho vibrante 🔴
        fontSize: 12,     // Menor que a label (13) para criar hierarquia
        marginTop: 4,     // Pequeno espaço após a caixa branca
        marginLeft: 18,   // Alinhado com o início do texto dentro da caixa
        fontWeight: '500',
    },
});