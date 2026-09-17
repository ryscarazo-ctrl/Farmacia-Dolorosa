'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  UserCheck,
  ShieldCheck,
  ShoppingCart,
  HardDrive,
  Printer,
  Search,
  CheckCircle2,
  Lock,
  PackagePlus,
  Layers,
  DollarSign,
  Vault,
  Eye,
  KeyRound,
  Download,
  Upload,
  AlertTriangle,
  Receipt,
  Building,
  Menu,
} from 'lucide-react';

export const ManualView: React.FC<{ onNavigate?: (view: any) => void }> = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState<'all' | 'jonathan' | 'maria' | 'fatima' | 'backup'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      {/* Banner Principal del Manual */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-xl shadow-emerald-950/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>Centro de Capacitación Oficial • Farmacia Espíritu Santo 🕊️</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Manual de Usuario Interactivo
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            Guía paso a paso ilustrada para cada rol del sistema: Super Administrador, Propietaria y Vendedora/Cajera.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 border border-white"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Imprimir Manual</span>
          </button>
        </div>
      </div>

      {/* Selector de Roles y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Filtro por Rol */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRole('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedRole === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            Todos los Módulos
          </button>
          <button
            onClick={() => setSelectedRole('jonathan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedRole === 'jonathan'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            <span>👑 Jonathan Rojas (Creador)</span>
          </button>
          <button
            onClick={() => setSelectedRole('maria')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedRole === 'maria'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            <span>👩‍💼 María Tardencilla (Propietaria)</span>
          </button>
          <button
            onClick={() => setSelectedRole('fatima')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedRole === 'fatima'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            <span>🛒 Fátima Selene (Vendedora)</span>
          </button>
          <button
            onClick={() => setSelectedRole('backup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedRole === 'backup'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            <span>💾 Copias de Seguridad</span>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tema o procedimiento..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* SECCIÓN 1: CREDENCIALES OFICIALES */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-600" />
          <span>Tabla Oficial de Cuentas y Accesos Privados</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tarjeta Jonathan */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 border-2 border-emerald-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                Super Administrador
              </span>
              <span className="text-xs">👑 Creador</span>
            </div>
            <div className="font-black text-sm text-slate-900">Jonathan Rojas</div>
            <div className="text-xs space-y-1 text-slate-600 font-medium">
              <div><span className="font-bold">Usuario:</span> <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold border border-emerald-200">jonathan</code></div>
              <div><span className="font-bold">Contraseña:</span> <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold border border-emerald-200">Jonathan2026*</code></div>
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">Acceso Maestro Total</div>
            </div>
          </div>

          {/* Tarjeta María */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Propietaria & Admin
              </span>
              <span className="text-xs">👩‍💼 Gerencia</span>
            </div>
            <div className="font-black text-sm text-slate-900">María Tardencilla</div>
            <div className="text-xs space-y-1 text-slate-600 font-medium">
              <div><span className="font-bold">Usuario:</span> <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold border border-emerald-200">maria</code></div>
              <div><span className="font-bold">Contraseña:</span> <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold border border-emerald-200">Maria2026*</code></div>
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">Inventario, Compras y Finanzas</div>
            </div>
          </div>

          {/* Tarjeta Fátima */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
                Vendedora & Cajera
              </span>
              <span className="text-xs">🛒 Mostrador</span>
            </div>
            <div className="font-black text-sm text-slate-900">Fátima Selene</div>
            <div className="text-xs space-y-1 text-slate-600 font-medium">
              <div><span className="font-bold">Usuario:</span> <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold border border-emerald-200">fatima</code></div>
              <div><span className="font-bold">Contraseña:</span> <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-800 font-bold border border-emerald-200">Fatima2026*</code></div>
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">Punto de Venta (POS) y Caja</div>
            </div>
          </div>
        </div>
      </div>

      {/* GUÍAS PASO A PASO POR ROL */}

      {/* 👑 MANUAL JONATHAN ROJAS */}
      {(selectedRole === 'all' || selectedRole === 'jonathan') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>1. Guía para Jonathan Rojas (Super Administrador / Creador)</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Nivel: Maestro
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>Copias de Seguridad (Backup)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Entra a <strong>Copia de Seguridad (Backup)</strong> en el menú lateral. Haz clic en <strong>Descargar Copia de Seguridad (.JSON)</strong> para guardar todo el inventario, clientes y ventas en un archivo de respaldo seguro.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Configuración y Parámetros</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                En <strong>Configuración</strong> puedes cambiar el nombre de la farmacia, NIT, teléfono, dirección matriz y el pie de bendición que aparece en los tickets impresos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 👩‍💼 MANUAL MARÍA TARDENCILLA */}
      {(selectedRole === 'all' || selectedRole === 'maria') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-600" />
              <span>2. Guía para María Tardencilla (Propietaria & Administradora)</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Inventario & Finanzas
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-emerald-700" />
                <span>Cómo Ingresar un Nuevo Medicamento al Sistema:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed pl-1">
                <li>Haz clic en <strong>+ Ingresar Medicamento</strong> en el menú lateral.</li>
                <li>Escribe el <strong>Nombre Comercial</strong> *(ej: Acetaminofén 500mg MK)* y <strong>Principio Activo</strong> *(Paracetamol)*.</li>
                <li>Selecciona la <strong>Categoría</strong> y escanea el <strong>Código de Barras</strong> de la caja.</li>
                <li>Ingresa el <strong>Precio de Costo</strong> y el <strong>Precio de Venta al Público ($)</strong>.</li>
                <li>Digita el <strong>Número de Lote</strong> y la <strong>Fecha de Vencimiento</strong> para activar el semáforo FEFO.</li>
                <li>Ingresa el <strong>Stock Inicial</strong> recibido y haz clic en <strong>Guardar Medicamento</strong>.</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Semáforo de Vencimientos (FEFO)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  En <strong>Control de Lotes</strong>: <br />
                  🟢 <strong>Verde:</strong> Válido (&gt;60 días). <br />
                  🟡 <strong>Amarillo:</strong> Crítico (&lt;30 días para vencer). <br />
                  🔴 <strong>Rojo:</strong> Vencido (bloqueado para la venta automática).
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Gastos Operativos & Ganancias</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Registra pagos de luz, agua, alquiler o proveedores en <strong>Gastos Operativos</strong> para ver tu margen de ganancia neta en tiempo real.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🛒 MANUAL FÁTIMA SELENE */}
      {(selectedRole === 'all' || selectedRole === 'fatima') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span>3. Guía para Fátima Selene (Vendedora & Cajera)</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Mostrador & POS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Paso 1 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Vault className="w-4 h-4 text-emerald-600" />
                <span>1. Apertura de Caja</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Al iniciar tu turno, entra a <strong>Arqueo & Cierre de Caja</strong>, escribe el fondo inicial en monedas y billetes (ej: $50.00) y haz clic en <strong>Abrir Turno</strong>.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>2. Cobrar en el POS</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Escanea el código de barras o busca el medicamento, ajusta la cantidad con <strong>+</strong> o <strong>-</strong> y presiona el botón verde <strong>COBRAR</strong>.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>3. Vuelto & Ticket</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Ingresa el monto recibido, el sistema calcula el <strong>cambio/vuelto exacto</strong>. Confirma para emitir e imprimir el ticket térmico con el lote y fecha de vencimiento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 💾 GUÍA DE COPIAS DE SEGURIDAD */}
      {(selectedRole === 'all' || selectedRole === 'backup') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              <span>4. Guía de Copias de Seguridad (Backup) y Buenas Prácticas</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Seguridad de Datos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-700" />
                <span>¿Cómo respaldar la información?</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Entra a <strong>Copia de Seguridad (Backup)</strong> en el menú lateral y haz clic en <strong>Descargar Copia de Seguridad (.JSON)</strong>. Guarda este archivo en tu computadora, correo o memoria USB al menos una vez por semana.
              </p>
            </div>

            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-2">
              <div className="font-bold text-teal-950 flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-700" />
                <span>¿Cómo restaurar en otro celular o PC?</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Abre el enlace en el nuevo dispositivo, entra a <strong>Copia de Seguridad (Backup)</strong>, toca <strong>Seleccionar Archivo de Respaldo (.JSON)</strong> y selecciona tu archivo guardado. Todo se restaurará de inmediato.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
