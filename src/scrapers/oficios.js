import { camaraHttp } from "../http/client.js";
import { parseOficios } from "../parsers/parseOficios.js";

const BASE_URL = 'https://www.camara.cl/diputados/detalle/oficio.aspx'

const EVENT_TARGET_PAG2 = 'ctl00$ctl00$ctl00$ContentPlaceHolder1$ContentPlaceHolder1$DetallePlaceHolder$pager$rptPager$ctl02$page'

export const obtenerOficios = async (idDiputado) => {

    const url = `${BASE_URL}?prmId=${idDiputado}`

    //Pagina 1 - GET 
    const htmlPag1 = await camaraHttp.get(url)
    const oficiosPag1 = parseOficios(htmlPag1, idDiputado);

    //Pagina 2 = doPostBack
    const hayPagina2 = htmlPag1.includes('ctl02$page')
    if(!hayPagina2){
        return oficiosPag1
    }

    const htmlPag2 = await camaraHttp.doPostBack(url, htmlPag1, EVENT_TARGET_PAG2  )
    const oficiosPag2 = parseOficios(htmlPag2, idDiputado);
    ('oficios pag 2: ', oficiosPag2);

    return [...oficiosPag1, ...oficiosPag2]

}