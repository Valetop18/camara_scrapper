import * as cheerio from "cheerio";

const URL_BASE = process.env.CAMARA_BASE_URL

const SELECTORES = {
    contenedor: '.contenedor_votacion',
    encabezado: '.datos_votacion',
    linkMateria: '.materia_votacion a',
}

const extraerId = ( href = '') => {
    const match = href.match(/prmIdVotacion=(\d+)/i)
    return match ? match[1] : null
}

export const parseListado = (html) => {

    const $ = cheerio.load(html);
    const votaciones = [];

    $(SELECTORES.contenedor).each( (i, el) => {

        const $el = $(el);
        const href = $el.find(SELECTORES.linkMateria).attr('href') || '';
        const id = extraerId(href);

        if(!id) return;

        //06 de abril de 2026  |  Boletín N° 16569-25
        const encabezado = $el.find(SELECTORES.encabezado).text().trim();
        const [fecha, tipo] = encabezado.split('|').map(s => s.trim() );

        votaciones.push({
            id_votacion: id,
            fecha: fecha || null,
            tipo_documento: tipo || null,
            url_detalle: `${URL_BASE}/legislacion/sala_sesiones/${href}`
        })

    })


    if(votaciones.length === 0){
        console.log('parseListado no encontro votaciones.')
    }

    return votaciones;
}