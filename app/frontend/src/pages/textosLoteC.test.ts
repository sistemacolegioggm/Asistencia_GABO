import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const leer = (ruta: string) => readFileSync(new URL(ruta, import.meta.url), 'utf8');

describe('textos del lote C', () => {
  it('las pantallas ya no dicen "Requiere conexion"', () => {
    for (const f of ['InicioAdmin.tsx', 'Consultas.tsx', 'Dashboard.tsx', '../components/Menu.tsx', 'CursoDia.tsx', 'Calendario.tsx', 'Horario.tsx', 'InicioDocente.tsx', '../components/admin/PanelEstudiantes.tsx']) {
      expect(leer(f), f).not.toContain('Requiere conexion');
    }
  });
  it('el tablero usa rangos con tildes', () => {
    const s = leer('./Dashboard.tsx');
    expect(s).toContain('Últimos 7 días');
    expect(s).toContain('Últimos 30 días');
    expect(s).toContain('Últimos 90 días');
  });
  it('el inicio del admin tiene la leyenda de P, T, F y E', () => {
    expect(leer('./InicioAdmin.tsx')).toContain('P = Presente, T = Tarde, F = Falta, E = Evasión');
  });
});
