import { getJson } from "../http/senadoClient.js";

const LISTADO_SENADORES_URL = "https://www.senado.cl/_next/data/4EMldF3oxKIqItY1dHAUe/senadoras-y-senadores/listado-de-senadoras-y-senadores.json?slug=senadoras-y-senadores&slug=listado-de-senadoras-y-senadores";

const extraerParlamentarios = (response) => {

    const components = response?.pageProps?.resource?.components || [];

    for (const component of components) {
        const parlamentarios = component?.computedComponents?.data?.parlamentarios?.data;
        if ( Array.isArray(parlamentarios) ) return parlamentarios;
    }

    return [];
}


export const obtenerSenadores = async () => {
    const json = await getJson(LISTADO_SENADORES_URL);
    const parlamentarios = extraerParlamentarios(json);


    return parlamentarios
        .map( (parlamentario) => ({
            id_parlamentario: Number( parlamentario.ID_PARLAMENTARIO),
            nombre: parlamentario.NOMBRE_COMPLETO_CORTO
        }) )

}