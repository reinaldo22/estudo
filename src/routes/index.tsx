import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons as Icon } from '@expo/vector-icons';

// Suas importações
import { FilterScreen } from '@/screens/FilterScreen/FilterScreen';
import { HomeScreen } from "@/screens/home/HomeScreen";
import { RegisterScreen } from '@/screens/register/RegisterScreen';
import { LoginScreen } from "@/screens/login/LoginScreen";
import { SendEmailPass } from "@/screens/forgotPass/SendEmailPasswordScreen/SendEmailPass";
import { ConfirmCodePass } from "@/screens/forgotPass/ConfirmCodeScreen/ConfirmCodePass";
import { NewPasswordScreen } from "@/screens/forgotPass/newPass/NewPasswordScreen";
import { DrawerContent } from '@/components/drawer/DrawerContent';
import { AdDetail } from '@/screens/detailProductScreen/AdDetail';
import { ProfileScreen } from '@/screens/ProfileScreen/ProfileScreen';
import { MyAdsScreen } from '@/screens/MyAds/MyAdsScreen';
import { CreateAdScreen } from '@/screens/CreateAd/CreateAdScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// 1. Definição das Rotas do Menu Lateral (Drawer)
function DrawerRoutes() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                // --- AJUSTES CONTRA O BUG DE ABRIR SOZINHO ---
                drawerType: 'front',           // Sobrepõe a tela (evita empurrar o layout)
                swipeEnabled: true,            // Permite o gesto, mas não força a abertura
                // --------------------------------------------
                drawerActiveBackgroundColor: 'transparent',
                drawerActiveTintColor: '#2D6A4F',
                drawerInactiveTintColor: '#4A4A4A',
                drawerLabelStyle: {
                    marginLeft: 5,             // Espaçamento entre ícone e texto
                    fontSize: 16,
                    fontWeight: '500'
                },
                drawerItemStyle: {
                    marginVertical: 5,
                    paddingHorizontal: 10,
                }
            }}
        >

            {/* 1. ADICIONE A HOME AQUI COMO PRIMEIRA OPÇÃO */}
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    drawerLabel: 'Início',
                    drawerIcon: ({ color }) => <Icon name="home" size={24} color={color} />
                }}
            />

            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    drawerLabel: 'Perfil',
                    drawerIcon: ({ color }) => <Icon name="person-outline" size={24} color={color} />
                }}
            />

            <Drawer.Screen
                name="MyAds"
                component={MyAdsScreen}
                options={{
                    drawerLabel: 'Meus anúncios',
                    drawerIcon: ({ color }) => <Icon name="inventory-2" size={24} color={color} />
                }}
            />

            <Drawer.Screen
                name="Config"
                component={HomeScreen}
                options={{
                    drawerLabel: 'Configurações',
                    drawerIcon: ({ color }) => <Icon name="settings" size={24} color={color} />
                }}
            />

            <Drawer.Screen
                name="Helper"
                component={HomeScreen}
                options={{
                    drawerLabel: 'Contato e Suporte',
                    drawerIcon: ({ color }) => <Icon name="info" size={24} color={color} />
                }}
            />
        </Drawer.Navigator>
    );
}

// 2. Navegação Principal (Stack)
export function Routes() {
    return (
        <Stack.Navigator initialRouteName="Drawer">

            {/* O Drawer agora é a tela principal após o login */}
            <Stack.Screen
                name="Drawer"
                component={DrawerRoutes}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Redefinir"
                component={SendEmailPass}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Senha"
                component={NewPasswordScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="ConfirmCode"
                component={ConfirmCodePass}
                options={{ headerShown: false }}
            />
            {/* 2. Registre a tela de Filtros aqui */}
            <Stack.Screen
                name="FilterScreen"
                component={FilterScreen}
                options={{
                    animation: 'slide_from_bottom', // Opcional: faz ela subir como no design
                    presentation: 'modal' // Opcional: estilo de modal
                }}
            />

            <Stack.Screen name="Detalhes"
                component={AdDetail}
            />

            <Stack.Screen
                name="CreateAd"
                component={CreateAdScreen}
                options={{ headerShown: false }}
            />

        </Stack.Navigator>
    );
}