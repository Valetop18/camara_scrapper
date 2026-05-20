import * as cheerio from 'cheerio';

const SELECTORES = {
    filas: '#ContentPlaceHolder1_ContentPlaceHolder1_DetallePlaceHolder_UpdatePanel1 .tabla tbody tr',
    sesion: 'td:nth-child(1)',
    horaIngreso: 'td:nth-child(2)',
    asistencia: 'td:nth-child(3)',
    observaciones: 'td:nth-child(4)',
}

const parseAusenciasJustificadas = ($) => {
    const valor = $('.tabla').first().find('tbody tr:first-child td:nth-child(4)').text().trim();
    return valor;
}


export const parseAsistencia = (html, idDiputado) => {
    const $ = cheerio.load(html);
    const registros = []

    const ausenciasJustificadas = parseAusenciasJustificadas($)

    $(SELECTORES.filas).each((_, el) => {
        const $el = $(el);
        const sesion = $el.find(SELECTORES.sesion).text().trim()

        if(!sesion) return;

        //Sesión 13ª, Legislatura 374ª, 15 Abril 2026 - de 10:01 a 13:52
        const [sesionTxt, legislaturaTxt, fechaHora] = sesion.split(",")
        
        const numeroSesion = Number( sesionTxt.replace("Sesión", "").replace("ª", "").trim()  );
        const numeroLegislatura = Number( legislaturaTxt.replace("Legislatura", "").replace("ª", "").trim()  );

        const [ fechaTxt, horasTxt] = fechaHora.split("-")

        const fecha = fechaTxt.trim();

        const horas = horasTxt.replace("de", "").trim();
        const [horaInicio, horaFin] = horas.split(" a ")





        registros.push({
            id_diputado: idDiputado,
            numero_sesion: numeroSesion,
            numero_legislatura: numeroLegislatura,
            fecha,
            hora_inicio: horaInicio,
            hora_fin : horaFin,
            hora_ingreso : $el.find(SELECTORES.horaIngreso).text().trim() || null,
            asistencia : $el.find(SELECTORES.asistencia).text().trim() || null,
            observaciones : $el.find(SELECTORES.observaciones).text().trim() || null,
        })

    })

    if (registros.length === 0) {
        console.error('parseDiputados no encontro diputados, revisar html de la pagina')
    }

    return {
        sesiones: registros,
        resumen: {
            id_diputado: idDiputado,
            ausencias_justificadas: ausenciasJustificadas
        }
    }
}