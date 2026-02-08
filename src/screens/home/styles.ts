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
        marginLeft: 12, // Espaçamento entre a barra e o ícone
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 12,
        // Sombra para dar profundidade (estilo Material Design)
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});