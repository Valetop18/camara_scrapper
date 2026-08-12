
import { getJson } from "../http/senadoClient.js";

const DEFAULT_LIMIT = 100;
const ASISTENCIA_RESUMEN_SENADORES_URL = "https://web-back.senado.cl/api/sessions/attendance?id_legislatura=507&limit=100";

/* 
{
    "data": {
        "TOTAL_SENADORES": 50,
        "TOTAL_SESIONES": 25,
        "DATA": [
            {
                "NOMBRE": "Pedro",
                "APELLIDO_PATERNO": "Araya",
                "APELLIDO_MATERNO": "Guerrero",
                "SLUG": "pedro-araya-guerrero-sen",
                "ID_PARLAMENTARIO": 1110,
                "JUSTIFICADO": 0,
                "ASISTIO_A": 23,
                "TOTAL_SESIONES_TOTAL": 25,
                "SIN_JUSTIFICAR": 2
            },

*/
const parseAsistenciaResumenResponse = (response) => {
    const registros = response?.data?.DATA || [];
    return Array.isArray(registros) ? registros : [];
}

const normalizarAsistenciaResumenSenador = (registro) => ({
    id_senador: Number(registro.ID_PARLAMENTARIO),
    ausencias_justificadas: Number(registro.JUSTIFICADO || 0)
})

export const obtenerResumenAsistenciaSenadores = async (idLegislatura) => {
    
    const json = await getJson(ASISTENCIA_RESUMEN_SENADORES_URL, {
        id_legislatura: idLegislatura,
        limit: DEFAULT_LIMIT
    });

    const registros = parseAsistenciaResumenResponse(json);

    return registros.map( (registro) => normalizarAsistenciaResumenSenador(registro) );


}