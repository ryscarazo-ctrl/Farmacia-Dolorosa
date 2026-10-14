import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CloudInventoryPayload {
  products: any[];
  batches: any[];
  alerts?: any[];
  updatedBy?: string;
  totalProducts?: number;
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseCredentials(): { url: string; key: string } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qoukrzummifhphjxialn.supabase.co';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D_QpR5KDWUxIJBkCaRD7hQ_d2Y23_ml';

  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('farmacia_supabase_url');
    const storedKey = localStorage.getItem('farmacia_supabase_anon_key');
    if (storedUrl) url = storedUrl.trim();
    if (storedKey) key = storedKey.trim();
  }

  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    cachedUrl = url;
    cachedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error al inicializar cliente Supabase:', err);
    return null;
  }
}

export function saveSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('farmacia_supabase_url', url.trim());
    localStorage.setItem('farmacia_supabase_anon_key', key.trim());
    cachedClient = null;
    cachedUrl = '';
    cachedKey = '';
  }
}

// 1. Probar conexion con Supabase
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; rowCount?: number }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Faltan la URL o la Llave Anon de Supabase.' };
  }

  try {
    const { data, error } = await client
      .from('farmacia_cloud_inventory')
      .select('id, updated_at, total_products, updated_by')
      .eq('id', 'central_inventory')
      .maybeSingle();

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'La tabla "farmacia_cloud_inventory" aún no existe en tu Supabase. Debes ejecutar el script SQL.',
        };
      }
      return { success: false, message: `Error de Supabase: ${error.message}` };
    }

    return {
      success: true,
      message: data ? `Conexión exitosa. Catálogo actual en la nube con ${data.total_products || 0} medicamentos.` : 'Conexión exitosa. Tabla lista.',
      rowCount: data?.total_products || 0,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error al conectar con la base de datos' };
  }
}

// 2. Subir inventario completo a la Nube (cuando Fatima o cualquier cajero sube o edita)
export async function uploadInventoryToCloud(payload: CloudInventoryPayload): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase no está configurado aún.' };
  }

  try {
    const { error } = await client
      .from('farmacia_cloud_inventory')
      .upsert({
        id: 'central_inventory',
        version: '1.0',
        updated_at: new Date().toISOString(),
        updated_by: payload.updatedBy || 'Usuario',
        total_products: payload.products?.length || 0,
        products_data: payload.products || [],
        batches_data: payload.batches || [],
        alerts_data: payload.alerts || [],
      });

    if (error) {
      console.error('[SUPABASE UPLOAD ERROR]', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: `¡Inventario (${payload.products?.length || 0} productos) sincronizado en la Nube con éxito!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error de conexión a la nube' };
  }
}

// 3. Descargar inventario mas reciente de la Nube (para sincronizar todos los telefonos)
export async function downloadInventoryFromCloud(): Promise<{ success: boolean; data?: CloudInventoryPayload; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Sin configurar' };
  }

  try {
    const { data, error } = await client
      .from('farmacia_cloud_inventory')
      .select('*')
      .eq('id', 'central_inventory')
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: error?.message || 'Sin datos' };
    }

    return {
      success: true,
      data: {
        products: data.products_data || [],
        batches: data.batches_data || [],
        alerts: data.alerts_data || [],
        updatedBy: data.updated_by,
        totalProducts: data.total_products,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
