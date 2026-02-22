// services/adActions.ts
import { Share, Linking, Alert } from 'react-native';
import { supabase } from '@/services/supabase';

export const adActions = {
    // Função de Compartilhar
    compartilhar: async (ad: any) => {
        try {
            const mensagem = `Olha esse anúncio no EcoMarket: ${ad.titulo}\nPreço: R$ ${ad.preco?.toFixed(2)}/kg\nLocal: ${ad.cidade} - ${ad.estado}`;
            await Share.share({ message: mensagem });
        } catch (error: any) {
            console.error(error.message);
        }
    },

    // Função de WhatsApp
    abrirWhatsApp: (phone: string, full_name: string, titulo: string) => {
        const mensagem = `Olá ${full_name}, vi seu anúncio de "${titulo}" no EcoMarket e tenho interesse!`;
        const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(mensagem)}`;

        Linking.openURL(url).catch(() => {
            Alert.alert("Erro", "Instale o WhatsApp para entrar em contato.");
        });
    },

    // Lógica de Favorito (Aqui passamos as funções de estado como parâmetro)
    toggleFavorito: async (
        adId: string, 
        userId: string | null, 
        isFavorito: boolean, 
        setIsFavorito: (val: boolean) => void
    ) => {
        if (!userId) {
            Alert.alert("Aviso", "Você precisa estar logado!");
            return;
        }

        const estadoAnterior = isFavorito;
        setIsFavorito(!estadoAnterior);

        try {
            if (!estadoAnterior) {
                await supabase.from('favoritos').insert({ ad_id: adId, user_id: userId });
            } else {
                await supabase.from('favoritos').delete().eq('ad_id', adId).eq('user_id', userId);
            }
        } catch (error) {
            setIsFavorito(estadoAnterior);
            console.error(error);
        }
    }
};