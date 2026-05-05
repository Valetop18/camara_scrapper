import * as cheerio from 'cheerio';

const SELECTORES = {
    filas: '#ContentPlaceHolder1_ContentPlaceHolder1_DetallePlaceHolder_UpdatePanel1 .tabla tbody tr',
    numeroBoletin: 'td:nth-child(1)',
    titulo: 'td:nth-child(3)',
}


export const parseMociones = (html, idDiputado) => {
    const $ = cheerio.load(html);
    const mociones = []

    $(SELECTORES.filas).each((_, el) => {
        const $el = $(el);
        const numeroBoletin = $el.find(SELECTORES.numeroBoletin).text().trim()
        const titulo = $el.find(SELECTORES.titulo).text().trim()

        if(!numeroBoletin) return;
        
        mociones.push({
            id_diputado: idDiputado,
            numero_boletin: numeroBoletin,
            titulo
        })

    })

    if (mociones.length === 0) {
        console.error('parseMociones no encontro Mociones, revisar html de la pagina')
    }

    return mociones
}