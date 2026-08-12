import "dotenv/config";
import { obtenerVotacionesPorFecha } from "../scrapers/votaciones.js";
import { obtenerDetalle } from "../scrapers/votacionDetalle.js";
import {
  guardarVotacion,
  actualizarRankingEstadisticoDiputados,
  actualizarRankingEstadisticoPartidos,
} from "../db/supabase.js";
import { closeBrowser, getPage } from "../http/client.js";

const run = async () => {
  console.log("Inicio scraper ultimas votaciones");

  const page = await getPage();

  const votaciones = await obtenerVotacionesPorFecha(page);
  console.log("Votaciones encontradas:", votaciones.length);

  if (votaciones.length === 0) {
    console.log("No se encontraron votaciones");
    return;
  }

  let procesadas = 0;
  let fallidas = 0;

  for (const [index, votacion] of votaciones.entries()) {
    const progreso = `${index + 1}/${votaciones.length}`;
    console.log(`[${progreso}] Procesando votacion ${votacion.id_votacion}`);

    try {
      const detalle = await obtenerDetalle(votacion.id_votacion);
      await guardarVotacion(votacion, detalle.votacion, detalle.votos);
      procesadas += 1;
      console.log(`[${progreso}] Votacion ${votacion.id_votacion} guardada`);
    } catch (error) {
      fallidas += 1;
      console.error(
        `[${progreso}] Error procesando votacion ${votacion.id_votacion}: `,
        error,
      );
    }
  }

  console.log("Actualizando ranking estadístico de partidos");

  const rankingPartidos = await actualizarRankingEstadisticoPartidos();

  console.log(
    `Ranking estadístico de partidos actualizado: ${rankingPartidos.length} partidos`,
  );

  console.log(
    `Fin scraper ultimas votaciones. Procesadas ${procesadas}. Fallidas ${fallidas}.`,
  );

  console.log("Actualizando ranking estadístico de diputados...");

  try {
    await actualizarRankingEstadisticoDiputados();
    console.log("Ranking estadístico actualizado correctamente.");
  } catch (error) {
    console.error("Error al actualizar ranking estadístico:", error.message);
  }
};

run()
  .catch((error) => {
    console.error(`Error: `, error);
    process.exitCode = 1;
  })
  .finally(async () => await closeBrowser());
