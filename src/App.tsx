import React, { useState } from 'react';
import { Upload, FileText, Calculator, Download, Building, Car, ChevronDown } from 'lucide-react';

interface Gasto {
  concepto: string;
  importe: number;
}

interface CuotaPropietario {
  propietario: string;
  porcentaje: number;
  tabla1: number;
  tabla2: number;
  tabla3: number;
  totalAnual: number;
  totalMensual: number;
  desglose: {
    tabla1: Gasto[];
    tabla2: Gasto[];
    tabla3: Gasto[];
  };
}

const App: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cuotas, setCuotas] = useState<CuotaPropietario[]>([]);
  const [error, setError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [openOwners, setOpenOwners] = useState<Record<string, boolean>>({});

  // Porcentajes de participación correctos (suman 100%)
  const porcentajesParticipacion = {
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

  const propietariosConGaraje = ['1A', '1B', '1C', '2A', '2B', '3A', '3B'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Por favor, sube un archivo CSV válido.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        parseCSV(text);
      } catch (err) {
        setError('Error al leer el archivo.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const gastosParseados: Gasto[] = [];

    // Asumimos que el CSV tiene formato: concepto,importe
    lines.forEach((line, index) => {
      if (index === 0) return; // Saltar encabezado si existe
      
      // Parsear CSV manualmente para manejar comillas y comas correctamente
      let parts: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current);
          current = '';
          continue;
        }
        current += char;
      }
      parts.push(current);

      if (parts.length < 2) return;

      const concepto = parts[0].trim().replace(/^"|"$/g, '');
      const importeStr = parts[parts.length - 1].trim().replace(/^"|"$/g, '');
      
      // Convertir formato europeo (1.234,56) a formato americano (1234.56)
      let importeLimpio = importeStr.replace(/\./g, ''); // Eliminar puntos de miles
      importeLimpio = importeLimpio.replace(/,/, '.'); // Cambiar coma decimal por punto
      
      const importe = parseFloat(importeLimpio);
      
      if (concepto && !isNaN(importe) && importe > 0) {
        gastosParseados.push({ concepto, importe });
      }
    });

    if (gastosParseados.length === 0) {
      setError('No se encontraron gastos válidos en el archivo.');
      return;
    }

    setGastos(gastosParseados);
    calcularCuotas(gastosParseados);
  };

  const calcularCuotas = (gastos: Gasto[]) => {
    setIsCalculating(true);
    
    // Categorizar gastos
    const tabla1: Gasto[] = []; // Sin "edificio" ni "garaje"
    const tabla2: Gasto[] = []; // Con "garaje"
    const tabla3: Gasto[] = []; // Con "edificio"

    gastos.forEach(gasto => {
      const conceptoLower = gasto.concepto.toLowerCase();
      
      if (conceptoLower.includes('garaje')) {
        tabla2.push(gasto);
      } else if (conceptoLower.includes('edificio')) {
        tabla3.push(gasto);
      } else {
        tabla1.push(gasto);
      }
    });

    const totalTabla1 = tabla1.reduce((sum, gasto) => sum + gasto.importe, 0);
    const totalTabla2 = tabla2.reduce((sum, gasto) => sum + gasto.importe, 0);
    const totalTabla3 = tabla3.reduce((sum, gasto) => sum + gasto.importe, 0);

    // Calcular cuotas para cada propietario
    const cuotasCalculadas: CuotaPropietario[] = [];

    Object.entries(porcentajesParticipacion).forEach(([propietario, porcentaje]) => {
      let tabla1Importe = 0;
      let tabla2Importe = 0;
      let tabla3Importe = 0;

      // Tabla 1: Todos pagan según su porcentaje
      tabla1Importe = (porcentaje / 100) * totalTabla1;

      // Tabla 2: Solo propietarios con garaje (excepto Bajo)
      if (propietario !== 'Bajo' && propietariosConGaraje.includes(propietario)) {
        tabla2Importe = totalTabla2 / 7; // Dividido entre 7 propietarios
      }

      // Tabla 3: Todos excepto el garaje
      if (propietario !== 'Garaje') {
        // Calcular porcentaje ajustado sin el garaje
        const porcentajeAjustado = (porcentaje / (100 - 20.67)) * 100;
        tabla3Importe = (porcentajeAjustado / 100) * totalTabla3;
      }

      const totalAnual = tabla1Importe + tabla2Importe + tabla3Importe;

      cuotasCalculadas.push({
        propietario,
        porcentaje,
        tabla1: tabla1Importe,
        tabla2: tabla2Importe,
        tabla3: tabla3Importe,
        totalAnual,
        totalMensual: totalAnual / 12,
        desglose: {
          tabla1: tabla1.map(gasto => ({
            concepto: gasto.concepto,
            importe: (porcentaje / 100) * gasto.importe
          })),
          tabla2: propietario !== 'Bajo' && propietariosConGaraje.includes(propietario) 
            ? tabla2.map(gasto => ({
                concepto: gasto.concepto,
                importe: gasto.importe / 7
              }))
            : [],
          tabla3: propietario !== 'Garaje'
            ? tabla3.map(gasto => {
                const porcentajeAjustado = (porcentaje / (100 - 20.67)) * 100;
                return {
                  concepto: gasto.concepto,
                  importe: (porcentajeAjustado / 100) * gasto.importe
                };
              })
            : []
        }
      });
    });

    setCuotas(cuotasCalculadas);
    setIsCalculating(false);
  };

  const exportarResultados = () => {
    const csvContent = [
      ['Propietario', 'Porcentaje (%)', 'Tabla 1 (€)', 'Tabla 2 (€)', 'Tabla 3 (€)', 'Total Anual (€)', 'Total Mensual (€)'],
      ...cuotas.map(c => [
        c.propietario,
        c.porcentaje.toFixed(2),
        c.tabla1.toFixed(2),
        c.tabla2.toFixed(2),
        c.tabla3.toFixed(2),
        c.totalAnual.toFixed(2),
        c.totalMensual.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cuotas_comunidad.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleOwner = (owner: string) => {
    setOpenOwners(prev => ({ ...prev, [owner]: !prev[owner] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Calculadora de Cuotas de Comunidad</h1>
          </div>
          
          <p className="text-gray-600 mb-8 text-lg">
            Sube un archivo CSV con los gastos de tu comunidad y calcula automáticamente las cuotas de cada propietario/a.
          </p>

          {/* Carga de archivo */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">Cargar Archivo CSV</h2>
            </div>
            
            <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Haz clic aquí o arrastra tu archivo CSV</p>
                <p className="text-sm text-gray-500">El archivo debe contener: concepto, importe</p>
              </label>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Gastos cargados */}
          {gastos.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Gastos Cargados ({gastos.length})</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Tabla 1 (General)</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {gastos.filter(g => !g.concepto.toLowerCase().includes('garaje') && !g.concepto.toLowerCase().includes('edificio')).length} conceptos
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Tabla 2 (Garaje)</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {gastos.filter(g => g.concepto.toLowerCase().includes('garaje')).length} conceptos
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">Tabla 3 (Edificio)</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {gastos.filter(g => g.concepto.toLowerCase().includes('edificio')).length} conceptos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultados */}
          {cuotas.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Cuotas Calculadas</h2>
                <button
                  onClick={exportarResultados}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Propietario</th>
                      <th className="px-6 py-4 text-center">Porcentaje</th>
                      <th className="px-6 py-4 text-right">Tabla 1 (€)</th>
                      <th className="px-6 py-4 text-right">Tabla 2 (€)</th>
                      <th className="px-6 py-4 text-right">Tabla 3 (€)</th>
                      <th className="px-6 py-4 text-right">Anual (€)</th>
                      <th className="px-6 py-4 text-right">Mensual (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuotas.map((cuota, index) => (
                      <tr key={cuota.propietario} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-colors`}>
                        <td className="px-6 py-4 font-semibold text-gray-800">{cuota.propietario}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{cuota.porcentaje}%</td>
                        <td className="px-6 py-4 text-right text-blue-600 font-medium">{cuota.tabla1.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-medium">{cuota.tabla2.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-purple-600 font-medium">{cuota.tabla3.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-indigo-800">{cuota.totalAnual.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-700">{cuota.totalMensual.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-indigo-100 font-bold">
                      <td className="px-6 py-4">TOTAL</td>
                      <td className="px-6 py-4 text-center">100%</td>
                      <td className="px-6 py-4 text-right text-blue-800">
                        {cuotas.reduce((sum, c) => sum + c.tabla1, 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-green-800">
                        {cuotas.reduce((sum, c) => sum + c.tabla2, 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-purple-800">
                        {cuotas.reduce((sum, c) => sum + c.tabla3, 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-indigo-900">
                        {cuotas.reduce((sum, c) => sum + c.totalAnual, 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-green-900">
                        {cuotas.reduce((sum, c) => sum + c.totalMensual, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Desglose detallado */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Desglose Detallado</h3>
                <div className="grid gap-6">
                  {cuotas.map(cuota => (
                    <div key={cuota.propietario} className="bg-white rounded-lg p-4 shadow-sm">
                      <button
                        onClick={() => toggleOwner(cuota.propietario)}
                        className="w-full flex items-center justify-between font-bold text-lg text-gray-800 mb-3"
                        aria-expanded={!!openOwners[cuota.propietario]}
                      >
                        <span>{cuota.propietario}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${openOwners[cuota.propietario] ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`${openOwners[cuota.propietario] ? 'grid' : 'hidden'} grid-cols-1 gap-4`}>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            Tabla 1 - General
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="grid grid-cols-3 gap-2 font-semibold text-gray-700 mb-2">
                              <div>Concepto</div>
                              <div className="text-right">Mensual</div>
                              <div className="text-right">Anual</div>
                            </div>
                            {cuota.desglose.tabla1.map((gasto, idx) => (
                              <div key={idx} className="grid grid-cols-3 gap-2">
                                <span className="text-gray-600">{gasto.concepto} ({cuota.porcentaje}%):</span>
                                <span className="text-right">{(gasto.importe / 12).toFixed(2)} €</span>
                                <span className="text-right">{gasto.importe.toFixed(2)} €</span>
                              </div>
                            ))}
                            <div className="border-t pt-1 mt-2 grid grid-cols-3 gap-2 font-semibold">
                              <span>Subtotal:</span>
                              <span className="text-right">{(cuota.tabla1 / 12).toFixed(2)} €</span>
                              <span className="text-right">{cuota.tabla1.toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            Tabla 2 - Garaje
                          </h5>
                          {cuota.desglose.tabla2.length > 0 ? (
                            <div className="space-y-1 text-sm">
                              <div className="grid grid-cols-3 gap-2 font-semibold text-gray-700 mb-2">
                                <div>Concepto</div>
                                <div className="text-right">Mensual</div>
                                <div className="text-right">Anual</div>
                              </div>
                              {cuota.desglose.tabla2.map((gasto, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-2">
                                  <span className="text-gray-600">{gasto.concepto} (1/7):</span>
                                  <span className="text-right">{(gasto.importe / 12).toFixed(2)} €</span>
                                  <span className="text-right">{gasto.importe.toFixed(2)} €</span>
                                </div>
                              ))}
                              <div className="border-t pt-1 mt-2 grid grid-cols-3 gap-2 font-semibold">
                                <span>Subtotal:</span>
                                <span className="text-right">{(cuota.tabla2 / 12).toFixed(2)} €</span>
                                <span className="text-right">{cuota.tabla2.toFixed(2)} €</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No aplica a este propietario</p>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Tabla 3 - Edificio
                          </h5>
                          {cuota.desglose.tabla3.length > 0 ? (
                            <div className="space-y-1 text-sm">
                              <div className="grid grid-cols-3 gap-2 font-semibold text-gray-700 mb-2">
                                <div>Concepto</div>
                                <div className="text-right">Mensual</div>
                                <div className="text-right">Anual</div>
                              </div>
                              {cuota.desglose.tabla3.map((gasto, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-2">
                                  <span className="text-gray-600">{gasto.concepto} ({((cuota.porcentaje / (100 - 20.67)) * 100).toFixed(2)}%):</span>
                                  <span className="text-right">{(gasto.importe / 12).toFixed(2)} €</span>
                                  <span className="text-right">{gasto.importe.toFixed(2)} €</span>
                                </div>
                              ))}
                              <div className="border-t pt-1 mt-2 grid grid-cols-3 gap-2 font-semibold">
                                <span>Subtotal:</span>
                                <span className="text-right">{(cuota.tabla3 / 12).toFixed(2)} €</span>
                                <span className="text-right">{cuota.tabla3.toFixed(2)} €</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No aplica al garaje</p>
                          )}
                        </div>
                        <div className="border-t pt-2 mt-4 grid grid-cols-3 gap-2 font-bold">
                          <span>Total</span>
                          <span className="text-right">{cuota.totalMensual.toFixed(2)} €</span>
                          <span className="text-right">{cuota.totalAnual.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;