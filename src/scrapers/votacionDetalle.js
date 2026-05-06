import { camaraHttp } from "../http/client.js";
import { parseDetalle } from "../parsers/parseDetalle.js";

const URL_DETALLE = `${process.env.CAMARA_BASE_URL}/legislacion/sala_sesiones/votacion_detalle.aspx`

export const obtenerDetalle = async (idVotacion) => {
    const URL = `${URL_DETALLE}?prmIdVotacion=${idVotacion}`;
    const html = await camaraHttp.get(URL);
    const detalleVotacion = parseDetalle(html, idVotacion);
    return detalleVotacion
}