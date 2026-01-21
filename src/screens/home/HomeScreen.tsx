import { View, Text } from "react-native";
import { styleHome } from "./styles";

export function HomeScreen() {

    return (
        <View style={styleHome.container}>
            <Text>Autenticado com sucesso</Text>
        </View>
    )
}

