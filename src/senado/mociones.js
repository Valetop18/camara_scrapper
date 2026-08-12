import { getJson } from "../http/senadoClient.js";

const DEFAULT_LIMIT = 50;
const MOCIONES_SENADORES_URL = "https://web-back.senado.cl/api/parliamentarians/motions";

const parseMocionesResponse = (response) => {
    const registros = response?.data?.data || [];
    return Array.isArray(registros) ? registros : [];
}

const normalizarMocionSenador = (registro, idParlamentario) => ({
    id_senador: Number(idParlamentario),
    id_mocion: registro.BOLETIN || null,
    titulo: registro.SUMA || null,
})

export const obtenerMocionesSenador = async (idParlamentario, idLegislatura) => {
    
    const json = await getJson(MOCIONES_SENADORES_URL, {
        id_parlamentario: idParlamentario,
        id_legislatura: idLegislatura,
        limit: DEFAULT_LIMIT,
        offset: 0
    });

    const registros = parseMocionesResponse(json);

    return registros.map( (registro) => normalizarMocionSenador(registro, idParlamentario) );


}