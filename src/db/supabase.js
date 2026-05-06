import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
)

const numero = (valor) => {
    if (valor === null || valor === undefined || valor === "") return null
    return Number(valor)
}

const guardar = async (tabla, registros, onConflict) => {
    if(!registros.length) return

    const { error } = await supabase
        .from(tabla)
        .upsert(registros, { onConflict })
    if (error) throw new Error(`Error guardando ${tabla}: ${error.message}`)

}

export const guardarVotacion = async (votacion, detalle, votos) => {
    const votacionNormalizada = {
        id_votacion:  numero(votacion.id_votacion),
        tipo_documento: votacion.tipo_documento,
        fecha_texto: detalle.fecha,
        materia: detalle.materia,
        sesion: detalle.sesion,
        tramite: detalle.tramite,
        articulo: detalle.articulo,
        quorum: detalle.quorum,
        resultado: detalle.resultado
    }

    await guardar('votaciones', [votacionNormalizada], 'id_votacion' )

    if (votos?.length){
        await guardarVotosDiputado(votos)
    }
}

export const guardarVotosDiputado = async (votos) => {
    const registros = votos.map( voto => ({
        id_votacion: numero(voto.id_votacion),
        id_diputado: numero(voto.id_diputado),
        voto: voto.voto
    }))

    await guardar('votos_diputado', registros, 'id_votacion,id_diputado' )

}

export const guardarAsistencia = async (registros) => {
    if(!registros?.length) return;
    const { error } = await supabase
        .from('asistencia')
        .upsert(registros, {onConflict: 'id_diputado, numero_sesion'})
    if (error) throw new Error(`Error guardando asistencia: ${error.message}`)
}

export const guardarComisiones = async (comisionesDiputado) => {
    const registros = comisionesDiputado

    const comisiones = registros.map( (comision) => ({
        id_comision: numero(comision.id_comision),
        nombre: comision.nombre
    }))

    await guardar('comisiones', comisiones, 'id_comision' )

    const diputadoComisiones = registros.map( (comision) => ({
        id_diputado: numero(comision.id_diputado),
        id_comision: numero(comision.id_comision)
    }))

    await guardar('diputado_comisiones', diputadoComisiones, 'id_diputado,id_comision' )

}

export const guardarMociones = async (mocionesDiputado) => {
    const registros = mocionesDiputado

    const mociones = registros.map( (mocion) => ({
        numero_boletin: mocion.numero_boletin,
        titulo: mocion.titulo
    }))

    await guardar('mociones', mociones, 'numero_boletin' )

    const diputadoMociones = registros.map( (mocion) => ({
        id_diputado: numero(mocion.id_diputado),
        id_mocion: mocion.numero_boletin
    }))

    await guardar('diputado_mociones', diputadoMociones, 'id_diputado,id_mocion' )

}

export const guardarOficios = async (oficiosDiputado, idDiputado) => {
    const registros = oficiosDiputado

    const oficios = registros.map( (oficio) => ({
        numero_oficio: numero(oficio),
    }))

    await guardar('oficios', oficios, 'numero_oficio' )

    const diputadoOficios = registros.map( (oficio) => ({
        id_diputado: numero(idDiputado),
        id_oficio: numero(oficio)
    }))

    await guardar('diputado_oficios', diputadoOficios, 'id_diputado,id_oficio' )

}