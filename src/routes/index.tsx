import { HomeScreen } from "@/screens/home/HomeScreen";
import { RegisterScreen } from '@/screens/register/RegisterScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from "@/screens/login/LoginScreen";
const Stack = createStackNavigator();

export function Routes() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ 
                    headerShown: false
                }}
            />

            {/* Adicionamos a Home aqui para o navigation.navigate('Home') funcionar! 🏠 */}
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'Login' }} 
            />
        </Stack.Navigator>
    )
}