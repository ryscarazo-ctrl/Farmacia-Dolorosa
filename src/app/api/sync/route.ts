import { NextResponse } from 'next/server';
import { initialProducts, initialBatches, initialAlerts, initialSettings } from '../../../data/mockData';

// Base de datos sincronizada en la nube
let cloudDatabase: any = {
  version: '7.0',
  lastUpdated: Date.now(),
  products: initialProducts,
  batches: initialBatches,
  customers: [],
  suppliers: [],
  sales: [],
  purchases: [],
  movements: [],
  alerts: initialAlerts,
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
      if (Array.isArray(body.products) && body.products.length > 0) {
        cloudDatabase.products = body.products;
      }
      if (Array.isArray(body.batches)) {
        cloudDatabase.batches = body.batches;
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
        cloudDatabase.alerts = body.alerts;
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
