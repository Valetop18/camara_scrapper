import { getJson } from "../http/senadoClient.js";

const DEFAULT_LIMIT = 100;
const OFICIOS_SENADORES_URL = "https://web-back.senado.cl/api/parliamentarians/record";

const parseOficiosResponse = (response) => {
    const registros = response?.data?.data || [];
    return Array.isArray(registros) ? registros : [];
}

const limpiarTexto = (valor) => valor?.trim() || null;

const normalizarOficioSenador = (registro, idParlamentario) => ({
    id_senador: Number(idParlamentario),
    numero_oficio: registro.NRO_OFICIO || null,
    materia: registro.MATERIA || NULL,
    fecha: registro.FECHA || null,
    destinos: limpiarTexto(registro.DESTINOS)
})

export const obtenerOficiosSenador = async (idParlamentario, idLegislatura) => {

    const json = await getJson(OFICIOS_SENADORES_URL, {
        id_parlamentario: idParlamentario,
        id_legislatura: idLegislatura,
        limit: DEFAULT_LIMIT,
        offset: 0
    });

    const registros = parseOficiosResponse(json);

    return registros.map( (registro) => normalizarOficioSenador(registro, idParlamentario) );

}