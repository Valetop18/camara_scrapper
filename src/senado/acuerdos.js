import { getJson } from "../http/senadoClient.js";

const DEFAULT_LIMIT = 50;
const ACUERDOS_SENADORES_URL = "https://web-back.senado.cl/api/parliamentarians/issues";

const parseAcuerdosResponse = (response) => {
    const registros = response?.data?.data || [];
    return Array.isArray(registros) ? registros : [];
}

const normalizarAcuerdoSenador = (registro, idParlamentario) => ({
    id_senador: Number(idParlamentario),
    id_acuerdo: registro.BOLETIN || null,
    titulo: registro.SUMA || null,
})

export const obtenerAcuerdosSenador = async (idParlamentario, idLegislatura) => {

    const json = await getJson(ACUERDOS_SENADORES_URL, {
        id_parlamentario: idParlamentario,
        id_legislatura: idLegislatura,
        limit: DEFAULT_LIMIT,
        offset: 0
    });

    const registros = parseAcuerdosResponse(json);

    return registros.map( (registro) => normalizarAcuerdoSenador(registro, idParlamentario) );


}