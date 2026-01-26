import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Routes } from '@/routes';
import { supabase } from "@/services/supabase";
import * as Linking from 'expo-linking';

export default function App() {
  // Referência para navegar de dentro do useEffect
  const navigationRef = useNavigationContainerRef();
  
  // Captura a URL que abriu o app (Deep Link)
  const url = Linking.useURL();

  // 1. Monitor de URL (Força a navegação se o link for de recuperação)
  useEffect(() => {
    if (url) {
      const { path, queryParams } = Linking.parse(url);
      
      console.log("🔗 URL COMPLETA RECEBIDA:", url);
      
      // Se a URL contém o token de recuperação ou o path for 'Senha'
      if (url.includes("type=recovery") || path === "Senha") {
        console.log("🎯 Redirecionamento forçado via Deep Link para: Senha");
        
        const timer = setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Senha' as never);
          }
        }, 1000); // Aguarda 1s para garantir que as rotas montaram

        return () => clearTimeout(timer);
      }
    }
  }, [url]);

  // 2. Monitor de Estado do Supabase (Ouvinte padrão)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔔 EVENTO SUPABASE:", event);

      if (event === "PASSWORD_RECOVERY") {
        console.log("🎯 Evento PASSWORD_RECOVERY detectado pelo Supabase!");
        
        if (navigationRef.isReady()) {
          navigationRef.navigate('Senha' as never);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Routes />
    </NavigationContainer>
  );
}