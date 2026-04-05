import { supabase } from './supabase';

export interface BoostPlan {
    id: string;
    title: string;
    description: string;
    price: number;
    priceLabel: string;
    bestValue: boolean;
    durationDays: number;
}

class ImpulsionamentosService {
    /**
     * Busca os planos de impulsionamento disponíveis.
     */
    async getBoostPlans(): Promise<BoostPlan[]> {
        const { data, error } = await supabase
            .from('boost_plans')
            .select('*')
            .order('price', { ascending: true });

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            priceLabel: item.price_label,
            bestValue: item.best_value,
            durationDays: item.duration_days
        }));
    }
}

export default new ImpulsionamentosService();
