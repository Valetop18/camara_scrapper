import * as cheerio from 'cheerio';


const extraerId = ( href = '') => {
    const match = href.match(/prmID=(\d+)/i)
    return match ? match[1] : null
}

export const parseComisiones = (html, idDiputado) => {
    const $ = cheerio.load(html);
    const comisiones = []

    const $listaActualmente = $('ul.listado').first()

    $listaActualmente.find('a[href*="integrantes.aspx"]').each((_, el) => {

        const href = $(el).attr('href') || '';
        const id = extraerId(href);
        const nombre = $(el).text().trim();

        if(!id) return;

        comisiones.push({
            id_diputado: idDiputado,
            id_comision : id,
            nombre
        })

    })

    if (comisiones.length === 0) {
        console.error('parseComisiones no encontro comisiones, revisar html de la pagina')
    }

    return comisiones
}