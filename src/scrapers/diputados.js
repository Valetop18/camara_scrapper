import { camaraHttp } from "../http/client.js";
import { parseDiputados } from "../parsers/parseDiputados.js";

const URL_DIPUTADOS = 'https://www.camara.cl/diputados/diputados.aspx'

export const obtenerDiputados = async () => {
    const html = await camaraHttp.get(URL_DIPUTADOS)
    const diputados = parseDiputados(html)
    return diputados
}