import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "../config/env.js";

const supabase = createClient(
  getRequiredEnv("SUPABASE_URL"),
  getRequiredEnv("SUPABASE_ANON_KEY"),
);

const numero = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  return Number(valor);
};

const guardar = async (tabla, registros, onConflict) => {
  if (!registros.length) return;

  const claves = onConflict.split(',').map( c=> c.trim());
  const vistos = new Set();

  const registrosUnicos = registros.filter( r => {
    const key = claves.map( c => r[c]).join('-')  
    if (vistos.has(key)) return false
    vistos.add(key)
    return true;
  })

  const { error } = await supabase
    .from(tabla)
    .upsert(registrosUnicos, { onConflict });
  if (error) throw new Error(`Error guardando ${tabla}: ${error.message}`);
};

export const guardarVotacion = async (votacion, detalle, votos) => {
  const votacionNormalizada = {
    id_votacion: numero(votacion.id_votacion),
    tipo_documento: votacion.tipo_documento,
    fecha_texto: detalle.fecha,
    materia: detalle.materia,
    sesion: detalle.sesion,
    tramite: detalle.tramite,
    articulo: detalle.articulo,
    quorum: detalle.quorum,
    resultado: detalle.resultado,
  };

  await guardar("votaciones", [votacionNormalizada], "id_votacion");

  if (votos?.length) {
    await guardarVotosDiputado(votos);
  }
};

export const actualizarRankingEstadisticoDiputados = async () => {
  const { data, error } = await supabase.rpc(
    "actualizar_ranking_estadistico_diputados",
  );

  if (error) {
    throw new Error(
      `Error actualizando ranking estadístico de diputados: ${error.message}`,
    );
  }

  return data ?? [];
};

export const guardarVotosDiputado = async (votos) => {
  const registros = votos.map((voto) => ({
    id_votacion: numero(voto.id_votacion),
    id_diputado: numero(voto.id_diputado),
    voto: voto.voto,
  }));

  await guardar("votos_diputado", registros, "id_votacion,id_diputado");
};

export const guardarAsistencia = async (registros) => {
  if (!registros?.length) return;
  const { error } = await supabase
    .from("asistencia")
    .upsert(registros, { onConflict: "id_diputado, numero_sesion" });
  if (error) throw new Error(`Error guardando asistencia: ${error.message}`);
};

export const guardarResumenAsistencia = async (resumenAsistencia) => {
  if (!resumenAsistencia) return;

  const registro = {
    id_diputado: numero(resumenAsistencia.id_diputado),
    ausencias_justificadas: numero(resumenAsistencia.ausencias_justificadas),
  };

  await guardar("asistencia_resumen", [registro], "id_diputado");
};

export const guardarComisiones = async (comisionesDiputado) => {
  const registros = comisionesDiputado;

  const comisiones = registros.map((comision) => ({
    id_comision: numero(comision.id_comision),
    nombre: comision.nombre,
  }));

  await guardar("comisiones", comisiones, "id_comision");

  const diputadoComisiones = registros.map((comision) => ({
    id_diputado: numero(comision.id_diputado),
    id_comision: numero(comision.id_comision),
  }));

  await guardar(
    "diputado_comisiones",
    diputadoComisiones,
    "id_diputado,id_comision",
  );
};

export const guardarMociones = async (mocionesDiputado) => {
  const registros = mocionesDiputado;

  const mociones = registros.map((mocion) => ({
    numero_boletin: mocion.numero_boletin,
    titulo: mocion.titulo,
  }));

  await guardar("mociones", mociones, "numero_boletin");

  const diputadoMociones = registros.map((mocion) => ({
    id_diputado: numero(mocion.id_diputado),
    id_mocion: mocion.numero_boletin,
  }));

  await guardar("diputado_mociones", diputadoMociones, "id_diputado,id_mocion");
};

export const guardarOficios = async (oficiosDiputado, idDiputado) => {
  const registros = oficiosDiputado;

  const oficios = registros.map((oficio) => ({
    numero_oficio: numero(oficio),
  }));

  await guardar("oficios", oficios, "numero_oficio");

  const diputadoOficios = registros.map((oficio) => ({
    id_diputado: numero(idDiputado),
    id_oficio: numero(oficio),
  }));

  await guardar("diputado_oficios", diputadoOficios, "id_diputado,id_oficio");
};

