import { camaraHttp } from "../http/client.js";
import { parseAsistencia } from "../parsers/parseAsistencia.js";

const BASE_URL = 'https://www.camara.cl/diputados/detalle/asistencia_sala.aspx'

export const obtenerAsistencia = async (idDiputado) => {
    const html = await camaraHttp.get(`${BASE_URL}?prmId=${idDiputado}`)
    return parseAsistencia(html, idDiputado);
}