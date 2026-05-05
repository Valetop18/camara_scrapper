import * as cheerio from 'cheerio';

const SELECTORES = {
    articulo: '#ContentPlaceHolder1_ContentPlaceHolder1_pnlDiputadosLista article',
    link: 'h4 a',
    //se pueden extraer mas campos
}

const extraerId = ( href = '') => {
    const match = href.match(/prmID=(\d+)/i)
    return match ? match[1] : null
}

export const parseDiputados = (html) => {
    const $ = cheerio.load(html);
    
    const diputados = []

    $(SELECTORES.articulo).each((_, el) => {
        const $el = $(el);
        const href = $el.find(SELECTORES.link).attr('href') || '';
        const id = extraerId(href);

        if(!id) return;

        diputados.push({
            id_diputado: id,
            nombre: $el.find(SELECTORES.link).text().trim()
        })

    })

    if (diputados.length === 0) {
        console.error('parseDiputados no encontro diputados, revisar html de la pagina')
    }

    return diputados
}