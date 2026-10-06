// Cliente HTTP común: agrega el token de sesión y unifica el manejo de errores.
// Todas las funciones de src/api/* pasan por peticion().
const BASE_URL = "http://localhost:3000/api";
const CLAVE_TOKEN = "pil_token";

// Se emite cuando el backend rechaza el token (sesión vencida o cerrada en otro lado)
export const EVENTO_SESION_EXPIRADA = "pil:sesion-expirada";

export function obtenerToken() {
  try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
}

export function guardarToken(token) {
  try { localStorage.setItem(CLAVE_TOKEN, token); } catch { /* sin almacenamiento: la sesión dura lo que la pestaña */ }
}

export function borrarToken() {
  try { localStorage.removeItem(CLAVE_TOKEN); } catch { /* nada que borrar */ }
}

export async function peticion(ruta, { metodo = "GET", cuerpo } = {}) {
  const headers = {};
  const token = obtenerToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${ruta}`, {
    method: metodo,
    headers,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
  });
  const datos = await res.json().catch(() => ({}));

  if (res.status === 401 && token) {
    borrarToken();
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
  }
  if (!res.ok) {
    throw new Error(datos.error || "Error en la solicitud");
  }
  return datos;
}

// Arma "?a=1&b=2" omitiendo los valores vacíos
export function consulta(parametros = {}) {
  const params = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") params.set(clave, valor);
  });
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}
