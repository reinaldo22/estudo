import { supabase } from './supabase';

export interface PixGenerationResponse {
    pixCode: string;
    encodedImage: string;
    paymentId: string;
    success: boolean;
    error?: string;
}

class PaymentsService {
    /**
     * Chama a Edge Function para gerar um pagamento PIX via Asaas.
     */
    async generatePixPayment(adId: string, planId: string): Promise<PixGenerationResponse> {
        const { data, error } = await supabase.functions.invoke('asaas-checkout', {
            body: { ad_id: adId, plan_id: planId }
        });

        if (error) throw error;

        if (!data.success) {
            throw new Error(data.error || "Erro desconhecido ao gerar PIX");
        }

        return data;
    }

    /**
     * Subscreve ao Realtime do Supabase para escutar o status de um pagamento.
     * Retorna o canal de inscrição, permitindo que a UI de o "unsubscribe".
     * E aceita um callback para notificar a UI das mudanças (CONFIRMED, OVERDUE, etc)
     */
    subscribeToPaymentStatus(paymentId: string, onStatusChange: (status: string) => void) {
        return supabase
            .channel(`payment_status_${paymentId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payments',
                    filter: `external_id=eq.${paymentId}`
                },
                (payload) => {
                    const status = payload.new.status;
                    onStatusChange(status);
                }
            )
            .subscribe();
    }

    /**
     * Remove o canal do Realtime
     */
    unsubscribeFromPaymentStatus(subscription: any) {
        supabase.removeChannel(subscription);
    }
}

export default new PaymentsService();
