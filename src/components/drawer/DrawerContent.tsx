import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { DrawerStyle } from './style';

export function DrawerContent(props: any) {
    const navigation = useNavigation<any>();

    // Iniciamos sem o estado de 'loading' para evitar o flash/bug de fechamento
    const [user, setUser] = useState<{ name: string; email: string; avatar: string; date: string } | null>(null);

    useEffect(() => {
        let isMounted = true;


        async function checkUser() {
            try {
                // 1. Pega o ID do usuário logado
                const { data: { user: sessionUser } } = await supabase.auth.getUser();

                if (sessionUser && isMounted) {
                    // 2. BUSCA OS DADOS REAIS NA TABELA PROFILE
                    const { data: profileData, error } = await supabase
                        .from('profile') // ou 'profiles'
                        .select('full_name, avatar_url, updated_at')
                        .eq('id', sessionUser.id)
                        .single();

                    // if (error) {
                    //     console.log("DEBUG DRAWER - Erro:", error.message);
                    //     console.log("DEBUG DRAWER - ID Buscado:", sessionUser.id);
                    // }
                    if (profileData) {
                        setUser({
                            name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || "Usuário",
                            email: sessionUser.email || "",
                            // AGORA pegamos da tabela profile!
                            avatar: profileData.avatar_url || "https://via.placeholder.com/150",
                            date: profileData.updated_at
                                ? `Desde ${new Date(profileData.updated_at).getFullYear()}`
                                : "Membro desde 2026"
                        });
                    } else {
                        // Fallback caso o profile ainda não exista
                        setUser({
                            name: sessionUser.email?.split('@')[0] || "Usuário",
                            email: sessionUser.email || "",
                            avatar: "https://via.placeholder.com/150",
                            date: "Membro"
                        });
                    }
                }
            } catch (error) {
                console.log("Erro ao buscar usuário no Drawer:", error);
            }
        }

        // 2. Configura o Listener para atualizar quando o Drawer abrir
        const unsubscribe = props.navigation.addListener('state', () => {
            if (isMounted) {
                checkUser();
            }
        });

        // 3. Execução inicial
        checkUser();

        // 4. LIMPEZA (Cleanup): Cancela o listener e marca como desmontado
        return () => {
            isMounted = false;
            unsubscribe(); // Importante para não deixar vazamento de memória
        };
    }, [props.navigation]); // Adicione a navegação como dependência

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        props.navigation.closeDrawer();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>

                <View style={DrawerStyle.headerContainer}>
                    <Image
                        source={user ? { uri: user.avatar } : { uri: 'https://via.placeholder.com/150' }}
                        style={DrawerStyle.avatar}
                    />
                    <View style={DrawerStyle.headerTextContainer}>
                        <Text style={DrawerStyle.userName}>
                            {user ? user.name : "Convidado"}
                        </Text>
                        <Text style={DrawerStyle.memberSince}>
                            {user ? user.date : "Entre para anunciar"}
                        </Text>
                    </View>
                </View>

                {/* SÓ MOSTRA A LISTA DE MENUS SE O USUÁRIO ESTIVER LOGADO */}
                {user && (
                    <View style={DrawerStyle.menuItemsContainer}>
                        <DrawerItemList {...props} />
                    </View>
                )}
            </DrawerContentScrollView>

            <View style={DrawerStyle.footerContainer}>
                {user ? (
                    <TouchableOpacity style={DrawerStyle.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" size={22} color="#E74C3C" />
                        <Text style={DrawerStyle.logoutText}>Logout</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={DrawerStyle.logoutButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Icon name="login" size={22} color="#2D6A4F" />
                        <Text style={[DrawerStyle.logoutText, { color: '#2D6A4F' }]}>Fazer Login</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}