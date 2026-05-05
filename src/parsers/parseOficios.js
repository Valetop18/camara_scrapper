import * as cheerio from 'cheerio';

const SELECTORES = {
    filas : '#ContentPlaceHolder1_ContentPlaceHolder1_DetallePlaceHolder_pnlData .tabla tbody tr',
    numeroOficio: 'td:nth-child(1) strong'

}

export const parseOficios = (html, idDiputado) => {
    const $ = cheerio.load(html);
    const numeros = []

    $(SELECTORES.filas).each((_, el) => {

        const numero = $(el).find(SELECTORES.numeroOficio).text().trim();
        if(numero) numeros.push(numero);

    })

    if (numeros.length === 0) {
        console.error('parseOficios no encontro oficios, revisar html de la pagina')
    }

    return numeros
}