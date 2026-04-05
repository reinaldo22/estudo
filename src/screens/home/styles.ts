import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styleHome = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 50, // Ajuste dependendo do entalhe (notch) do seu celular
        marginBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 25,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    viewAll: {
        fontSize: 12,
        color: "#666",
        fontWeight: "600",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 30, // Espaço extra no final para o scroll
    },
    categoryItem: {
        marginRight: 25, // Espaçamento entre os nomes das categorias
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 14,
        color: "#999", // Cor cinza para itens não selecionados
        fontWeight: "500",
    },
    categoriesContainer: {
        paddingVertical: 15,
        marginBottom: 10,
    },
    categoryTextSelected: {
        color: "#1A1A1A", // Cor preta para o item selecionado
        fontWeight: "bold",
    },
    selectedIndicator: {
        height: 2,
        backgroundColor: "#1A1A1A",
        marginTop: 4,
        width: "60%", // A linha embaixo do nome selecionado
    },
    // No seu styles.ts
    searchContainer: {
        flexDirection: 'row', // Coloca um ao lado do outro
        alignItems: 'center', // Alinha verticalmente no centro
        width: '100%',
        marginTop: 15,
        marginBottom: 10,
    },
    searchBar: {
        flex: 1, // Faz a barra de busca ocupar todo o espaço disponível
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    filterButton: {
        marginLeft: 12,
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative', // ADICIONE ISSO para o badge não flutuar errado
    },
    loadMoreButton: {
        backgroundColor: '#E8F5E9', // Um verde bem clarinho
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2D6A4F',
    },
    loadMoreText: {
        color: '#2D6A4F',
        fontWeight: 'bold',
        fontSize: 16,
    },
    menuButton: {
        padding: 5,
    },
    filterActiveBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E8F5E9', // Verde bem clarinho
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    filterActiveText: {
        fontSize: 13,
        color: '#2D6A4F',
        fontWeight: '600',
    },
    clearFilterText: {
        fontSize: 13,
        color: '#D32F2F', // Vermelho para ação de apagar
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },

    // ESTADO VAZIO
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 16,
    },

    // CARD (Exemplo básico)
    card: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginTop: 15,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },

    filterButtonActive: {
        backgroundColor: '#2D6A4F',
    },
    // O pontinho indicador
    filterBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFD700',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    loginHeaderButton: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#D4EBE0',
    },
});