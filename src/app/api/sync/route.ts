import { NextResponse } from 'next/server';
import { initialProducts, initialBatches, initialSettings } from '../../../data/mockData';

// Base de datos global en memoria de servidor (Nube Vercel)
let cloudDatabase: any = {
  version: '12.0',
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
      if (Array.isArray(body.products) && body.products.length > 0) {
        cloudDatabase.products = body.products;
      }
      if (Array.isArray(body.batches) && body.batches.length > 0) {
        cloudDatabase.batches = body.batches;
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
