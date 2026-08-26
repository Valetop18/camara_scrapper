import "dotenv/config"
import { obtenerSenadores } from "../senado/senadores.js"
import { obtenerAsistenciaSenador } from "../senado/asistencia.js"
import { obtenerComisionesSenador } from "../senado/comisiones.js"
import { guardarAsistenciaSenadores, guardarResumenAsistenciaSenadores, guardarComisionesSenadores, guardarVotacionesSenado, guardarMocionesSenadores, guardarAcuerdosSenadores, guardarOficiosSenadores, actualizarRankingEstadisticoSenadores, } from "../db/supabase.js"
import { obtenerResumenAsistenciaSenadores } from "../senado/asistenciaResumen.js"
import { obtenerVotacionesSenado } from "../senado/votaciones.js"
import { obtenerMocionesSenador } from "../senado/mociones.js"
import { obtenerAcuerdosSenador } from "../senado/acuerdos.js"
import { obtenerOficiosSenador } from "../senado/oficios.js"

const LIMITE_SENADORES = Number.parseInt(process.env.LIMITE_SENADORES)
const ID_LEGISLATURA = Number.parseInt(process.env.ID_LEGISLATURA || 507)
const DELAY_SENADORES = Number.parseInt(process.env.DELAY_SENADORES || 1000)


const limitarSenadores = (senadores) => {
    if (!LIMITE_SENADORES) return senadores
    return senadores.slice(0, LIMITE_SENADORES)
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const guardarDataSenador = async (senador, progreso) => {

    //TO-DO: DELAY PARA PETICIONNES GET


    const oficios = await obtenerOficiosSenador(senador.id_parlamentario, ID_LEGISLATURA);
    await guardarOficiosSenadores(oficios);


    console.log('Obteniendo asistencia')
    const asistencia = await obtenerAsistenciaSenador(senador.id_parlamentario, ID_LEGISLATURA);
    console.log(`[${progreso}] Asistencia encontrada`)
    await guardarAsistenciaSenadores(asistencia);
    //console.log(`[${progreso}] Asistencia guardada: ${asistencia.sesiones.length} registros`)

    console.log('Obteniendo Comisiones')
    const comisiones = await obtenerComisionesSenador(senador.id_parlamentario);
    console.log(`comisiones encontradas: ${comisiones.length}`)
    await guardarComisionesSenadores(comisiones)
    console.log('Comisiones guardadas')

    const acuerdos = await obtenerAcuerdosSenador(senador.id_parlamentario, ID_LEGISLATURA)
    console.log(acuerdos);
    await guardarAcuerdosSenadores(acuerdos);

    const mociones = await obtenerMocionesSenador(senador.id_parlamentario, ID_LEGISLATURA)
    console.log(mociones);
    await guardarMocionesSenadores(mociones);




}

const guardarAsistenciaResumenSenadores = async () => {

    console.log('Obteniendo asistencia resumen')
    const resumenAsistencia = await obtenerResumenAsistenciaSenadores(ID_LEGISLATURA);
    console.log(`Resumen de asistencia encontrado: ${(await resumenAsistencia).length}`)
    await guardarResumenAsistenciaSenadores(resumenAsistencia)
    console.log('Asistencia resumen guardada')
}

const guardarVotacionesSenadores = async () => {

    console.log('Obteniendo votaciones')
    const votaciones = await obtenerVotacionesSenado(ID_LEGISLATURA);
    await guardarVotacionesSenado(votaciones);
    console.log('Votaciones guardada');

    votaciones.forEach( v => console.log('fecha actualizada: ',  v.votacion.fecha) );

    //console.log(votaciones);
}




const run = async () => {

    const errores = []
    console.log('Inicio scraper senadores')

    const senadores = limitarSenadores(await obtenerSenadores())

    if (senadores.length === 0) {
        console.log('No hay senadores para procesar')
        return
    }

    await guardarVotacionesSenadores();

    return;
    await guardarAsistenciaResumenSenadores();


    let registros = [];
    for (const [index, senador] of senadores.entries()) {

        const progreso = `${index + 1}/${senadores.length}`;

        try {
            await guardarDataSenador(senador, progreso);
        } catch (error) {
            errores.push({
                id_parlamentario: senador.id_parlamentario,
                nombre: senador.nombre,
                mensajeError: error.message
            })
            console.error(`[${progreso}] Error ${senador.nombre}: ${error.message}`)
        }

        if (index < senadores.length - 1) {
            await delay(DELAY_SENADORES)
        }
    }

    console.log(`senadores procesados exitosamente ${senadores.length - errores.length} / ${senadores.length}`)

    if (errores.length > 0) {
        console.log(`senadores con error: ${errores.length}`);

        errores.forEach((error, index) => {
            console.log(
                `${index + 1}. ID: ${error.id_parlamentario} | ${error.nombre}`
            );
            console.log(`   ${error.mensajeError}`);
        });

        console.log("\nIDs de senadores con error:");
        console.log(
            errores.map(error => error.id_parlamentario).join(", ")
        );

    }

    console.log("Actualizando ranking estadístico de senadores...");

    try {
        await actualizarRankingEstadisticoSenadores();
        console.log("Ranking estadístico de senadores actualizado correctamente.");
    } catch (error) {
        console.error(
            "Error al actualizar ranking estadístico de senadores:",
            error.message,
        );
    }
}

run().catch(error => {
    console.error(`Error: `, error)
    process.exitCode = 1
})
    .finally();