export const guardarAsistenciaSenadores = async (registrosAsistencia) => {
  const registros = registrosAsistencia.map((registro) => ({
    id_senador: numero(registro.id_parlamentario),
    fecha: registro.fecha,
    sesion: registro.sesion,
    tipo: registro.tipo,
    asistencia: registro.asistencia,
    justificacion: registro.justificacion,
  }));

  await guardar("senador_asistencia", registros, "id_senador,sesion");
};

export const guardarResumenAsistenciaSenadores = async (
  registrosResumenAsistencia,
) => {
  const registros = registrosResumenAsistencia.map((registro) => ({
    id_senador: numero(registro.id_senador),
    ausencias_justificadas: numero(registro.ausencias_justificadas),
  }));

  await guardar("asistencia_resumen_senadores", registros, "id_senador");
};

export const guardarComisionesSenadores = async (comisionesSenador) => {
  const registros = comisionesSenador;

  const comisiones = registros.map((comision) => ({
    id_comision: numero(comision.id_comision),
    nombre: comision.nombre,
  }));

  await guardar("comisiones_senado", comisiones, "id_comision");

  const senadorComisiones = registros.map((comision) => ({
    id_senador: numero(comision.id_senador),
    id_comision: numero(comision.id_comision),
    cargo: comision.cargo,
  }));

  await guardar(
    "senador_comisiones",
    senadorComisiones,
    "id_senador,id_comision",
  );
};

export const actualizarRankingEstadisticoPartidos = async () => {
  const { data, error } = await supabase.rpc(
    "actualizar_ranking_estadistico_partidos",
  );

  if (error) {
    throw new Error(
      `Error actualizando ranking estadístico de partidos: ${error.message}`,
    );
  }

  return data ?? [];
};

export const guardarVotacionesSenado = async (votacionesSenado) => {

  const votaciones = votacionesSenado.map( (registro) => ({
    id_votacion: numero(registro.votacion.id_votacion),
    numero_sesion: numero(registro.votacion.numero_sesion),
    fecha_texto: registro.votacion.fecha,
    tema: registro.votacion.tema,
    boletin: registro.votacion.boletin
  }))

  await guardar('votaciones_senado', votaciones, 'id_votacion');

  const votos = votacionesSenado.flatMap( (registro) => registro.votos )
      .map( voto => ({
        id_votacion: numero(voto.id_votacion),
        id_senador: numero(voto.id_senador),
        voto: voto.voto
      }));

  await guardar('votos_senador', votos, 'id_votacion, id_senador');

}

export const guardarMocionesSenadores = async (mocionesSenador) => {
  const registros = mocionesSenador;

  const mociones = registros.map((mocion) => ({
    id_mocion: mocion.id_mocion,
    titulo: mocion.titulo,
  }));

  await guardar("mociones_senado", mociones, "id_mocion");

  const senadorMociones = registros.map((mocion) => ({
    id_senador: numero(mocion.id_senador),
    id_mocion: mocion.id_mocion,
  }));

  await guardar(
    "senador_mociones",
    senadorMociones,
    "id_senador,id_mocion",
  );
};

export const guardarAcuerdosSenadores = async (acuerdosSenador) => {
  const registros = acuerdosSenador;

  const acuerdos = registros.map((acuerdo) => ({
    id_acuerdo: acuerdo.id_acuerdo,
    titulo: acuerdo.titulo,
  }));

  await guardar("acuerdos_senado", acuerdos, "id_acuerdo");

  const senadorAcuerdos = registros.map((acuerdo) => ({
    id_senador: numero(acuerdo.id_senador),
    id_acuerdo: acuerdo.id_acuerdo,
  }));

  await guardar(
    "senador_acuerdos",
    senadorAcuerdos,
    "id_senador,id_acuerdo",
  );
};

export const guardarOficiosSenadores = async (oficiosSenador) => {
  const registros = oficiosSenador;

  const oficios = registros.map((oficio) => ({
    numero_oficio: oficio.numero_oficio,
    materia: oficio.materia,
    fecha: oficio.fecha,
    destinos: oficio.destinos,
  }));

  await guardar("oficios_senado", oficios, "numero_oficio");

  const senadorOficios = registros.map((oficio) => ({
    id_senador: numero(oficio.id_senador),
    numero_oficio: oficio.numero_oficio,
  }));

  await guardar(
    "senador_oficios",
    senadorOficios,
    "id_senador,numero_oficio",
  );
};