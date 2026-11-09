import { useEffect, useState } from 'react';
import { db } from '../db/local';
import type { SchoolDay } from '../api/contract';

const ETIQUETA_TIPO: Record<string, string> = {
  FESTIVO: 'festivo', VACACIONES: 'vacaciones',
  INSTITUCIONAL: 'jornada institucional', SUSPENDIDO: 'día suspendido',
};

type Props = { valor: string; onChange: (fecha: string) => void; max: string };

const finDeSemana = (iso: string) => [0, 6].includes(new Date(`${iso}T12:00`).getDay());
const nombreDia = (iso: string) =>
  ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][new Date(`${iso}T12:00`).getDay()];

export default function SelectorFecha({ valor, onChange, max }: Props) {
  const [dia, setDia] = useState<SchoolDay | undefined>();
  const [consultado, setConsultado] = useState(false);
  const [recientes, setRecientes] = useState<string[]>([]);

  useEffect(() => {
    setConsultado(false);
    void db.schoolDays.get(valor).then((d) => { setDia(d); setConsultado(true); });
  }, [valor]);

  useEffect(() => {
    void db.schoolDays.where('dayType').anyOf('LECTIVO', 'DIA_CERO').toArray().then((dias) => {
      setRecientes(dias.map((d) => d.calendarDate).filter((d) => d <= max).sort().slice(-5).reverse());
    });
  }, [max]);

  const lectivo = dia?.dayType === 'LECTIVO' || dia?.dayType === 'DIA_CERO';

  return (
    <>
      <label htmlFor="fecha">Fecha</label>
      <div>
        <input id="fecha" type="date" value={valor} max={max}
               onChange={(e) => onChange(e.target.value)} />
        <div className="leyenda">
          {recientes.map((d) => (
            <button key={d} type="button" className="secundario chico"
                    onClick={() => onChange(d)}>
              {new Date(`${d}T00:00`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </button>
          ))}
        </div>
      </div>
      {consultado && !lectivo && !dia && finDeSemana(valor) && (
        <p role="status" className="banner no-lectivo ocupa-todo">
          {valor === new Date().toLocaleDateString('en-CA') ? 'Hoy es' : 'Ese día es'} {nombreDia(valor)}. No hay clase: descanse. Las clases vuelven en el siguiente día de clase.
        </p>
      )}
      {consultado && !lectivo && (dia || !finDeSemana(valor)) && (
        <p role="status" className="banner no-lectivo ocupa-todo">
          {dia
            ? `Ese día es ${ETIQUETA_TIPO[dia.dayType] ?? 'no lectivo'}: no hay clase. No se toma asistencia.`
            : 'No tenemos el calendario de ese día. Conéctese a internet y vuelva a abrir la app.'}
        </p>
      )}
    </>
  );
}
