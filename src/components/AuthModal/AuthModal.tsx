import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { styles } from './styles';

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isVisible, onClose, onLogin, onRegister }) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.dragIndicator} />
              
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Icon name="person-outline" size={32} color="#2D6A4F" />
                </View>
              </View>

              <Text style={styles.title}>Cadastre-se para ver detalhes e negociar</Text>
              
              <Text style={styles.description}>
                Acesse informações completas, fale com anunciantes e contribua para a economia circular.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.registerButton} 
                  onPress={onRegister}
                  activeOpacity={0.8}
                >
                  <Text style={styles.registerButtonText}>Criar Conta</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={onLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>Fazer Login</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.footerText}>SUSTENTABILIDADE EM CADA CLIQUE</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
