create table senador_asistencia (
    id bigint generated always as identity primary key,
    id_senador bigint not null references senadores(id) on delete cascade,
    fecha text,
    sesion integer,
    tipo text,
    asistencia text,
    justificacion text,
    unique (id_senador, sesion)
);

create table asistencia_resumen_senadores (
    id_senador bigint primary key references senadores(id) on delete cascade,
    ausencias_justificadas integer
);



create table comisiones_senado (
    id_comision integer primary key,
    nombre text not null
);

create table senador_comisiones (
    id_senador bigint not null references senadores(id) on delete cascade,
    id_comision integer not null references comisiones_senado(id_comision) on delete cascade,
    cargo text,
    primary key (id_senador, id_comision)
);

create table votaciones_senado (
    id_votacion integer primary key,
    numero_sesion integer,
    fecha_texto text,
    tema text,
    boletin text,
);

create table votos_senador (
    id_votacion integer not null references votaciones_senado(id_votacion) on delete cascade,
    id_senador bigint not null references senadores(id) on delete cascade,
    voto text,
    primary key (id_votacion, id_senador)
); 


create table mociones_senado (
    id_mocion text primary key,
    titulo text not null
);

create table senador_mociones (
    id_senador bigint not null references senadores(id) on delete cascade,
    id_mocion text not null references mociones_senado(id_mocion) on delete cascade,
    primary key (id_senador, id_mocion)
);


create table acuerdos_senado (
    id_acuerdo text primary key,
    titulo text not null
);

create table senador_acuerdos (
    id_senador bigint not null references senadores(id) on delete cascade,
    id_acuerdo text not null references acuerdos_senado(id_acuerdo) on delete cascade,
    primary key (id_senador, id_acuerdo)
);



--votaciones dummy
insert into votaciones (
    id_votacion,
    materia,
    articulo
)
values(
    12345,
    'La Cámara de Diputadas y Diputados manifiesta su preocupación por el eventual uso de la facultad de indulto en casos de delitos de especial gravedad, y solicita a S. E. el Presidente de la República que, en el ejercicio de dicha atribución, se abstenga de otorgar este beneficio en situaciones que involucren afectaciones graves a la vida o a la integridad física o psíquica de las personas, especialmente cuando se trate de hechos que hayan provocado la muerte o lesiones graves o gravísimas, con consecuencias permanentes.',
    'Petición de la Comisión de Agricultura, Silvicultura y Desarrollo Rural mediante la cual solicita, en virtud del artículo 17 A de la ley orgánica del Congreso Nacional, recabar el asentimiento de la Sala para refundir los proyectos, iniciados en moción, contenidos en los boletines 16962-01 y 18269-01, sobre prevención y control de riesgos asociados a perros ferales, que puedan afectar a las personas, el ganado y la fauna silvestre.'
)

insert into votaciones (
    id_votacion,
    materia,
    articulo
)
values(
    12341,
    'La Cámara de Diputadas y Diputados manifiesta su preocupación por el eventual uso de la facultad de indulto en casos de delitos de especial gravedad, y solicita a S. E. el Presidente de la República que, en el ejercicio de dicha atribución, se abstenga de otorgar este beneficio en situaciones que involucren afectaciones graves a la vida o a la integridad física o psíquica de las personas, especialmente cuando se trate de hechos que hayan provocado la muerte o lesiones graves o gravísimas, con consecuencias permanentes.',
    ''
)

