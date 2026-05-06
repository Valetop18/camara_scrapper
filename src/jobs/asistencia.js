import "dotenv/config"
import { obtenerDiputados } from "../scrapers/diputados.js"
import { obtenerAsistencia } from "../scrapers/asistencia.js"
import { obtenerComisiones } from "../scrapers/comisiones.js";
import { obtenerOficios } from "../scrapers/oficios.js";
import { closeBrowser } from "../http/client.js";
import { obtenerMociones } from "../scrapers/mociones.js";
import { guardarAsistencia, guardarComisiones, guardarMociones, guardarOficios } from "../db/supabase.js";


const prueba = false;

const run = async () => {

    if( prueba ) {
        const  registros = await obtenerAsistencia(1264)
        await guardarAsistencia(registros)
        //console.log(registros)
        // const comisiones = await obtenerComisiones(1108)
        //const oficios = await obtenerOficios(1099)
        //const mociones = await obtenerMociones(1099)
        console.log(registros)
    } else {


    console.log('Inicio scraper asistencia')
    const diputados = await obtenerDiputados()
    const diputadosSlice = diputados.slice(0,4)
    //console.log(diputados)

    let registros = [];
    for (const diputado of diputadosSlice){
        try {
            //registros = await obtenerAsistencia(diputado.id_diputado)
            // const comisiones = await obtenerComisiones(diputado.id_diputado)
            // await guardarComisiones(comisiones)

            // const mociones = await obtenerMociones(diputado.id_diputado)

            // await guardarMociones(mociones)
            console.log('guardando oficios diputado: ', diputado.nombre)

            const oficios = await obtenerOficios(diputado.id_diputado)
            console.log(oficios);
            await guardarOficios(oficios, diputado.id_diputado)


            //guardar en supabase    
        } catch (error) {
            
        }
    }
    }

}



run().catch(error => {
    console.error(`Error: `, error)
    process.exit(1)
})
.finally(() => closeBrowser() );
