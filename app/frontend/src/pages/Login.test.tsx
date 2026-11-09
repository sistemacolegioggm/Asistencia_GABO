import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const estadoMock = vi.fn();
vi.mock('../push/avisos', () => ({
  estado: () => estadoMock(),
  pedirPermisoAlEntrar: () => null,
  sincronizarSiConcedido: async () => {},
}));
import Login from './Login';

describe('Login', () => {
  it('con avisos pendientes explica el permiso', () => {
    estadoMock.mockReturnValue('pendiente');
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText(/el navegador le pedirá permiso\. Toque Permitir/)).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });
  it('en otro estado no lo muestra', () => {
    estadoMock.mockReturnValue('concedido');
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.queryByText(/Toque Permitir/)).toBeNull();
  });
});
