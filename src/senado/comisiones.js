import { getJson } from "../http/senadoClient.js";

const DEFAULT_LIMIT = 100;
const COMISIONES_SENADORES_URL = "https://web-back.senado.cl/api/parliamentarians/commissions";

const parseComisionesResponse = (response) => {
    const registros = response?.data?.data || [];
    return Array.isArray(registros) ? registros : [];
}

const normalizarComisionSenador = (registro, idParlamentario) => ({
    id_senador: Number(idParlamentario),
    id_comision: Number(registro.ID_COMISION),
    nombre: registro.NOMBRE || null,
    cargo: registro.CARGO || null,
})

export const obtenerComisionesSenador = async (idParlamentario) => {
    
    const json = await getJson(COMISIONES_SENADORES_URL, {
        id_parlamentario: idParlamentario,
        vigentes: 1,
        limit: DEFAULT_LIMIT
    });

    const registros = parseComisionesResponse(json);

    return registros.map( (registro) => normalizarComisionSenador(registro, idParlamentario) );


}