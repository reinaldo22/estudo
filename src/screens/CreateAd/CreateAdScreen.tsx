import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import { styleCreateAd } from './style';
import { maskCurrency, unmaskCurrency } from '@/utils/formatMask';

interface CategoryProps {
    id: string;
    nome: string;
}

export function CreateAdScreen({ navigation, route }: any) {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'venda' | 'doação'>('venda');
    const [price, setPrice] = useState('');
    const [categories, setCategories] = useState<CategoryProps[]>([]);
    const [category, setCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [weight, setWeight] = useState('');
    const [unidadeMedida, setUnidadeMedida] = useState('kg');
    const [estado, setEstado] = useState('');
    const [cidade, setCidade] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [isImpulsionado, setIsImpulsionado] = useState(false);
    const [planId, setPlanId] = useState<string | null>(null);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    const adToEdit = route.params?.ad;
    const isEditing = !!adToEdit;

    useEffect(() => {
        fetchCategorias();
        if (isEditing) {
            prefillData(adToEdit);
        } else {
            fetchUserProfile();
        }
    }, []);

    useEffect(() => {
        if (route.params?.isBoosted) {
            setIsImpulsionado(true);
        }
        if (route.params?.paymentConfirmed) {
            setPaymentConfirmed(true);
            setIsImpulsionado(true);
        }
        if (route.params?.planId) {
            setPlanId(route.params.planId);
        }
    }, [route.params?.isBoosted, route.params?.paymentConfirmed, route.params?.planId]);

    function prefillData(ad: any) {
        setTitle(ad.titulo);
        setType(ad.tipo);
        setPrice(maskCurrency((ad.preco * 100).toString()));
        setCategory(ad.categoria_id);
        setDescription(ad.descricao || '');
        setWeight(ad.peso ? ad.peso.toString() : '');
        setUnidadeMedida(ad.unidade_medida || 'kg');
        setEstado(ad.estado.toUpperCase());
        setCidade(ad.cidade.charAt(0).toUpperCase() + ad.cidade.slice(1));
        setImages(ad.imagens || []);
    }

    async function fetchUserProfile() {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data, error } = await supabase
                    .from('profile')
                    .select('endereco')
                    .eq('id', authUser.id)
                    .single();

                if (data?.endereco) {
                    const parts = data.endereco.split('-');
                    if (parts.length >= 2) {
                        const statePart = parts[parts.length - 1].trim();
                        const cityPart = parts[parts.length - 2].trim().split(',').pop()?.trim();

                        if (statePart) setEstado(statePart);
                        if (cityPart) setCidade(cityPart);
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao carregar perfil para localização:", error);
        }
    }

    async function fetchCategorias() {
        try {
            const cachedCats = await AsyncStorage.getItem('@categorias_cache');
            if (cachedCats !== null) {
                setCategories(JSON.parse(cachedCats));
                return;
            }
            const { data, error } = await supabase
                .from('categorias')
                .select('id, nome')
                .eq('ativo', true)
                .order('nome', { ascending: true });

            if (error) throw error;
            if (data) {
                setCategories(data);
                await AsyncStorage.setItem('@categorias_cache', JSON.stringify(data));
            }
        } catch (e) {
            console.error("Erro ao carregar categorias:", e);
        }
    }

    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert('Limite atingido', 'Você pode adicionar no máximo 5 imagens.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 5 - images.length,
            quality: 0.7,
        });

        if (!result.canceled) {
            const newImages: string[] = result.assets.map(asset => asset.uri);
            setImages((prev: string[]) => [...prev, ...newImages]);
        }
    };

    const handlePublish = async () => {
        if (!title || !category || !weight || !estado || !cidade || (type === 'venda' && !price)) {
            Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos necessários.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            // --- NOVO: Verificação de Limite de Anúncios Gratuitos ---
            if (!isEditing && !isImpulsionado) {
                const umaSemanaAtras = new Date();
                umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

                const { count, error: countError } = await supabase
                    .from('anuncios')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('impulsionado', false)
                    .gte('created_at', umaSemanaAtras.toISOString());

                if (countError) throw countError;

                if (count !== null && count >= 3) {
                    Alert.alert(
                        'Limite de Anúncios atingido',
                        'Você já atingiu o limite de 3 anúncios gratuitos por semana. Para publicar mais, você pode impulsionar este anúncio.',
                        [
                            { text: 'Entendi' },
                            { text: 'Impulsionar agora', onPress: () => setIsImpulsionado(true) }
                        ]
                    );
                    setLoading(false);
                    return;
                }
            }
            // -----------------------------------------------------------

            // 1. Upload only NEW Images
            const finalUrls: string[] = [];
            for (const uri of images) {
                if (uri.startsWith('http')) {
                    // Already uploaded
                    finalUrls.push(uri);
                    continue;
                }

                const fileExt = uri.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const formData = new FormData();
                formData.append('file', {
                    uri,
                    name: fileName,
                    type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                } as any);

                const { error: uploadError } = await supabase.storage
                    .from('anuncios')
                    .upload(fileName, formData);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('anuncios')
                    .getPublicUrl(fileName);

                finalUrls.push(publicUrl);
            }

            const adData: any = {
                titulo: title,
                tipo: type,
                preco: type === 'venda' ? unmaskCurrency(price) : 0,
                categoria_id: category,
                descricao: description,
                peso: parseFloat(weight),
                unidade_medida: unidadeMedida,
                estado: estado.trim().toLowerCase(),
                cidade: cidade.trim().toLowerCase(),
                imagens: finalUrls,
            };

            // TODO: No futuro, integrar com gateway de pagamento (Stripe, In-App Purchase, etc.)
            // Antes de salvar no banco, o fluxo de pagamento deve ser completado com sucesso.
            if (isImpulsionado) {
                adData.impulsionado = true;
                if (planId) {
                    adData.plan_id = planId;
                }
            }

            let insertedAdId: string | null = null;

            // 2. Save or Update Ad
            let adObjectForNavigation: any = null;

            if (isEditing) {
                const { error: updateError, data: updateData } = await supabase
                    .from('anuncios')
                    .update(adData)
                    .eq('id', adToEdit.id)
                    .eq('user_id', user.id)
                    .select();

                if (updateError) {
                    throw updateError;
                }

                if (!updateData || updateData.length === 0) {
                    throw new Error('Anúncio não encontrado ou sem permissão para editar.');
                }

                adObjectForNavigation = { ...adData, id: adToEdit.id };
            } else {
                const { data: insertData, error: insertError } = await supabase
                    .from('anuncios')
                    .insert({
                        ...adData,
                        user_id: user.id,
                        status: isImpulsionado ? 'desativado' : 'ativo',
                        created_at: new Date(),
                    })
                    .select('id, titulo, preco, imagens, cidade, estado')
                    .single();

                if (insertError) throw insertError;
                if (insertData) {
                    insertedAdId = insertData.id;
                    // Mapeamos para o formato que a BoostAd espera (que agora suporta ambos, mas vamos garantir o ID)
                    adObjectForNavigation = {
                        ...insertData,
                        id: insertData.id
                    };
                }
            }

            // Se o usuário marcou para impulsionar, navegamos para a tela de BoostAd com o ID recém criado
            if (isImpulsionado && !paymentConfirmed) {
                Alert.alert(
                    'Quase lá!',
                    'Seu anúncio foi publicado. Agora complete o pagamento para impulsioná-lo.',
                    [
                        {
                            text: 'Pagar Agora',
                            onPress: () => navigation.navigate('BoostAd', { adData: adObjectForNavigation })
                        }
                    ]
                );
                return;
            }

            // Se o pagamento JÁ foi confirmado (fluxo alternativo se existir), chama a função
            if (paymentConfirmed && (insertedAdId || adToEdit?.id)) {
                const idToBoost = isEditing ? adToEdit.id : insertedAdId;
                await supabase.functions.invoke('boost-ad', {
                    body: { ad_id: idToBoost, plan_id: planId }
                });
            }

            Alert.alert(
                'Sucesso',
                isEditing ? 'Anúncio atualizado com sucesso!' : 'Anúncio publicado com sucesso!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Erro ao processar anúncio:', error);
            Alert.alert('Erro', `Não foi possível ${isEditing ? 'atualizar' : 'publicar'} o anúncio.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styleCreateAd.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styleCreateAd.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styleCreateAd.headerTitle}>
                        {isEditing ? 'Editar Anúncio' : 'Criar Anúncio'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styleCreateAd.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Photo Upload Area */}
                    {images.length === 0 ? (
                        <TouchableOpacity style={styleCreateAd.photoUploadArea} onPress={pickImage}>
                            <View style={styleCreateAd.photoIconContainer}>
                                <MaterialIcons name="add-a-photo" size={32} color="#16B37B" />
                            </View>
                            <Text style={styleCreateAd.photoUploadTitle}>Adicionar fotos</Text>
                            <Text style={styleCreateAd.photoUploadSubtitle}>Toque para selecionar até 5 imagens</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styleCreateAd.photoSection}>
                            <Text style={styleCreateAd.labelHorizontal}>FOTOS DO MATERIAL ({images.length}/5)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styleCreateAd.imageHorizontalScroll}>
                                <TouchableOpacity style={styleCreateAd.miniAddButton} onPress={pickImage}>
                                    <Ionicons name="add" size={24} color="#999" />
                                    <Text style={styleCreateAd.miniAddText}>ADICIONAR</Text>
                                </TouchableOpacity>
                                {images.map((img, index) => (
                                    <View key={index} style={styleCreateAd.miniImageContainer}>
                                        <Image source={{ uri: img }} style={styleCreateAd.miniImage} />
                                        <TouchableOpacity
                                            style={styleCreateAd.miniRemoveButton}
                                            onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
                                        >
                                            <Ionicons name="close" size={16} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Título */}
                    <View style={styleCreateAd.inputGroup}>
                        <Text style={styleCreateAd.label}>TÍTULO DO ANÚNCIO</Text>
                        <TextInput
                            style={styleCreateAd.input}
                            placeholder="Ex: Papelão Misto Enfardado"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Tipo de Anúncio */}
                    <View style={styleCreateAd.inputGroup}>
                        <Text style={styleCreateAd.label}>TIPO DE ANÚNCIO</Text>
                        <View style={styleCreateAd.toggleContainer}>
                            <TouchableOpacity
                                style={[styleCreateAd.toggleButton, type === 'venda' && styleCreateAd.toggleButtonActive]}
                                onPress={() => setType('venda')}
                            >
                                <Text style={[styleCreateAd.toggleText, type === 'venda' && styleCreateAd.toggleTextActive]}>Venda</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styleCreateAd.toggleButton, type === 'doação' && styleCreateAd.toggleButtonActive]}
                                onPress={() => setType('doação')}
                            >
                                <Text style={[styleCreateAd.toggleText, type === 'doação' && styleCreateAd.toggleTextActive]}>Doação</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Preço (Only if Venda) */}
                    {type === 'venda' && (
                        <View style={styleCreateAd.inputGroup}>
                            <Text style={styleCreateAd.label}>PREÇO POR KG</Text>
                            <View style={styleCreateAd.priceInputContainer}>
                                <TextInput
                                    style={styleCreateAd.priceInput}
                                    placeholder="R$ 0,00"
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={(text) => setPrice(maskCurrency(text))}
                                />
                            </View>
                        </View>
                    )}

                    {/* Categoria */}
                    <View style={styleCreateAd.inputGroup}>
                        <Text style={styleCreateAd.label}>CATEGORIA DO MATERIAL</Text>
                        <TouchableOpacity
                            style={styleCreateAd.dropdownHeader}
                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                            <Text style={[styleCreateAd.dropdownHeaderText, !category && { color: '#999' }]}>
                                {category ? categories.find(c => c.id === category)?.nome : 'Selecione uma categoria'}
                            </Text>
                            <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                        </TouchableOpacity>

                        {showCategoryDropdown && (
                            <View style={styleCreateAd.dropdownList}>
                                {categories.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styleCreateAd.dropdownItem}
                                        onPress={() => {
                                            setCategory(item.id);
                                            setShowCategoryDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            styleCreateAd.dropdownItemText,
                                            category === item.id && styleCreateAd.dropdownItemTextActive
                                        ]}>
                                            {item.nome}
                                        </Text>
                                        {category === item.id && (
                                            <Ionicons name="checkmark" size={20} color="#2D6A4F" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Descrição */}
                    <View style={styleCreateAd.inputGroup}>
                        <Text style={styleCreateAd.label}>DESCRIÇÃO DETALHADA</Text>
                        <TextInput
                            style={[styleCreateAd.input, styleCreateAd.textArea]}
                            placeholder="Descreva as condições do material, impurezas, etc..."
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* Peso */}
                    <View style={styleCreateAd.inputGroup}>
                        <Text style={styleCreateAd.label}>PESO APROXIMADO</Text>
                        <View style={styleCreateAd.weightInputContainer}>
                            <TextInput
                                style={styleCreateAd.weightInput}
                                placeholder="Ex: 500"
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={setWeight}
                            />
                            <Text style={styleCreateAd.weightSuffix}>kg</Text>
                        </View>
                    </View>

                    {/* Localização (Cidade e Estado) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={[styleCreateAd.inputGroup, { flex: 0.65 }]}>
                            <Text style={styleCreateAd.label}>CIDADE</Text>
                            <TextInput
                                style={styleCreateAd.input}
                                placeholder="Ex: Manaus"
                                value={cidade}
                                onChangeText={setCidade}
                            />
                        </View>
                        <View style={[styleCreateAd.inputGroup, { flex: 0.3 }]}>
                            <Text style={styleCreateAd.label}>ESTADO</Text>
                            <TextInput
                                style={styleCreateAd.input}
                                placeholder="Ex: AM"
                                value={estado}
                                onChangeText={setEstado}
                                autoCapitalize="characters"
                                maxLength={2}
                            />
                        </View>
                    </View>
                    {/* Opção de Impulsionamento */}
                    {!isEditing && (
                        <TouchableOpacity
                            style={styleCreateAd.boostToggleContainer}
                            onPress={() => {
                                if (!isImpulsionado) {
                                    const missingFields: string[] = [];
                                    if (images.length === 0) missingFields.push('Fotos');
                                    if (!title) missingFields.push('Título');
                                    if (!category) missingFields.push('Categoria');
                                    if (type === 'venda' && !price) missingFields.push('Preço');
                                    if (!weight) missingFields.push('Peso');
                                    if (!cidade) missingFields.push('Cidade');
                                    if (!estado) missingFields.push('Estado');

                                    if (missingFields.length > 0) {
                                        Alert.alert(
                                            'Anúncio Incompleto',
                                            `Para impulsionar, preencha primeiro: ${missingFields.join(', ')}.`
                                        );
                                        return;
                                    }
                                }
                                setIsImpulsionado(!isImpulsionado);
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styleCreateAd.boostCheckbox, isImpulsionado && styleCreateAd.boostCheckboxActive]}>
                                {isImpulsionado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                            </View>
                            <View style={styleCreateAd.boostTextContainer}>
                                <Text style={styleCreateAd.boostTitle}>Impulsionar anúncio (Destaque)</Text>
                                <Text style={styleCreateAd.boostSubtitle}>
                                    {isImpulsionado
                                        ? 'Anúncio será impulsionado após a publicação!'
                                        : 'Apareça na seção de anúncios impulsionados por até 15 dias.'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    )}

                    {/* Publish Button */}
                    <TouchableOpacity
                        style={[styleCreateAd.publishButton, loading && { opacity: 0.7 }]}
                        onPress={handlePublish}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styleCreateAd.publishButtonText}>
                                {isEditing ? 'Salvar Alterações' : 'Publicar Anúncio'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
