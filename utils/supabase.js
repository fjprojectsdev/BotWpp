// utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xuspfqmzikbrskklkjbgx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3BmcW16aWticnNrbGtqYmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzIxNjMsImV4cCI6MjA3ODY0ODE2M30.XC8FPS4JXLo3YhMLcrm_LMpeuc64BPVznhCZz8k2jF8';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Salva dados de mensagem no Supabase
 */
export async function saveMessageData(userId, userData) {
    try {
        const { data, error } = await supabase
            .from('message_count')
            .upsert({
                user_id: userId,
                name: userData.name,
                count: userData.count,
                weekly_count: userData.weeklyCount || 0,
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

/**
 * Carrega dados de mensagens do Supabase
 */
export async function loadMessageData() {
    try {
        const { data, error } = await supabase
            .from('message_count')
            .select('*');
        
        if (error) throw error;
        
        const messageCount = new Map();
        data.forEach(row => {
            messageCount.set(row.user_id, {
                name: row.name,
                count: row.count,
                weeklyCount: row.weekly_count || 0,
                dailyMessages: []
            });
        });
        
        return messageCount;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return new Map();
    }
}

/**
 * Salva regras do grupo
 */
export async function saveGroupRules(rules) {
    try {
        const { data, error } = await supabase
            .from('group_settings')
            .upsert({
                id: 1,
                rules: rules,
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao salvar regras:', error);
    }
}

/**
 * Carrega regras do grupo
 */
export async function loadGroupRules() {
    try {
        const { data, error } = await supabase
            .from('group_settings')
            .select('rules')
            .eq('id', 1)
            .single();
        
        if (error) throw error;
        return data?.rules || ['Seja respeitoso', 'Não faça spam', 'Mantenha o foco no desenvolvimento de IA'];
    } catch (error) {
        console.error('Erro ao carregar regras:', error);
        return ['Seja respeitoso', 'Não faça spam', 'Mantenha o foco no desenvolvimento de IA'];
    }
}

/**
 * Salva advertências
 */
export async function saveWarnings(userId, warningData) {
    try {
        const { data, error } = await supabase
            .from('warnings')
            .upsert({
                user_id: userId,
                count: warningData.count,
                reasons: warningData.reasons,
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao salvar advertências:', error);
    }
}