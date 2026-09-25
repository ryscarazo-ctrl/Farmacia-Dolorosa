import { NextResponse } from 'next/server';
import { initialProducts, initialBatches, initialSettings } from '../../../data/mockData';

// Base de datos global en memoria de servidor (Nube Vercel)
let cloudDatabase: any = {
  version: '15.0',
  lastUpdated: Date.now(),
  products: initialProducts,
  batches: initialBatches,
  customers: [],
  suppliers: [],
  sales: [],
  purchases: [],
  movements: [],
  alerts: [],
  settings: initialSettings,
  cashSessions: [],
};

export async function GET() {
  if (!cloudDatabase.products || cloudDatabase.products.length === 0) {
    cloudDatabase.products = initialProducts;
  }
  if (!cloudDatabase.batches || cloudDatabase.batches.length === 0) {
    cloudDatabase.batches = initialBatches;
  }
  return NextResponse.json({
    success: true,
    data: cloudDatabase,
    lastUpdated: cloudDatabase.lastUpdated,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body && typeof body === 'object') {
      
      // =========================================================================
      // 🛡️ ESCUDO ANTI-PÉRDIDA DE CÓDIGOS DE BARRA Y PRODUCTOS (SMART MERGE)
      // =========================================================================
      if (Array.isArray(body.products) && body.products.length > 0) {
        const prodMap = new Map<string, any>();
        
        // 1. Indexar productos existentes en el servidor
        (cloudDatabase.products || []).forEach((p: any) => {
          if (p && (p.id || p.sku || p.name)) {
            prodMap.set(p.id || p.sku || p.name, p);
          }
        });

        // 2. Fusionar inteligentemente los productos entrantes SIN BORRAR códigos de barra reales
        body.products.forEach((incoming: any) => {
          if (!incoming) return;
          const key = incoming.id || incoming.sku || incoming.name;

          // Buscar coincidencia existente por ID, SKU o Nombre Comercial
          let existing = prodMap.get(key);
          if (!existing) {
            for (const item of Array.from(prodMap.values())) {
              if (
                (incoming.sku && item.sku && incoming.sku.trim().toLowerCase() === item.sku.trim().toLowerCase()) ||
                (incoming.name && item.name && incoming.name.trim().toLowerCase() === item.name.trim().toLowerCase())
              ) {
                existing = item;
                break;
              }
            }
          }

          if (existing) {
            const exBarcode = (existing.barcode || '').trim();
            const inBarcode = (incoming.barcode || '').trim();

            // Decidir el código de barra ganador con máxima inmunidad:
            // Si existing o incoming tienen un código real (que no sea provisorio 7441...), se PRESERVA SIEMPRE
            let protectedBarcode = inBarcode || exBarcode;
            if (exBarcode && !exBarcode.startsWith('7441')) {
              if (!inBarcode || inBarcode.startsWith('7441')) {
                protectedBarcode = exBarcode;
              }
            } else if (inBarcode && !inBarcode.startsWith('7441')) {
              protectedBarcode = inBarcode;
            }

            const merged = {
              ...existing,
              ...incoming,
              id: existing.id || incoming.id,
              barcode: protectedBarcode,
              salePrice: incoming.salePrice > 0 ? incoming.salePrice : existing.salePrice,
              purchasePrice: incoming.purchasePrice > 0 ? incoming.purchasePrice : existing.purchasePrice,
              minStock: incoming.minStock > 0 ? incoming.minStock : existing.minStock,
              isActive: incoming.isActive !== undefined ? incoming.isActive : existing.isActive,
            };
            prodMap.set(merged.id || key, merged);
          } else {
            prodMap.set(key, incoming);
          }
        });

        cloudDatabase.products = Array.from(prodMap.values());
      }

      // Fusión acumulativa de Lotes
      if (Array.isArray(body.batches) && body.batches.length > 0) {
        const batchMap = new Map<string, any>();
        (cloudDatabase.batches || []).forEach((b: any) => {
          if (b && b.id) batchMap.set(b.id, b);
        });
        body.batches.forEach((b: any) => {
          if (b && b.id) batchMap.set(b.id, b);
        });
        cloudDatabase.batches = Array.from(batchMap.values());
      }

      if (Array.isArray(body.customers)) {
        cloudDatabase.customers = body.customers;
      }

      // Fusión acumulativa de ventas: NUNCA perder ni borrar ventas ya realizadas
      if (Array.isArray(body.sales) && body.sales.length > 0) {
        const salesMap = new Map((cloudDatabase.sales || []).map((s: any) => [s.id, s]));
        body.sales.forEach((s: any) => {
          if (s && s.id) {
            salesMap.set(s.id, s);
          }
        });
        cloudDatabase.sales = Array.from(salesMap.values()).sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Fusión acumulativa de movimientos Kardex
      if (Array.isArray(body.movements) && body.movements.length > 0) {
        const movMap = new Map((cloudDatabase.movements || []).map((m: any) => [m.id, m]));
        body.movements.forEach((m: any) => {
          if (m && m.id) {
            movMap.set(m.id, m);
          }
        });
        cloudDatabase.movements = Array.from(movMap.values()).sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (Array.isArray(body.alerts)) {
        cloudDatabase.alerts = body.alerts;
      }
      if (body.settings) {
        cloudDatabase.settings = body.settings;
      }

      // Fusión de turnos de caja
      if (Array.isArray(body.cashSessions) && body.cashSessions.length > 0) {
        const sessionMap = new Map((cloudDatabase.cashSessions || []).map((cs: any) => [cs.id, cs]));
        body.cashSessions.forEach((cs: any) => {
          if (cs && cs.id) {
            sessionMap.set(cs.id, cs);
          }
        });
        cloudDatabase.cashSessions = Array.from(sessionMap.values());
      }

      cloudDatabase.lastUpdated = Date.now();
    }

    return NextResponse.json({
      success: true,
      data: cloudDatabase,
      lastUpdated: cloudDatabase.lastUpdated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
