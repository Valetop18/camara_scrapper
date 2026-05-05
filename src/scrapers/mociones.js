import { camaraHttp } from "../http/client.js";
import { parseMociones } from "../parsers/parseMociones.js";

const BASE_URL = 'https://www.camara.cl/diputados/detalle/mociones.aspx'

export const obtenerMociones = async (idDiputado) => {
    const html = await camaraHttp.get(`${BASE_URL}?prmId=${idDiputado}`)
    return parseMociones(html, idDiputado);
}