import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { DrawerStyle } from './style';

export function DrawerContent(props: any) {
    const navigation = useNavigation<any>();

    const [user, setUser] = useState<{ name: string; email: string; avatar: string; date: string } | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function checkUser() {
            try {
                const { data: { user: sessionUser } } = await supabase.auth.getUser();

                if (sessionUser && isMounted) {
                    const { data: profileData } = await supabase
                        .from('profile')
                        .select('full_name, avatar_url, updated_at')
                        .eq('id', sessionUser.id)
                        .single();

                    if (profileData) {
                        setUser({
                            name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || "Usuário",
                            email: sessionUser.email || "",
                            avatar: profileData.avatar_url || "https://via.placeholder.com/150",
                            date: profileData.updated_at
                                ? `Desde ${new Date(profileData.updated_at).getFullYear()}`
                                : "Membro desde 2026"
                        });
                    } else {
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

        const unsubscribe = props.navigation.addListener('state', () => {
            if (isMounted) {
                checkUser();
            }
        });

        checkUser();

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [props.navigation]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        props.navigation.closeDrawer();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Drawer' }],
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

                {user && (
                    <View style={DrawerStyle.menuItemsContainer}>
                        <DrawerItemList {...props} />
                    </View>
                )}
            </DrawerContentScrollView>

            {user && (
                <View style={DrawerStyle.footerContainer}>
                    <TouchableOpacity style={DrawerStyle.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" size={22} color="#E74C3C" />
                        <Text style={DrawerStyle.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}