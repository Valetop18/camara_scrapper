/*

| Quórum                | Votos favorables necesarios | Cálculo              |
| --------------------- | --------------------------: | -------------------- |
| **Mayoría simple**    |        Depende de presentes | mayoría de presentes |
| **Mayoría absoluta**  |                      **26** | `>= 26`              |
| **Q.C.**50.           |                      **26** | `>= 26`              |
| **Cuatro séptimos**   |                      **29** | `>= 29`              |
| **Tres quintos**      |                      **30** | `>= 30`              |
| **Tres quintos Q.C.** |                      **30** | `>= 30`              |
| **Dos tercios**       |                     **34*** | `>= 34`              |
| **Dos tercios Q.C.**  |                     **34*** | `>= 34`              |
| **Tres cuartos**      |                     **38*** | `>= 38`     

*/


const QUORUM_QC = {
    "mayoria absoluta": 25,
    "qc": 25,
    "tres quintos qc": 29,
    "dos tercios qc": 33,
    "tres cuartos qc": 37,
    "cuatro septimos qc": 28
}

const FRACCIONES_QUORUM = {
    "cuatro septimos": [4, 7],
    "tres quintos": [3, 5],
    "dos tercios": [2, 3],
    "tres cuartos": [3, 4]
}

//                            "NOMBRE": "Iv\u00e1n",
const normalizarQuorum = (quorum = "") => quorum
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .trim()
    .toLowerCase();

const cantidadVotos = (valor) => {
    if (valor === null || valor === undefined || valor === "") return null;
    const cantidad = Number(valor);
    return cantidad;
}




export const calcularResultadoVotacion = (registro) => {

    const quorum = normalizarQuorum(registro?.QUORUM);
    const votosFavorables = cantidadVotos(registro?.SI);

    if ( !quorum || votosFavorables === null) return null;

    const votosEnContra = cantidadVotos(registro?.NO);
    const abstenciones = cantidadVotos(registro?.ABS);
    const pareos = cantidadVotos(registro?.PAREO);

    let votosNecesarios = QUORUM_QC[quorum];

    //No es QC
    if (votosNecesarios === undefined) {

    if (votosEnContra === null || abstenciones === null || pareos === null) {
        return null;
    }

        const presentes = votosFavorables + votosEnContra + abstenciones + pareos;

        if (quorum === "mayoria simple") {
            votosNecesarios = presentes / 2;
        } else {
            const fraccion = FRACCIONES_QUORUM[quorum];
            if (!fraccion) return null;
            votosNecesarios = ( presentes * fraccion[0] ) / fraccion[1]
        }

    }

    return votosFavorables >= votosNecesarios ? "Aprobado" : "Rechazado";

    
}