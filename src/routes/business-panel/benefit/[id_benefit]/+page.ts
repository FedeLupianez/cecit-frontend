// El id del beneficio sólo existe en el backend y requiere sesión, así que la
// ruta no se puede prerenderizar: se renderiza on-demand en el server.
export const prerender = false;
