import axios from "axios";
import * as cheerio from "cheerio";
import "dotenv/config"

const URL_LISTADO = `${process.env.CAMARA_BASE_URL}/legislacion/sala_sesiones/votaciones.aspx`

const html = await axios.get(URL_LISTADO, {
    headers: {   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
 }
}).then(r => r.data)

const $ = cheerio.load(html);


const links = $('a');

links.each( (i, el) => {
    const href = $(el).attr('href');
    console.log(i, href);
})



