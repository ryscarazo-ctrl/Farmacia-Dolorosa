import { NextResponse } from 'next/server';
import { initialSettings } from '../../../data/mockData';

// Base de datos global en memoria de servidor (Nube Vercel)
let cloudDatabase: any = {
  version: '10.0',
  lastUpdated: Date.now(),
  products: [],
  batches: [],
  customers: [],
  suppliers: [],
  sales: [],
  purchases: [],
  movements: [],
  alerts: [],
  settings: initialSettings,
};

export async function GET() {
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
      if (Array.isArray(body.products)) {
        // Ignorar medicamentos de prueba legados si un cliente desactualizado intenta subirlos
        cloudDatabase.products = body.products.filter(
          (p: any) => p && !p.id?.startsWith('prod-0')
        );
      }
      if (Array.isArray(body.batches)) {
        cloudDatabase.batches = body.batches.filter(
          (b: any) => b && !b.id?.startsWith('bat-0')
        );
      }
      if (Array.isArray(body.customers)) {
        cloudDatabase.customers = body.customers;
      }
      if (Array.isArray(body.sales)) {
        cloudDatabase.sales = body.sales;
      }
      if (Array.isArray(body.movements)) {
        cloudDatabase.movements = body.movements;
      }
      if (Array.isArray(body.alerts)) {
        cloudDatabase.alerts = body.alerts.filter(
          (a: any) => a && !a.id?.startsWith('alt-req-')
        );
      }
      if (body.settings) {
        cloudDatabase.settings = body.settings;
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
