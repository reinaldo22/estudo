import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styleFilter } from './style'; // Vamos criar esse arquivo
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'; // Certifique-se de ter instalado
import { maskCurrency, unmaskCurrency } from '@/utils/formatMask';



export function FilterScreen({ navigation: any }) {
    const navigation = useNavigation<any>();
    const route = useRoute();

    // Captura as regiões enviadas pela HomeScreen
    const listaRegioes = (route.params as any)?.regioes || [];

    const [tipo, setTipo] = useState<'venda' | 'doação' | null>(null);
    const [precoMin, setPrecoMin] = useState('');
    const [precoMax, setPrecoMax] = useState('');
    // Agora iniciamos vazios para o Picker
    const [estado, setEstado] = useState('');
    const [cidade, setCidade] = useState('');

    // Verificamos se é doação para facilitar o uso no JSX
    const isDoacao = tipo === 'doação';

    // Se o usuário clicar em "Doação", limpamos os preços automaticamente
    const handleSetTipo = (novoTipo: 'venda' | 'doação') => {
        setTipo(novoTipo);
        if (novoTipo === 'doação') {
            setPrecoMin('');
            setPrecoMax('');
        }
    };

    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    const handlePrecoMinChange = (text: string) => {
        setPrecoMin(maskCurrency(text));
    };

    const handlePrecoMaxChange = (text: string) => {
        setPrecoMax(maskCurrency(text));
    };

    const handleApply = () => {
        // 1. Transformamos em números puros (unmask)
        const valorMin = unmaskCurrency(precoMin) || 0;
        const valorMax = unmaskCurrency(precoMax) || 0;

        // 2. Validação: Impede valores negativos (embora a máscara já ajude)
        if (valorMin < 0 || valorMax < 0) {
            alert("Os valores não podem ser negativos.");
            return;
        }

        // 3. Validação: Se o máximo for preenchido, ele deve ser maior que o mínimo
        if (valorMax > 0 && valorMax < valorMin) {
            alert("O preço máximo não pode ser menor que o preço mínimo.");
            return;
        }

        // 4. Envio limpo para a Home
        navigation.navigate('Drawer', {
            screen: 'Home',
            params: {
                filtros: {
                    tipo,
                    // Se for doação, enviamos null para os preços independente do que houver nos campos
                    precoMin: isDoacao ? null : valorMin, 
                    precoMax: isDoacao ? null : valorMax,
                    estado,
                    cidade
                }
            }
        });
    };

    const handleClear = () => {
        setTipo(null);
        setPrecoMin('');
        setPrecoMax('');
        setEstado('');
        setCidade('');
    };

    return (
        <View style={styleFilter.container}>
            {/* Header */}
            <View style={styleFilter.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="close" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styleFilter.headerTitle}>Filtros</Text>
                <TouchableOpacity onPress={handleClear}>
                    <Text style={styleFilter.clearText}>Limpar Tudo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Alteração nos botões de Tipo */}
                <Text style={styleFilter.sectionTitle}>Tipo de Anúncio</Text>
                <View style={styleFilter.row}>
                    <TouchableOpacity
                        style={[styleFilter.chip, tipo === 'venda' && styleFilter.chipSelected]}
                        onPress={() => setTipo('venda')}
                    >
                        <Text style={[styleFilter.chipText, tipo === 'venda' && styleFilter.chipTextSelected]}>Venda</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styleFilter.chip, tipo === 'doação' && styleFilter.chipSelected]}
                        onPress={() => {
                            setTipo('doação');
                            setPrecoMin(''); // Limpa o preço ao selecionar doação
                            setPrecoMax(''); // Limpa o preço ao selecionar doação
                        }}
                    >
                        <Text style={[styleFilter.chipText, tipo === 'doação' && styleFilter.chipTextSelected]}>Doação</Text>
                    </TouchableOpacity>
                </View>

                {/* Localização - PICKER DINÂMICO */}
                <Text style={styleFilter.sectionTitle}>Região</Text>
                <View style={styleFilter.pickerContainer}>
                    <Picker
                        selectedValue={cidade}
                        onValueChange={(itemValue, itemIndex) => {
                            setCidade(itemValue);
                            if (itemIndex > 0) {
                                setEstado(listaRegioes[itemIndex - 1].estado);
                            } else {
                                setEstado('');
                            }
                        }}
                    >
                        <Picker.Item label="Selecione uma região (Todas)" value="" />
                        {listaRegioes.map((reg: any, index: number) => (
                            <Picker.Item
                                key={index}
                                label={`${capitalize(reg.cidade)} - ${reg.estado.toUpperCase()}`}
                                value={reg.cidade}
                            />
                        ))}
                    </Picker>
                </View>

                {/* 2. Alteração na Faixa de Preço */}
                <Text style={[styleFilter.sectionTitle, isDoacao && { color: '#999' }]}>
                    Faixa de Preço (por kg) {isDoacao && '- Indisponível'}
                </Text>
                <View style={styleFilter.row}>
                    <TextInput
                        style={[
                            styleFilter.input, 
                            { flex: 1, marginRight: 10 },
                            isDoacao && { backgroundColor: '#F0F0F0', color: '#999', borderColor: '#EEE' } // Estilo de desabilitado
                        ]}
                        placeholder="Mín R$"
                        keyboardType="number-pad"
                        value={precoMin}
                        onChangeText={handlePrecoMinChange}
                        editable={!isDoacao} // Impede a digitação se for doação
                    />
                    <TextInput
                        style={[
                            styleFilter.input, 
                            { flex: 1 },
                            isDoacao && { backgroundColor: '#F0F0F0', color: '#999', borderColor: '#EEE' } // Estilo de desabilitado
                        ]}
                        placeholder="Máx R$"
                        keyboardType="number-pad"
                        value={precoMax}
                        onChangeText={handlePrecoMaxChange}
                        editable={!isDoacao} // Impede a digitação se for doação
                    />
                </View>

            </ScrollView>

            <TouchableOpacity style={styleFilter.applyButton} onPress={handleApply}>
                <Text style={styleFilter.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
        </View>
    );
}