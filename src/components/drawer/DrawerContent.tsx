import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '@/services/supabase';
import { useNavigation } from '@react-navigation/native';
import { DrawerStyle } from './style';

export function DrawerContent(props: any) {
    const navigation = useNavigation<any>();
    
    // Iniciamos sem o estado de 'loading' para evitar o flash/bug de fechamento
    const [user, setUser] = useState<{ name: string; email: string; avatar: string; date: string } | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function checkUser() {
            try {
                const { data: { user: sessionUser } } = await supabase.auth.getUser();
                
                if (sessionUser && isMounted) {
                    setUser({
                        name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || "Usuário",
                        email: sessionUser.email || "",
                        avatar: sessionUser.user_metadata?.avatar_url || "https://via.placeholder.com/150",
                        date: sessionUser.created_at ? `Desde ${new Date(sessionUser.created_at).getFullYear()}` : "Membro desde 2026"
                    });
                }
            } catch (error) {
                console.log("Erro ao buscar usuário:", error);
            }
        }

        checkUser();
        return () => { isMounted = false };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        props.navigation.closeDrawer();
        navigation.replace('Login');
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
                        <Text style={DrawerStyle.userName} numberOfLines={1}>
                            {user ? user.name : "Convidado"}
                        </Text>
                        <Text style={DrawerStyle.memberSince}>
                            {user ? user.date : "Entre para anunciar"}
                        </Text>
                    </View>
                </View>

                <View style={DrawerStyle.menuItemsContainer}>
                    <DrawerItemList {...props} />
                </View>
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