import { camaraHttp } from "../http/client.js";
import { parseListado } from "../parsers/parseListado.js";
const DELAY_MS = process.env.DELAY || '10000';
const DIAS_ATRAS = parseInt(process.env.DIAS_ATRAS || '2');
const RESULTADOS_POR_PAGINA = parseInt(process.env.RESULTADOS_POR_PAGINA || '10');


const delay = (ms) => new Promise(resolve=> setTimeout(resolve, ms));

const URL_LISTADO = `${process.env.CAMARA_BASE_URL}/legislacion/sala_sesiones/votaciones.aspx`

const SELECTORES = {
    linkFecha: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_link_porFecha',
    inputDesde: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_desde',
    inputHasta: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_hasta',
    btnBuscar: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_btnBuscar',
    cantidad: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_cantidad_resultados',
    paginacion: '.paginacion a'
}

const formatearFecha = (date) => {
    const dd = String(date.getDate()).padStart(2,'0')
    const mm = String(date.getMonth() + 1).padStart(2,'0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

const extraerTotalResultados = async (page) => {
    try {
        const texto = await page.locator(SELECTORES.cantidad).textContent()
        const match = texto.match(/(\d+)/)
        return match ? parseInt( match[1] ) : 0
    } catch (error) {
        return 0
    }
}

const esperarCarga = async (page) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 } ).catch( () => null )
    await page.waitForLoadState('networkidle', { timeout: 15000 } ).catch( () => null )
}

const clickYEsperar = async (locator) => {
    const page = locator.page()
    const navegacion = page.waitForNavigation( { waitUntil: 'domcontentloaded', timeout: 15000 } ).catch( () => null )
    await locator.click()
    await navegacion
    await esperarCarga(page)

}

export const obtenerVotacionesPorFecha = async (page) => {
    

    await page.goto(URL_LISTADO, { waitUntil: 'domcontentloaded' })
    await delay(DELAY_MS)

    await page.locator(SELECTORES.linkFecha).click()
    await page.waitForLoadState('domcontentloaded')
    await delay(DELAY_MS)

    const hoy = new Date()
    const desde = new Date()

    desde.setDate( hoy.getDate() - DIAS_ATRAS)

    const fechaDesde = formatearFecha(desde)
    const fechaHasta = formatearFecha(hoy)


    await page.locator(SELECTORES.inputDesde).fill(fechaDesde)
    await page.locator(SELECTORES.inputHasta).fill(fechaHasta)
    await delay(DELAY_MS)

    await clickYEsperar( page.locator(SELECTORES.btnBuscar) )
    
    await page.waitForLoadState('domcontentloaded')
    await delay(DELAY_MS)

    const total = await extraerTotalResultados(page)

    if (total === 0) return [] 

    const totalPaginas = Math.ceil( total / RESULTADOS_POR_PAGINA )

    const todasLasVotaciones = []

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {

        const html = await page.content()
        const votaciones = parseListado(html)
        todasLasVotaciones.push(...votaciones)

        if (pagina < totalPaginas) {
            await delay(DELAY_MS)

            const links = await page.locator(SELECTORES.paginacion).allTextContents();

            await clickYEsperar(  
                page.locator(SELECTORES.paginacion)
                    .filter( {hasText: String(pagina + 1)})
                )
            
        }

    }

    return todasLasVotaciones

}


export const obtenerUltimasVotaciones = async () => {
    console.log('Descargando home de votaciones')
    const html = await camaraHttp.get(URL_LISTADO);
    const votaciones = parseListado(html);
    console.log(`${votaciones.length} votaciones encontradas`)
    return votaciones
}