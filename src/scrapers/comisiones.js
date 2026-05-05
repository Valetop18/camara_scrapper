import { camaraHttp } from "../http/client.js";
import { parseComisiones } from "../parsers/parseComisiones.js";

const BASE_URL = 'https://www.camara.cl/diputados/detalle/comisiones.aspx'

export const obtenerComisiones = async (idDiputado) => {
    const html = await camaraHttp.get(`${BASE_URL}?prmId=${idDiputado}`)
    return parseComisiones(html, idDiputado);
}