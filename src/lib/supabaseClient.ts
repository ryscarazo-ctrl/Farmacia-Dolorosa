import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

export interface CloudInventoryPayload {
  products: any[];
  batches: any[];
  alerts?: any[];
  updatedBy?: string;
}

// 1. Subir inventario completo a la Nube (cuando Fátima o cualquier usuario sube un Excel o edita)
export async function uploadInventoryToCloud(payload: CloudInventoryPayload): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase no está configurado aún.' };
  }

  try {
    const { error } = await supabase
      .from('farmacia_cloud_inventory')
      .upsert({
        id: 'central_inventory',
        version: '1.0',
        updated_at: new Date().toISOString(),
        updated_by: payload.updatedBy || 'usuario',
        total_products: payload.products?.length || 0,
        products_data: payload.products,
        batches_data: payload.batches,
        alerts_data: payload.alerts || [],
      });

    if (error) {
      console.error('[SUPABASE UPLOAD ERROR]', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Inventario sincronizado exitosamente en la Nube.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error de conexión a la nube' };
  }
}

// 2. Descargar inventario más reciente de la Nube (para sincronizar todos los teléfonos)
export async function downloadInventoryFromCloud(): Promise<{ success: boolean; data?: CloudInventoryPayload }> {
  if (!supabase) {
    return { success: false };
  }

  try {
    const { data, error } = await supabase
      .from('farmacia_cloud_inventory')
      .select('*')
      .eq('id', 'central_inventory')
      .single();

    if (error || !data) {
      return { success: false };
    }

    return {
      success: true,
      data: {
        products: data.products_data || [],
        batches: data.batches_data || [],
        alerts: data.alerts_data || [],
        updatedBy: data.updated_by,
      },
    };
  } catch (err) {
    return { success: false };
  }
}
