import { StyleSheet } from 'react-native';

export const styleFilter = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 40
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    clearText: { color: '#E74C3C', fontWeight: 'bold' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
    row: { flexDirection: 'row', marginBottom: 10 },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DDD',
        marginRight: 10
    },
    chipSelected: { backgroundColor: '#2D6A4F', borderColor: '#2D6A4F' },
    chipText: { color: '#666' },
    chipTextSelected: { color: '#FFF', fontWeight: 'bold' },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 14, color: '#666', marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16
    },
    applyButton: {
        backgroundColor: '#2D6A4F',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20
    },
    applyButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    // Adicione isso ao seu StyleSheet
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        backgroundColor: '#F9F9F9',
        marginBottom: 15,
        overflow: 'hidden', // Importante para o Android respeitar o border radius
        justifyContent: 'center',
    },
});