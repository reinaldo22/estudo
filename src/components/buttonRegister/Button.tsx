import { StyleButtom } from './styles';
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean; 
}

export function PrimaryButton({title, onPress, isLoading}: ButtonProps){
  return (
    <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    activeOpacity={0.7}
    style={[StyleButtom.container, isLoading && {opacity: 0.6}]}
    >
      {/* Aqui entra a lógica que discutimos: se carregar, mostra o ícone */}
      {isLoading ? (
        <ActivityIndicator color="#FFF"/>
      ): (
        <Text style={StyleButtom.text}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}