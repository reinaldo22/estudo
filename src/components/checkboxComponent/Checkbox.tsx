import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import {StyleCheckBox} from './style'
interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

export function Checkbox({ label, value, onChange }: CheckboxProps) {
  return (
    <TouchableOpacity 
      style={StyleCheckBox.container} 
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
    >
      <View style={[StyleCheckBox.circle, value && StyleCheckBox.checked]}>
        {/* Se quiser um ponto no meio quando marcado: */}
        {value && <View style={StyleCheckBox.innerPoint} />}
      </View>
      <Text style={StyleCheckBox.label}>{label}</Text>
    </TouchableOpacity>
  );
}
