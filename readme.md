<div class="contenedor_votacion">
    <div class="datos_votacion">
        06 de abril de 2026  |  Boletín N° 16569-25
    </div>
<div class="campos_votacion">
    <div class="materia_votacion">
        <strong>Materia:</strong><p>
            <a href="votacion_detalle.aspx?prmIdVotacion=88544">Amplía la penalización dispuesta en el artículo 304 bis del Código Penal, para fortalecer la seguridad perimetral de los recintos penales</a>
    </p></div>
    <div class="materia_votacion">
        <strong>Artículo:</strong><p>Modificaciones incorporadas por el Senado en el proyecto de ley, originado en moción y mensaje, que “Amplía la penalización dispuesta en el artículo 304 bis del Código Penal, para fortalecer la seguridad perimetral de los recintos penales.”. 
</p>
    </div>
    <div class="inferiores">
        <div class="izq">
            <div><strong>Tipo: </strong>Única</div>
        </div>
        <div class="derech">
            <div><strong>Resultado: </strong>Rechazado</div>
            <div><strong>Afirmativo: </strong>16</div>
            <div><strong>Negativa: </strong>124</div>
            <div><strong>Abstención: </strong>5</div>
        </div>
    </div>
</div>
</div>


asistencia.js

{
    id_diputado: 1264,
    numero_sesion: 8,
    numero_legislatura: 374,
    fecha: '6 Abril 2026',
    hora_inicio: '17:03',
    hora_fin: '19:17',
    hora_ingreso: '17:03',
    asistencia: 'Asiste',
    observaciones: null
}

create table asistencia (
    id bigint generated always as identity primary key,
    id_diputado int references diputados(id) on delete cascade,
    numero_sesion int,
    numero_legislatura int,
    hora_inicio text,
    hora_fin text,
    hora_ingreso text,
    asistencia text,
    observaciones text,
    unique (id_diputado, numero_sesion)
);


--votaciones
[   
  {
    id_votacion: '88718',
    tipo_documento: 'Boletín N° 17235-07',> 
  }
]

--votacionDetalle



    'fecha': 'fecha',
    'materia': 'materia',
    'tipo de votación': 'tipo_votacion',

votacion: {
fecha: '22 abril 2026',
materia: 'Modifica el Código Penal para crear el tipo especial de robo cometido por tumulto o multitud',
'sesión': 'Sesión n°16, Ordinaria del 22 Apr 2026 a las 11:12hrs.',
'trámite': 'Primer Trámite / Primer Informe',
quorum: 'Quorum Simple',
resultado: 'Aprobado'
},
votos: [
{
    id_votacion: '88718',
    id_diputado: '1186',
    nombre: 'Achurra Díaz, Ignacio',
    voto: 'A Favor'
},

CREATE TABLE votaciones (
    id_votacion text primary key,
    tipo_documento text,
    fecha text,
    materia text,
    sesion text,
    tramite text,
    articulo text,
    quorum text,
    resultado text,
    scraped_at timestamptz default now()
)


### Votos por diputado

{
    id_votacion: "82738",
    id_diputado: "1099",
    voto: "A Favor"
}

CREATE TABLE votos_diputado (
    id_votacion integer not null references votaciones(id_votacion) on delete cascade,
    id_diputado integer not null references diputados(id) on delete cascade,
    voto text not null,
    primary key (id_votacion, id_diputado)
)

CREATE TABLE comisiones (
    id_comision integer primary key,
    nombre text not null,
    scraped_at timestamptz default now()
)

CREATE TABLE diputado_comisiones (
    id_diputado integer not null references diputados(id) on delete cascade,
    id_comision integer not null references comisiones(id_comision) on delete cascade,
    scraped_at timestamptz default now(),
    primary key (id_diputado, id_comision)
)


### Mociones
CREATE TABLE mociones (
    numero_boletin text primary key,
    titulo text not null,
    scraped_at timestamptz default now(),
);

CREATE TABLE diputado_mociones (
    id_diputado integer not null references diputados(id) on delete cascade,
    id_mocion text not null references mociones(numero_boletin) on delete cascade,
    scraped_at timestamptz default now(),
    primary key (id_diputado, id_mocion)
);

### Oficios
CREATE TABLE oficios (
    numero_oficio integer primary key,
    scraped_at timestamptz default now(),
);

CREATE TABLE diputado_oficios (
    id_diputado integer not null references diputados(id) on delete cascade,
    id_oficio integer not null references oficios(numero_oficio) on delete cascade,
    scraped_at timestamptz default now(),
    primary key (id_diputado, id_oficio)
);

