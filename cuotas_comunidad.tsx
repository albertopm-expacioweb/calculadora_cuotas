import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const CuotasComunidad = () => {
  const [propietariaSeleccionada, setPropietariaSeleccionada] = useState(null);

  // TABLA 1: Conceptos SIN "edificio" ni "garaje"
  const gastosTabla1 = {
    'Administrador': 494.40,
    'Energía eléctrica edificio': 600,
    'Mantenimiento y reparaciones': 43.26,
    'Material oficina': 20,
    'Gastos financieros': 30,
    'Primas seguros': 800,
    'Gastos varios': 50,
    'Ascensor': 1812,
    'Agua': 200,
    'Atenciones judiciales': 10,
    'Tasas municipales': 300,
    'Fondo de reserva': 516.97
  };

  // TABLA 2: Conceptos con "garaje"
  const gastosTabla2 = {
    'Energía eléctrica garajes': 400,
    'Tasas municipales garaje': 150,
    'Mantenimiento garaje': 10
  };

  // TABLA 3: Conceptos con "edificio" (solo Limpieza)
  const gastosTabla3 = {
    'Limpieza edificio': 250
  };

  // Porcentajes de vivienda (sin garaje)
  const porcentajesVivienda = {
    'Garaje': 20.67,
    'Bajo': 20.67,
    '1A': 8.61,
    '1B': 6.13,
    '1C': 5.59,
    '2A': 10.21,
    '2B': 9.91,
    '3A': 9.32,
    '3B': 8.89
  };

  const propietariasConGaraje = ['1A', '1B', '1C', '2A', '2B', '3A', '3B'];
  const totalPorcentajesVivienda = Object.values(porcentajesVivienda).reduce((a, b) => a + b, 0);
  const totalPorcentajesSinGaraje = totalPorcentajesVivienda - 20.67; // 79.33%

  const totalTabla1 = Object.values(gastosTabla1).reduce((a, b) => a + b, 0);
  const totalTabla2 = Object.values(gastosTabla2).reduce((a, b) => a + b, 0);
  const totalTabla3 = Object.values(gastosTabla3).reduce((a, b) => a + b, 0);
  const totalPresupuesto = totalTabla1 + totalTabla2 + totalTabla3;

  // Calcular cuotas
  const calcularCuotas = () => {
    const resultado = {};
    const desglose = {};

    Object.keys(porcentajesVivienda).forEach(prop => {
      desglose[prop] = {
        tabla1: {},
        tabla2: {},
        tabla3: {},
        totalTabla1: 0,
        totalTabla2: 0,
        totalTabla3: 0,
        total: 0
      };

      // TABLA 1: Todos pagan según su %
      Object.entries(gastosTabla1).forEach(([concepto, importe]) => {
        const pago = (porcentajesVivienda[prop] / 100) * importe;
        desglose[prop].tabla1[concepto] = pago;
        desglose[prop].totalTabla1 += pago;
      });

      // TABLA 2: Solo las 7 con garaje, a partes iguales
      if (propietariasConGaraje.includes(prop)) {
        Object.entries(gastosTabla2).forEach(([concepto, importe]) => {
          const pago = importe / 7;
          desglose[prop].tabla2[concepto] = pago;
          desglose[prop].totalTabla2 += pago;
        });
      }

      // TABLA 3: Las 8 propietarias (NO Garaje), proporcionalmente
      if (prop !== 'Garaje') {
        Object.entries(gastosTabla3).forEach(([concepto, importe]) => {
          const porcentajeAjustado = (porcentajesVivienda[prop] / totalPorcentajesSinGaraje) * 100;
          const pago = (porcentajeAjustado / 100) * importe;
          desglose[prop].tabla3[concepto] = pago;
          desglose[prop].totalTabla3 += pago;
        });
      }

      desglose[prop].total = desglose[prop].totalTabla1 + desglose[prop].totalTabla2 + desglose[prop].totalTabla3;
      resultado[prop] = desglose[prop].total;
    });

    return { resultado, desglose };
  };

  const { resultado: cuotasFinales, desglose } = calcularCuotas();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">Cuotas Comunidad Vecinal</h1>
        </div>

        {/* Resumen de las 3 Tablas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* TABLA 1 */}
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="font-bold text-lg text-blue-900 mb-3">Tabla 1: General</h3>
            <p className="text-xs text-blue-700 mb-2">Sin "edificio" ni "garaje"</p>
            <div className="space-y-1 text-xs max-h-48 overflow-y-auto">
              {Object.entries(gastosTabla1).map(([concepto, importe]) => (
                <div key={concepto} className="flex justify-between">
                  <span className="text-gray-700">{concepto}:</span>
                  <span className="font-semibold">{importe.toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t-2 border-blue-300 flex justify-between font-bold text-blue-900">
              <span>TOTAL:</span>
              <span>{totalTabla1.toFixed(2)} €</span>
            </div>
            <div className="mt-2 text-xs text-blue-700">
              * Pagan TODAS (Garaje + 8 propietarias) según %
            </div>
          </div>

          {/* TABLA 2 */}
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h3 className="font-bold text-lg text-green-900 mb-3">Tabla 2: Garaje</h3>
            <p className="text-xs text-green-700 mb-2">Conceptos con "garaje"</p>
            <div className="space-y-1 text-xs">
              {Object.entries(gastosTabla2).map(([concepto, importe]) => (
                <div key={concepto} className="flex justify-between">
                  <span className="text-gray-700">{concepto}:</span>
                  <span className="font-semibold">{importe.toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t-2 border-green-300 flex justify-between font-bold text-green-900">
              <span>TOTAL:</span>
              <span>{totalTabla2.toFixed(2)} €</span>
            </div>
            <div className="mt-2 text-xs text-green-700">
              * Pagan 7 propietarias a partes iguales (80€ cada una)
            </div>
          </div>

          {/* TABLA 3 */}
          <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <h3 className="font-bold text-lg text-purple-900 mb-3">Tabla 3: Edificio</h3>
            <p className="text-xs text-purple-700 mb-2">Conceptos con "edificio"</p>
            <div className="space-y-1 text-xs">
              {Object.entries(gastosTabla3).map(([concepto, importe]) => (
                <div key={concepto} className="flex justify-between">
                  <span className="text-gray-700">{concepto}:</span>
                  <span className="font-semibold">{importe.toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t-2 border-purple-300 flex justify-between font-bold text-purple-900">
              <span>TOTAL:</span>
              <span>{totalTabla3.toFixed(2)} €</span>
            </div>
            <div className="mt-2 text-xs text-purple-700">
              * Pagan 8 propietarias (NO Garaje) proporcionalmente
            </div>
          </div>
        </div>

        {/* Cuotas Finales */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cuotas Anuales y Mensuales</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Propietaria</th>
                  <th className="px-4 py-3 text-center">% Vivienda</th>
                  <th className="px-4 py-3 text-right">Tabla 1</th>
                  <th className="px-4 py-3 text-right">Tabla 2</th>
                  <th className="px-4 py-3 text-right">Tabla 3</th>
                  <th className="px-4 py-3 text-right">Anual</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Mensual</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cuotasFinales)
                  .sort((a, b) => {
                    const order = ['Bajo', '1A', '1B', '1C', '2A', '2B', '3A', '3B', 'Garaje'];
                    return order.indexOf(a[0]) - order.indexOf(b[0]);
                  })
                  .map(([prop, anual], idx) => (
                    <React.Fragment key={prop}>
                      <tr 
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer hover:bg-indigo-100 transition`}
                        onClick={() => setPropietariaSeleccionada(propietariaSeleccionada === prop ? null : prop)}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          <div className="flex items-center gap-2">
                            {prop}
                            {propietariaSeleccionada === prop ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{porcentajesVivienda[prop]}%</td>
                        <td className="px-4 py-3 text-right text-blue-700">{desglose[prop].totalTabla1.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-right text-green-700">{desglose[prop].totalTabla2.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-right text-purple-700">{desglose[prop].totalTabla3.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-right font-semibold text-indigo-900">{anual.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-right font-bold text-green-800">{(anual / 12).toFixed(2)} €</td>
                      </tr>
                      {propietariaSeleccionada === prop && (
                        <tr className="bg-blue-50">
                          <td colSpan="7" className="px-4 py-4">
                            <div className="text-sm">
                              <h4 className="font-bold text-gray-800 mb-3">Desglose detallado de {prop}:</h4>
                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <h5 className="font-semibold text-blue-900 mb-2">Tabla 1 ({porcentajesVivienda[prop]}%):</h5>
                                  {Object.entries(desglose[prop].tabla1).map(([concepto, importe]) => (
                                    <div key={concepto} className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-700">{concepto}:</span>
                                      <span>{importe.toFixed(2)} €</span>
                                    </div>
                                  ))}
                                  <div className="font-semibold mt-2 pt-2 border-t flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{desglose[prop].totalTabla1.toFixed(2)} €</span>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-green-900 mb-2">Tabla 2 (garaje):</h5>
                                  {desglose[prop].totalTabla2 > 0 ? (
                                    <>
                                      {Object.entries(desglose[prop].tabla2).map(([concepto, importe]) => (
                                        <div key={concepto} className="flex justify-between text-xs mb-1">
                                          <span className="text-gray-700">{concepto}:</span>
                                          <span>{importe.toFixed(2)} €</span>
                                        </div>
                                      ))}
                                      <div className="font-semibold mt-2 pt-2 border-t flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{desglose[prop].totalTabla2.toFixed(2)} €</span>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">No aplica</p>
                                  )}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-purple-900 mb-2">Tabla 3 (edificio):</h5>
                                  {desglose[prop].totalTabla3 > 0 ? (
                                    <>
                                      {Object.entries(desglose[prop].tabla3).map(([concepto, importe]) => (
                                        <div key={concepto} className="flex justify-between text-xs mb-1">
                                          <span className="text-gray-700">{concepto}:</span>
                                          <span>{importe.toFixed(2)} €</span>
                                        </div>
                                      ))}
                                      <div className="font-semibold mt-2 pt-2 border-t flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{desglose[prop].totalTabla3.toFixed(2)} €</span>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">No aplica</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                <tr className="bg-indigo-100 font-bold text-lg">
                  <td className="px-4 py-3 rounded-bl-lg">TOTAL</td>
                  <td className="px-4 py-3 text-center">100%</td>
                  <td className="px-4 py-3 text-right text-blue-900">{totalTabla1.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right text-green-900">{totalTabla2.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right text-purple-900">{totalTabla3.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right text-indigo-900">
                    {Object.values(cuotasFinales).reduce((a, b) => a + b, 0).toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-right text-green-900 rounded-br-lg">
                    {(Object.values(cuotasFinales).reduce((a, b) => a + b, 0) / 12).toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3">* Haz clic en cada propietaria para ver el desglose detallado por tabla</p>
          <p className="text-xs text-amber-600 mt-1">* Presupuesto total: {totalPresupuesto.toFixed(2)} € | Suma cuotas: {Object.values(cuotasFinales).reduce((a, b) => a + b, 0).toFixed(2)} € (diferencia por redondeo: {Math.abs(totalPresupuesto - Object.values(cuotasFinales).reduce((a, b) => a + b, 0)).toFixed(2)} €)</p>
        </div>

        {/* Notas explicativas */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <h3 className="font-bold text-yellow-900 mb-2">Criterios de reparto:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Tabla 1:</strong> Todos pagan según su % de vivienda (Garaje 20.67%, Bajo 20.67%, resto según corresponda)</li>
            <li>• <strong>Tabla 2:</strong> Solo las 7 propietarias con garaje (1A a 3B) pagan a partes iguales: 80€ cada una</li>
            <li>• <strong>Tabla 3:</strong> Las 8 propietarias (NO el Garaje) pagan proporcionalmente: Bajo 26.05%, 1A 10.85%, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CuotasComunidad;