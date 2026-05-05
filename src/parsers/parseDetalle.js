import * as cheerio from 'cheerio';


const CAMPOS_FIJOS = {
    'fecha': 'fecha',
    'materia': 'materia',
    'sesión': 'sesion',
    'trámite': 'tramite',
    'artículo': 'articulo'
}

const TABLAS_VOTOS = {
    'A Favor': '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_dtlAFavor',
    'En contra': '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_dtlEnContra',
    'Abstencion': '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_dtlAbstencion',
    'Pareos': '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_dtlPareos'
}

const extraerId = ( href = '') => {
    const match = href.match(/prmID=(\d+)/i)
    return match ? match[1] : null
}

export const parseDetalle = (html, idVotacion) => {
    const $ = cheerio.load(html);

    const camposFijos = {};
    const dataDinamica = {};


    $('#info-ficha .datos-ficha').each( (_, el) => {

        const clave = $(el).find('.dato').text().trim().toLowerCase().replace(':','')
        const valor = $(el).find('.info strong').text().trim()

        // console.log('clave: ', clave)
        // console.log('valor: ', valor)


        if(!clave) return;

        const campoConocido = CAMPOS_FIJOS[clave];

        if (campoConocido) {
            camposFijos[campoConocido] = valor || null;
            
        } else if (!(clave in CAMPOS_FIJOS)) {
            if (valor) dataDinamica[clave] = valor
        } else if (CAMPOS_FIJOS[clave] === null && valor ){
            dataDinamica[clave] = valor;
        }


    })


    const votacion = {
        ...camposFijos,
        ...dataDinamica
    }

    const votos = [];
    Object.entries(TABLAS_VOTOS).forEach( ([tipoVoto, selector]) => {
        $(selector).find('a[href*="prmID"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const idDiputado = extraerId(href);
            const nombre = $(el).text().trim();

            if(nombre){
                votos.push({
                    id_votacion : idVotacion,
                    id_diputado: idDiputado,
                    nombre,
                    voto: tipoVoto
                })
            }
        })
    })

    


    return {votacion, votos};
}