import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { styleFilter } from './style';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { maskCurrency, unmaskCurrency } from '@/utils/formatMask';

export function FilterScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();

    // Captura os dados vindos da Home
    const listaRegioes = (route.params as any)?.regioes || [];
    const { filtrosAtuais } = (route.params as any) || {};

    // --- ESTADOS INICIALIZADOS COM MEMÓRIA ---
    // Se filtrosAtuais existir, usamos ele, senão usamos o padrão
    const [tipo, setTipo] = useState<'venda' | 'doação' | null>(filtrosAtuais?.tipo || null);

    // Para o preço, precisamos aplicar a máscara no valor numérico que vem do banco/home
    const [precoMin, setPrecoMin] = useState(
        filtrosAtuais?.precoMin ? maskCurrency(filtrosAtuais.precoMin.toString()) : ''
    );
    const [precoMax, setPrecoMax] = useState(
        filtrosAtuais?.precoMax ? maskCurrency(filtrosAtuais.precoMax.toString()) : ''
    );

    const [estado, setEstado] = useState(filtrosAtuais?.estado || '');
    const [cidade, setCidade] = useState(filtrosAtuais?.cidade || '');

    const isDoacao = tipo === 'doação';

    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    const handlePrecoMinChange = (text: string) => {
        setPrecoMin(maskCurrency(text));
    };

    const handlePrecoMaxChange = (text: string) => {
        setPrecoMax(maskCurrency(text));
    };

    const handleApply = () => {
        // Usamos o || 0 para garantir que valorMin e valorMax nunca sejam null/undefined na lógica abaixo
        const valorMin = unmaskCurrency(precoMin) || 0;
        const valorMax = unmaskCurrency(precoMax) || 0;

        // 2. Validação: Impede valores negativos
        if (valorMin < 0 || valorMax < 0) {
            alert("Os valores não podem ser negativos.");
            return;
        }

        // 3. Agora o TS não reclama mais, pois valorMax é garantidamente um número
        if (valorMax > 0 && valorMax < valorMin) {
            alert("O preço máximo não pode ser menor que o preço mínimo.");
            return;
        }

        // 4. Envio para a Home
        navigation.navigate('Drawer', {
            screen: 'Home',
            params: {
                filtros: {
                    tipo,
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
        // Importante: Notificar a Home que os filtros foram limpos
        navigation.navigate('Drawer', {
            screen: 'Home',
            params: { filtros: {} }
        });
    };

    return (
        <View style={styleFilter.container}>
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
                            setPrecoMin('');
                            setPrecoMax('');
                        }}
                    >
                        <Text style={[styleFilter.chipText, tipo === 'doação' && styleFilter.chipTextSelected]}>Doação</Text>
                    </TouchableOpacity>
                </View>

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

                <Text style={[styleFilter.sectionTitle, isDoacao && { color: '#999' }]}>
                    Faixa de Preço (por kg) {isDoacao && '- Indisponível'}
                </Text>
                <View style={styleFilter.row}>
                    <TextInput
                        style={[
                            styleFilter.input,
                            { flex: 1, marginRight: 10 },
                            isDoacao && { backgroundColor: '#F0F0F0', color: '#999', borderColor: '#EEE' }
                        ]}
                        placeholder="Mín R$"
                        keyboardType="number-pad"
                        value={precoMin}
                        onChangeText={handlePrecoMinChange}
                        editable={!isDoacao}
                    />
                    <TextInput
                        style={[
                            styleFilter.input,
                            { flex: 1 },
                            isDoacao && { backgroundColor: '#F0F0F0', color: '#999', borderColor: '#EEE' }
                        ]}
                        placeholder="Máx R$"
                        keyboardType="number-pad"
                        value={precoMax}
                        onChangeText={handlePrecoMaxChange}
                        editable={!isDoacao}
                    />
                </View>
            </ScrollView>

            <TouchableOpacity style={styleFilter.applyButton} onPress={handleApply}>
                <Text style={styleFilter.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
        </View>
    );
}