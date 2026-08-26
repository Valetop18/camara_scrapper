import { getJson } from "../http/senadoClient.js";
import { calcularResultadoVotacion } from "./calcularResultadoVotacion.js";

const DEFAULT_LIMIT = 50;
const VOTACIONES_SENADO_URL = "https://web-back.senado.cl/api/votes";



const TIPOS_VOTO = {
    SI: "A Favor",
    NO: "En Contra",
    ABSTENCION: "Abstencion",
    PAREO: "Pareos"
}

const parseVotacionesResponse = (response) => {
    const registros = response?.data?.data || [];
    return Array.isArray(registros) ? registros : [];
}

const extraerFecha = (valor = "") => {
    const [fecha] = valor.split(" ");
    return fecha ? fecha.replaceAll("/", "-") : null;
}

const normalizarBoletin = (valor) => {
    const boletin = String( valor ?? "").replace(/[^\d-]/g, "");
    return boletin || null;
}

const extraerVotos = (registro) => {
    const votos = [];
    const grupos = registro.VOTACIONES || {};

    Object.entries(TIPOS_VOTO).forEach( ([clave, voto]) => {
        const senadores = grupos[clave];

        if (!Array.isArray(senadores)) return;

        senadores.forEach( (senador) => {
            if (!senador.PARLID) return;

            votos.push({
                id_votacion: Number(registro.ID_VOTACION),
                id_senador: Number(senador.PARLID),
                voto,
            });

        });

    });

    return votos;

    
}

const normalizarVotaciones = (registro) => ({

    votacion: {
        id_votacion: Number(registro.ID_VOTACION),
        numero_sesion: Number(registro.NUMERO_SESION),
        fecha: extraerFecha(registro.HORA),
        tema: registro.TEMA || null,
        boletin: normalizarBoletin(registro.BOLETIN),
        quorum: registro.QUORUM || null,
        resultado: calcularResultadoVotacion(registro)
    },
    votos: extraerVotos(registro)



})
export const obtenerVotacionesSenado = async (idLegislatura) => {
    

    const json = await getJson(VOTACIONES_SENADO_URL, {
        id_legislatura: idLegislatura,
        limit: DEFAULT_LIMIT,
        offset: 0,
        palabra_clave: "",
        desde: "",
        hasta: ""
    });
    const registros = parseVotacionesResponse(json);
    return registros.map( normalizarVotaciones );

};