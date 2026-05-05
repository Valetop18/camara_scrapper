import "dotenv/config"
import { obtenerVotacionesPorFecha } from "../scrapers/votaciones.js";
import { obtenerDetalle } from "../scrapers/votacionDetalle.js";
import { guardarVotacion } from "../db/supabase.js";
import { closeBrowser, getPage } from "../http/client.js";


const run = async () => {
    console.log('Inicio scraper ultimas votaciones')
    const page = await getPage();

    //const votaciones = (await obtenerUltimasVotaciones()).slice(0,2);
    const votaciones = await obtenerVotacionesPorFecha(page);
    console.log('----votaciones encontrada:', votaciones.length)

    for (const votacion of votaciones) {
        const detalle = await obtenerDetalle(votacion.id_votacion)
        guardarVotacion(votacion, detalle.votacion, detalle.votos);

    }

}



run().catch(error => {
    console.error(`Error: `, error)
    process.exit(1)
})
.finally(() => closeBrowser() );
