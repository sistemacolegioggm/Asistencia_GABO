import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Escudo from '../components/Escudo';
import BotonInstalar from '../components/BotonInstalar';
import AvisoServidorLento from '../components/AvisoServidorLento';
import { estado, pedirPermisoAlEntrar, sincronizarSiConcedido } from '../push/avisos';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [avisos] = useState(() => estado());
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    // Antes de cualquier await: el navegador solo muestra el permiso desde un clic directo.
    const permiso = pedirPermisoAlEntrar();
    try {
      await api.login(email, password);
      if (permiso) await permiso;
      void sincronizarSiConcedido();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AvisoServidorLento />
      <form className="card login" onSubmit={submit}>
        <header className="marca">
          <Escudo size={128} />
          <div>
            <span className="eyebrow">Planilla de asistencia</span>
            <h1>Asistencia GGM</h1>
            <p className="meta">Colegio Gabriel García Márquez</p>
          </div>
        </header>
        <label htmlFor="email">Correo institucional</label>
        <input id="email" type="email" autoComplete="username" required
               value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" required
               value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p role="alert" className="error">{error}</p>}
        {avisos === 'pendiente' && (
          <p className="meta">
            Para avisarle cuando falte tomar lista, el navegador le pedirá permiso. Toque Permitir.
          </p>
        )}
        <button type="submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
        <BotonInstalar />
        <p><Link to="/">« Volver al inicio</Link></p>
      </form>
    </>
  );
}
