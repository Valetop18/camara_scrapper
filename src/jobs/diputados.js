import "dotenv/config"
import { obtenerDiputados } from "../scrapers/diputados.js"
import { obtenerAsistencia } from "../scrapers/asistencia.js"
import { obtenerComisiones } from "../scrapers/comisiones.js";
import { obtenerOficios } from "../scrapers/oficios.js";
import { closeBrowser } from "../http/client.js";
import { obtenerMociones } from "../scrapers/mociones.js";
import { guardarAsistencia, guardarComisiones, guardarMociones, guardarOficios } from "../db/supabase.js";

const LIMITE_DIPUTADOS = Number.parseInt(process.env.LIMITE_DIPUTADOS)

const limitarDiputados = (diputados) => {
    if (!LIMITE_DIPUTADOS) return diputados
    return diputados.slice(0, LIMITE_DIPUTADOS)
}

const guardarDataDiputado = async (diputado, actual, total) => {
    const progreso = `${actual}/${total}`
    console.log(`[${progreso}] Procesando diputado ${diputado.nombre}`)
    
    console.log('Scrapeando asistencia')
    const asistencia = await obtenerAsistencia(diputado.id_diputado)
    await guardarAsistencia(asistencia)
    console.log(`[${progreso}] Asistencia guardada: ${asistencia.length} registros`)

    console.log('Scrapeando comisiones')
    const comisiones = await obtenerComisiones(diputado.id_diputado)
    await guardarComisiones(comisiones)
    console.log(`[${progreso}] comisiones guardada: ${comisiones.length} registros`)

    console.log('Scrapeando mociones')
    const mociones = await obtenerMociones(diputado.id_diputado)
    await guardarMociones(mociones)
    console.log(`[${progreso}] mociones guardada: ${mociones.length} registros`)

    console.log('Scrapeando oficios')
    const oficios = await obtenerOficios(diputado.id_diputado)
    await guardarOficios(oficios, diputado.id_diputado)
    console.log(`[${progreso}] oficios guardada: ${oficios.length} registros`)

}

const run = async () => {

    const errores = []
    console.log('Inicio scraper diputados')
    const diputados = limitarDiputados( await obtenerDiputados() )

    if (diputados.length === 0) {
        console.log('No hay diputados para procesar')
        return
    }
    

    let registros = [];
    for (const [index, diputado] of diputados.entries() ) {

        try {
            await guardarDataDiputado(diputado, index+1, diputados.length)
        } catch (error) {
            errores.push({
                id_diputado: diputado.id_diputado,
                nombre: diputado.nombre,
                mensajeError: error.message
            })
            console.error(`Error ${diputado.nombre}: ${error.message}`)
        }
    }

    console.log(`Diputados procesados exitosamente ${diputados.length - errores.length} / ${diputados.length}`)

    if (errores.length > 0) {
        console.log(`Diputados con error: ${errores.length}`)
    }
}



run().catch(error => {
    console.error(`Error: `, error)
    process.exitCode = 1
})
.finally( async () => await closeBrowser() );