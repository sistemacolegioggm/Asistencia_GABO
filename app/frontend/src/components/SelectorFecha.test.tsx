import 'fake-indexeddb/auto';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/local';
import SelectorFecha from './SelectorFecha';

describe('SelectorFecha', () => {
  beforeEach(async () => {
    await db.schoolDays.clear();
    await db.schoolDays.bulkPut([
      { calendarDate: '2026-08-13', dayType: 'LECTIVO' },
      { calendarDate: '2026-08-14', dayType: 'LECTIVO' },
      { calendarDate: '2026-08-17', dayType: 'FESTIVO', description: 'Asuncion' },
      { calendarDate: '2026-08-18', dayType: 'LECTIVO' },
      { calendarDate: '2026-08-19', dayType: 'SUSPENDIDO', description: 'Paro' },
    ]);
  });

  it('en un dia lectivo no muestra ninguna advertencia', async () => {
    render(<SelectorFecha valor="2026-08-18" onChange={() => {}} max="2026-08-20" />);
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('en un festivo avisa y dice el motivo', async () => {
    render(<SelectorFecha valor="2026-08-17" onChange={() => {}} max="2026-08-20" />);
    // waitFor y no findByRole: el componente consulta IndexedDB en un efecto, asi que
    // el primer render aun no sabe que dia es. findByRole devuelve ese primer estado
    // y el test se vuelve inestable segun lo rapido que resuelva la base.
    await waitFor(() => {
      const aviso = screen.getByRole('status');
      expect(aviso).toHaveTextContent('Ese día es festivo: no hay clase. No se toma asistencia.');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('en un dia suspendido tambien avisa', async () => {
    render(<SelectorFecha valor="2026-08-19" onChange={() => {}} max="2026-08-20" />);
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/día suspendido/i));
  });

  it('una fecha que no esta en el calendario descargado pide actualizar', async () => {
    render(<SelectorFecha valor="2027-03-01" onChange={() => {}} max="2027-12-31" />);
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'No tenemos el calendario de ese día. Conéctese a internet y vuelva a abrir la app.'));
  });

  it('los atajos solo ofrecen dias lectivos, nunca festivos ni suspendidos', async () => {
    render(<SelectorFecha valor="2026-08-18" onChange={() => {}} max="2026-08-20" />);
    await waitFor(() => expect(screen.getAllByRole('button').length).toBeGreaterThan(0));
    const textos = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    // 17 (festivo) y 19 (suspendido) no pueden aparecer entre los atajos
    expect(textos.some((t) => t.includes('17'))).toBe(false);
    expect(textos.some((t) => t.includes('19'))).toBe(false);
    expect(textos.some((t) => t.includes('18'))).toBe(true);
  });
});
