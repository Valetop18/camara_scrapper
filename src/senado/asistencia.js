import { getJson } from "../http/senadoClient.js";

const DEFAULT_LIMIT = Number(process.env.SENADO_ASISTENCIA_LIMIT || 40);
const ASISTENCIA_SENADORES_URL = "https://web-back.senado.cl/api/parliamentarians_attendance_room";

//https://web-back.senado.cl/api/parliamentarians_attendance_room?id_parlamentario=1500&id_legislatura=507&limit=30&offset=0

const parseAsistenciaResponse = (response) => {
    const body = response?.data || {};
    return Array.isArray(body.data) ? body.data : [];
}

const extraerNumeroSesion = (valor = "") => {
    const match = valor.match(/Sesion\s+(\d+)/i);
    return match ? Number(match[1]) : null;
}

export const normalizarAsistenciaSenador = (registro, idParlamentario) => ({
    id_parlamentario: Number(idParlamentario),
    fecha: registro.FECHA || null,
    sesion: extraerNumeroSesion(registro.SESION),
    tipo: registro.TIPO || null,
    asistencia: registro.ASISTENCIA || null,
    justificacion: registro.JUSTIFICACION || null,
})

export const obtenerAsistenciaSenador = async (idParlamentario, idLegislatura) => {

    const json = await getJson(ASISTENCIA_SENADORES_URL, {
        id_parlamentario: idParlamentario,
        id_legislatura: idLegislatura,
        limit: DEFAULT_LIMIT,
        offset: 0,
    });

    const registros = parseAsistenciaResponse(json);

    return registros.map( (registro) => normalizarAsistenciaSenador(registro, idParlamentario) );


}