import { createSupabaseClient } from "./supabaseClient.js";

const ID_VOTACION = null;  //null para traer ultimas votaciones
const LIMIT = 10;
const EDGE_FUNCTION_NAME = "resumir-texto-ia";
const DELAY_MS = 1000;

const delay = (ms) => new Promise(resolve=> setTimeout(resolve, ms));

const COLUMNAS_VOTACION = `
    id_votacion,
    tipo_documento,
    fecha_texto,
    materia,
    sesion,
    tramite,
    articulo,
    quorum,
    resultado,
    materia_resumen,
    articulo_resumen
`;

const obtenerUltimasVotaciones = async (supabase) => {
    const { data, error } = await supabase
        .from("votaciones")
        .select(COLUMNAS_VOTACION)
        .order("id_votacion", { ascending: false } )
        .limit(LIMIT);

    if (error) throw new Error("Error obteniendo votaciones: " + error.message);
    return data || [];
    
};

const obtenerVotacionPorId = async (supabase) => {
    const { data, error } = await supabase
        .from("votaciones")
        .select(COLUMNAS_VOTACION)
        .eq("id_votacion", ID_VOTACION)
        .single();

    if (error) throw new Error("Error obteniendo votacion: " + ID_VOTACION + error.message);
    return [data];
}

const obtenerVotaciones = async (supabase) => {
    if (ID_VOTACION !== null) {
        console.log(`Buscando votacion: ${ID_VOTACION}`)
        return obtenerVotacionPorId(supabase);
    }
    console.log(`Buscando ultimas ${LIMIT} votaciones`)
    return obtenerUltimasVotaciones(supabase);
}

const crearPayloadWebhook = (votacion) => ({
    type: "INSERT",
    tabla: "votaciones",
    schema: "public",
    record: votacion,
    old_record: null
});

const tieneValor = (valor) => typeof valor === "string" && valor.length > 0;

const tieneResumen = (votacion) => (
    tieneValor(votacion.materia_resumen) || tieneValor(votacion.articulo_resumen)
);

const invocarEdgeFunction = async (supabase, votacion, progreso) => {
    
    const payload = crearPayloadWebhook(votacion);

    console.log(`[${progreso}] Invocando ${EDGE_FUNCTION_NAME} para votacion ${votacion.id_votacion}`);
    console.log(`[${progreso}] Materia: ${votacion.materia?.length || 0} caracteres`);
    console.log(`[${progreso}] Articulo: ${votacion.articulo?.length || 0} caracteres`);

    const { data, error} = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
        body: payload
    });

    if (error) {
        throw new Error(error.message);
    }

    console.log(`[${progreso}] Edge Function OK`);

    if ( data !== null && data !== undefined) {
        console.log(`[${progreso}] Respuesta: ${JSON.stringify(data)}`);
    }

}




const run = async () => {

    const supabase = createSupabaseClient();
    const votaciones = await obtenerVotaciones(supabase);
    console.log(`Votaciones encontradas: ${votaciones.length}`)

    if (votaciones.length === 0) {
        console.log('No hay votaciones para procesar')
        return;
    }
    
    const errores = []
    let registros = [];

    for (const [index, votacion] of votaciones.entries() ) {

        const progreso = `${index+1}/${votaciones.length}`;

        if (tieneResumen(votacion)) {
            console.log(`[${progreso}] Saltando votacion ${votacion.id_votacion}: ya tiene resumen`);
            continue;
        }

        try {
            await invocarEdgeFunction(supabase, votacion, progreso);
        } catch (error) {
            errores.push({
                id_votacion: votacion.id_votacion,
                mensajeError: error.message
            })
            console.error(`[${progreso}] Error ${votacion.id_votacion}: ${error.message}`)
        }

        if( index < votaciones.length - 1 ) {
            await delay(DELAY_MS)
        }
    }

    console.log(`Votaciones procesadas exitosamente ${votaciones.length - errores.length} / ${votaciones.length}`)

    if (errores.length > 0) {
        console.log(`votaciones con error: ${errores.length}`);

        errores.forEach((error, index) => {
            console.log(
                `${index + 1}. ID: ${error.id_votacion}`
            );
            console.log(`${error.mensajeError}`);
        });

        console.log("\nIDs de votaciones con error:");
        console.log(
            errores.map(error => error.id_votacion).join(", ")
        );
    }
}

run().catch(error => {
    console.error(`Error: `, error)
    process.exitCode = 1
})

