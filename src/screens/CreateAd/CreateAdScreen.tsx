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

interface CategoryProps {
    id: string;
    nome: string;
}

export function CreateAdScreen({ navigation }: any) {
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

    useEffect(() => {
        fetchCategorias();
        fetchUserProfile();
    }, []);

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

            // 1. Upload Images
            const uploadedUrls: string[] = [];
            for (const uri of images) {
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

                uploadedUrls.push(publicUrl);
            }

            // 2. Save Ad to Database
            const { error } = await supabase.from('anuncios').insert({
                user_id: user.id,
                titulo: title,
                tipo: type,
                preco: type === 'venda' ? parseFloat(price.replace(',', '.')) : 0,
                categoria_id: category,
                descricao: description,
                peso: parseFloat(weight),
                unidade_medida: unidadeMedida,
                estado: estado.trim().toLowerCase(),
                cidade: cidade.trim().toLowerCase(),
                imagens: uploadedUrls,
                status: 'ativo',
                created_at: new Date(),
            });

            if (error) throw error;

            Alert.alert('Sucesso', 'Anúncio publicado com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Erro ao publicar anúncio:', error);
            Alert.alert('Erro', 'Não foi possível publicar o anúncio.');
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
                    <Text style={styleCreateAd.headerTitle}>Criar Anúncio</Text>
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
                                <Text style={styleCreateAd.currencyPrefix}>R$</Text>
                                <TextInput
                                    style={styleCreateAd.priceInput}
                                    placeholder="0,00"
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
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

                    {/* Publish Button */}
                    <TouchableOpacity
                        style={[styleCreateAd.publishButton, loading && { opacity: 0.7 }]}
                        onPress={handlePublish}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styleCreateAd.publishButtonText}>Publicar Anúncio</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
