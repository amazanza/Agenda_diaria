
/*
------------------------------------------------------------
Desarrollo de Aplicaciones Interactivas
PR3. Extensión web — Agenda diaria
Alumna: Amaya Muñoz Azanza
------------------------------------------------------------

Agenda interactiva para Firefox basada en El mosaico del tiempo,
reloj desarrollado en la primera práctica de la asignatura.

El mosaico está formado por 24 piezas de diferentes colores,
una por cada hora del día. La intensidad de los colores permite
distinguir las horas pasadas, la actual y las futuras.

La pieza activa muestra el avance de los minutos mediante
una cuadrícula de 60 celdas, una por cada minuto. El relleno
avanza celda a celda y un pequeño pulso cambia de tamaño
cada segundo dentro de la celda del minuto actual.

La agenda permite desplazarnos entre los diferentes días,
crear, consultar, editar, completar, cancelar y eliminar citas.
Los datos se guardan en el almacenamiento local del navegador.

Las citas aparecen ordenadas por hora en la lista inferior
y se representan mediante iconos dentro del mosaico.

Incorporamos nuestros propios selectores de fecha y hora
para evitar los problemas de los desplegables nativos
dentro de la extensión de Firefox.

El indicador de progreso diario muestra la proporción
de citas completadas, sin incluir las canceladas.

Tecnologías: JavaScript, p5.js 2.3.4, HTML, CSS y WebExtensions.
*/


// Colores del fondo, las juntas y el borde de la hora actual.

let fondo = '#F4F1E9';
let colorJuntas = '#FFFFFF';
let bordeActual = '#294D3A';


// Dimensiones originales del mosaico y espacio disponible
// dentro de la agenda.

let anchoMosaicoBase = 1055;
let altoMosaicoBase = 750;

let anchoMosaico = 388;
let altoMosaico = 276;

let escalaMosaico;
let margenX;
let margenY;


// Intensidad de las horas pasadas y futuras.

let factorPasadas = 0.60;
let factorFuturas = 0.12;


// Fecha que estamos consultando.

let fechaSeleccionada;


// Guardamos todas las citas y los identificadores
// de la cita seleccionada y de la que estamos editando.

let citas = [];
let citaSeleccionada = null;
let citaEnEdicion = null;


// Capa transparente donde colocamos los iconos del mosaico.

let capaIconos;


// Variables de los selectores de fecha y hora.

let ventanaSelector = null;
let mesCalendario;
let campoHorario;
let horaElegida;
let minutoElegido;


// Conservamos la paleta cromática de El mosaico del tiempo.

let coloresHoras = [
    '#C89211', // 00 - Ocre
    '#3568B8', // 01 - Azul cobalto
    '#D85C4A', // 02 - Coral
    '#2E8B70', // 03 - Verde esmeralda
    '#7150A8', // 04 - Violeta
    '#D7B82E', // 05 - Amarillo mostaza
    '#2C9AA0', // 06 - Turquesa
    '#8F334B', // 07 - Granate
    '#7F8B35', // 08 - Verde oliva
    '#4D9BC8', // 09 - Azul celeste
    '#C76B3D', // 10 - Terracota
    '#C93A3A', // 11 - Rojo
    '#47724C', // 12 - Verde bosque
    '#E47A22', // 13 - Naranja
    '#4450A1', // 14 - Índigo
    '#B18C5A', // 15 - Arena tostada
    '#C2437A', // 16 - Fucsia
    '#326F7D', // 17 - Azul petróleo
    '#D8A6B3', // 18 - Rosa palo
    '#7A5644', // 19 - Marrón
    '#8DAF45', // 20 - Verde lima
    '#536A86', // 21 - Azul pizarra
    '#A96532', // 22 - Cobre
    '#6E466F'  // 23 - Ciruela
];


// Posición y dimensiones originales de las 24 piezas.
// Cada grupo contiene la posición X, posición Y, ancho y alto.

let piezas = [
    [0,   0,   220, 150], // 00
    [225, 0,   125, 145], // 01
    [355, 0,   195, 175], // 02
    [555, 0,   105, 170], // 03
    [665, 0,   250, 145], // 04
    [920, 0,   135, 140], // 05

    [0,   155, 145, 200], // 06
    [150, 155, 200, 210], // 07
    [355, 180, 150, 145], // 08
    [510, 180, 150, 175], // 09
    [665, 155, 200, 210], // 10
    [870, 145, 185, 220], // 11

    [0,   360, 185, 190], // 12
    [190, 370, 165, 200], // 13
    [360, 340, 195, 210], // 14
    [560, 370, 175, 190], // 15
    [740, 370, 315, 190], // 16

    [0,   575, 105, 175], // 17
    [110, 585, 145, 165], // 18
    [260, 555, 235, 195], // 19
    [500, 565, 140, 185], // 20
    [645, 555, 145, 195], // 21
    [795, 565, 125, 185], // 22
    [925, 555, 130, 195]  // 23
];


// Nombres de los días y los meses.

let diasSemana = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
];

let meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
];


// Relacionamos cada categoría con la clase CSS de su icono.

let iconosCategorias = {
    'Trabajo': 'iconoTrabajo',
    'Estudios': 'iconoEstudios',
    'Salud': 'iconoSalud',
    'Reunión': 'iconoReunion',
    'Ocio': 'iconoOcio',
    'Personal': 'iconoPersonal',
    'Compras': 'iconoCompras',
    'Otros': 'iconoOtros'
};


// ------------------------------------------------------------
// CONFIGURACIÓN INICIAL
// ------------------------------------------------------------

function setup() {

    // Creamos el canvas dentro del espacio reservado en el HTML.

    let lienzo = createCanvas(anchoMosaico, altoMosaico);

    lienzo.parent('mosaico');

    calcularEscala();

    // Al abrir la agenda mostramos siempre el día actual.

    fechaSeleccionada = new Date();

    cargarCitas();

    mostrarFecha();

    prepararNavegacion();
    prepararFormulario();
    prepararSelectores();
    prepararDetalle();
    prepararIconosMosaico();
    prepararInteraccionMosaico();

    mostrarCitas();

}


// Calculamos la escala para reducir el mosaico sin alterar
// las proporciones originales de sus piezas.

function calcularEscala() {

    escalaMosaico = min(
        (width - 8) / anchoMosaicoBase,
        (height - 8) / altoMosaicoBase
    );

    margenX = (width - anchoMosaicoBase * escalaMosaico) / 2;
    margenY = (height - altoMosaicoBase * escalaMosaico) / 2;

}


// Trasladamos las coordenadas originales al tamaño actual.

function pantallaX(valor) {

    return margenX + valor * escalaMosaico;

}

function pantallaY(valor) {

    return margenY + valor * escalaMosaico;

}

function medida(valor) {

    return valor * escalaMosaico;

}


// ------------------------------------------------------------
// ACTUALIZACIÓN DEL RELOJ
// ------------------------------------------------------------

function draw() {

    background(colorJuntas);

    let ahora = new Date();

    let horaActual = ahora.getHours();
    let minutoActual = ahora.getMinutes();
    let segundoActual = ahora.getSeconds();

    // Dibujamos la pieza activa al final para evitar
    // que pueda quedar oculta por alguna de las demás.

    dibujarMosaico(horaActual);

    dibujarHoraActiva(
        horaActual,
        minutoActual,
        segundoActual
    );

    // Colocamos los números después de dibujar la hora activa
    // para que ninguna pieza pueda taparlos.

    dibujarNumerosHoras();

    mostrarHoraDigital(
        horaActual,
        minutoActual,
        segundoActual
    );

}


// ------------------------------------------------------------
// MOSAICO DE LAS 24 HORAS
// ------------------------------------------------------------

function dibujarMosaico(horaActual) {

    noStroke();

    for (let i = 0; i < piezas.length; i++) {

        let x = pantallaX(piezas[i][0]);
        let y = pantallaY(piezas[i][1]);

        let ancho = medida(piezas[i][2]);
        let alto = medida(piezas[i][3]);

        if (i < horaActual) {

            fill(
                colorConIntensidad(
                    coloresHoras[i],
                    factorPasadas
                )
            );

            rect(x, y, ancho, alto);

        } else if (i > horaActual) {

            fill(
                colorConIntensidad(
                    coloresHoras[i],
                    factorFuturas
                )
            );

            rect(x, y, ancho, alto);

        }

    }

}


// ------------------------------------------------------------
// NÚMEROS DE LAS HORAS
// ------------------------------------------------------------

// Identificamos cada pieza con su hora, de 00 a 23.
// Los números se muestran en color oscuro y sin contorno.
// Usamos las coordenadas escaladas para colocarlos en la
// esquina superior izquierda de cada pieza.

function dibujarNumerosHoras() {

    push();

    textFont('Arial');
    textStyle(BOLD);
    textSize(8);
    textAlign(LEFT, TOP);

    noStroke();
    fill('#202020');

    for (let i = 0; i < piezas.length; i++) {

        let x = pantallaX(piezas[i][0]);
        let y = pantallaY(piezas[i][1]);

        text(nf(i, 2), x + 4, y + 3);

    }

    pop();

}


// Mezclamos el color de cada hora con el marfil del fondo.

function colorConIntensidad(hexadecimal, factor) {

    let colorFondo = color(fondo);
    let colorHora = color(hexadecimal);

    return lerpColor(colorFondo, colorHora, factor);

}


// ------------------------------------------------------------
// HORA ACTIVA
// ------------------------------------------------------------

function dibujarHoraActiva(
    horaActual,
    minutoActual,
    segundoActual
) {

    let x = pantallaX(piezas[horaActual][0]);
    let y = pantallaY(piezas[horaActual][1]);

    let ancho = medida(piezas[horaActual][2]);
    let alto = medida(piezas[horaActual][3]);

    let colorHora = coloresHoras[horaActual];

    // Los minutos pendientes tienen una intensidad más suave.

    noStroke();
    fill(colorConIntensidad(colorHora, 0.75));
    rect(x, y, ancho, alto);

    // Distribuimos los 60 minutos en una cuadrícula que se adapta
    // a la forma de la pieza y conserva sus dimensiones originales.
    // Buscamos una combinación de filas y columnas que genere
    // celdas lo más parecidas posible a cuadrados.

    let columnas = 10;
    let opcionesColumnas = [3, 4, 5, 6, 10, 12, 15, 20];
    let menorDiferencia = Infinity;

    for (let i = 0; i < opcionesColumnas.length; i++) {

        let opcion = opcionesColumnas[i];
        let filasOpcion = 60 / opcion;
        let diferencia = abs(ancho / opcion - alto / filasOpcion);

        if (diferencia < menorDiferencia) {

            menorDiferencia = diferencia;
            columnas = opcion;

        }

    }

    let filas = 60 / columnas;
    let anchoCelda = ancho / columnas;
    let altoCelda = alto / filas;

    // Coloreamos una celda completa por cada minuto transcurrido,
    // de izquierda a derecha y de arriba abajo.
    // El minuto actual aún no se rellena: su celda
    // queda identificada mediante el pulso.

    fill(colorHora);

    for (let minuto = 0; minuto < minutoActual; minuto++) {

        let columna = minuto % columnas;
        let fila = floor(minuto / columnas);

        rect(
            x + columna * anchoCelda,
            y + fila * altoCelda,
            anchoCelda,
            altoCelda
        );

    }

    // El borde verde identifica la hora actual.

    noFill();
    stroke(bordeActual);
    strokeWeight(1.5);
    rect(x, y, ancho, alto);

    dibujarPulso(
        x,
        y,
        anchoCelda,
        altoCelda,
        columnas,
        minutoActual,
        segundoActual
    );

}


// ------------------------------------------------------------
// PULSO DE LOS SEGUNDOS
// ------------------------------------------------------------

function dibujarPulso(
    x,
    y,
    anchoCelda,
    altoCelda,
    columnas,
    minutoActual,
    segundoActual
) {

    // Localizamos la columna y la fila del minuto actual.
    // La primera celda corresponde al minuto 00.

    let columna = minutoActual % columnas;
    let fila = floor(minutoActual / columnas);

    // Situamos el pulso en el centro de esa celda,
    // no en el centro de toda la pieza.

    let centroX = x + (columna + 0.5) * anchoCelda;
    let centroY = y + (fila + 0.5) * altoCelda;

    // Reducimos el tamaño en las piezas más pequeñas para que
    // el pulso permanezca dentro de su celda.

    let tamanoExterior = min(9, anchoCelda * 0.8, altoCelda * 0.8);
    let tamanoMedio = tamanoExterior * 0.67;
    let tamanoInterior = tamanoExterior * 0.33;

    rectMode(CENTER);

    // En los segundos pares mostramos un cuadrado exterior.
    // Así conservamos la variación visual del pulso cada segundo.

    if (segundoActual % 2 == 0) {

        noFill();
        stroke(255, 255, 255, 140);
        strokeWeight(1);
        rect(centroX, centroY, tamanoExterior, tamanoExterior);

    }

    noFill();
    stroke(255, 255, 255, 220);
    strokeWeight(1);
    rect(centroX, centroY, tamanoMedio, tamanoMedio);

    noStroke();
    fill(255, 255, 255, 230);
    rect(centroX, centroY, tamanoInterior, tamanoInterior);

    rectMode(CORNER);

}


// ------------------------------------------------------------
// CABECERA DE LA AGENDA
// ------------------------------------------------------------

function mostrarHoraDigital(
    horaActual,
    minutoActual,
    segundoActual
) {

    let horaTexto = nf(horaActual, 2) + ':' +
                    nf(minutoActual, 2) + ':' +
                    nf(segundoActual, 2);

    document.getElementById('reloj').textContent = horaTexto;

}


// Preparamos la fecha para mostrarla en español.

function fechaEnTexto(fecha) {

    return diasSemana[fecha.getDay()] + ', ' +
           fecha.getDate() + ' de ' +
           meses[fecha.getMonth()];

}

function mostrarFecha() {

    document.getElementById('fecha').textContent =
        fechaEnTexto(fechaSeleccionada);

}


// Si la cita no tiene hora de fin, mostramos solo la de inicio.

function horarioEnTexto(cita) {

    let horario = cita.horaInicio;

    if (cita.horaFin != '') {

        horario = horario + ' — ' + cita.horaFin;

    }

    return horario;

}

function mostrarHorarioCita(cita) {

    document.getElementById('horaCita').textContent =
        horarioEnTexto(cita);

}


// ------------------------------------------------------------
// NAVEGACIÓN ENTRE DÍAS
// ------------------------------------------------------------

function prepararNavegacion() {

    let botonAnterior = document.getElementById('diaAnterior');
    let botonSiguiente = document.getElementById('diaSiguiente');

    botonAnterior.addEventListener('click', function() {

        cambiarDia(-1);

    });

    botonSiguiente.addEventListener('click', function() {

        cambiarDia(1);

    });

}


// Actualizamos la fecha, la lista y los iconos del mosaico.

function cambiarDia(cantidad) {

    fechaSeleccionada.setDate(
        fechaSeleccionada.getDate() + cantidad
    );

    citaSeleccionada = null;

    mostrarFecha();

    document.getElementById('horaCita').textContent = '';

    mostrarCitas();

}


// ------------------------------------------------------------
// NAVEGACIÓN ENTRE PANTALLAS
// ------------------------------------------------------------

// Ocultamos las pantallas que no estamos utilizando.

function mostrarPantalla(idPantalla) {

    document.getElementById('agenda').hidden =
        idPantalla != 'agenda';

    document.getElementById('pantallaNuevaCita').hidden =
        idPantalla != 'pantallaNuevaCita';

    document.getElementById('pantallaDetalleCita').hidden =
        idPantalla != 'pantallaDetalleCita';

}


// ------------------------------------------------------------
// FORMULARIO DE NUEVA CITA Y EDICIÓN
// ------------------------------------------------------------

function prepararFormulario() {

    document.getElementById('nuevaCita')
        .addEventListener('click', abrirFormulario);

    document.getElementById('volverAgenda')
        .addEventListener('click', cerrarFormulario);

    document.getElementById('cerrarNuevaCita')
        .addEventListener('click', cerrarFormulario);

    document.getElementById('cancelarNuevaCita')
        .addEventListener('click', cerrarFormulario);

    // Evitamos que el formulario recargue la página
    // y ejecutamos nuestro procedimiento de guardado.

    document.getElementById('formularioCita')
        .addEventListener('submit', function(evento) {

            evento.preventDefault();

            guardarCita();

        });

}


// Al abrir una cita nueva restablecemos todos los campos
// y asignamos la fecha que estamos consultando.

function abrirFormulario() {

    citaEnEdicion = null;

    document.getElementById('formularioCita').reset();

    document.getElementById('tituloFormulario').textContent =
        'Nueva cita';

    document.getElementById('guardarCita').textContent =
        'Guardar cita';

    document.getElementById('fechaCita').value =
        prepararFechaFormulario(fechaSeleccionada);

    ocultarErrorFormulario();

    mostrarPantalla('pantallaNuevaCita');

}


// Si cerramos el formulario durante una edición,
// regresamos al detalle sin guardar los cambios.

function cerrarFormulario() {

    cerrarSelector();

    let idEdicion = citaEnEdicion;

    citaEnEdicion = null;

    if (idEdicion != null) {

        let cita = buscarCita(idEdicion);

        if (cita != null) {

            mostrarDetalleCita(cita);

            return;

        }

    }

    mostrarPantalla('agenda');

}


// Convertimos una fecha al formato año-mes-día.

function prepararFechaFormulario(fecha) {

    let anio = fecha.getFullYear();

    let mes = nf(fecha.getMonth() + 1, 2);

    let dia = nf(fecha.getDate(), 2);

    return anio + '-' + mes + '-' + dia;

}


// Recuperamos un objeto Date a partir de una fecha guardada.

function convertirFecha(fecha) {

    let partes = fecha.split('-');

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}


// ------------------------------------------------------------
// SELECTORES DE FECHA Y HORA
// ------------------------------------------------------------

// Utilizamos botones propios para abrir los selectores
// dentro de la ventana de la extensión.

function prepararSelectores() {

    crearBotonSelector(
        'fechaCita',
        '▦',
        'Seleccionar fecha',
        abrirCalendario
    );

    crearBotonSelector(
        'horaInicio',
        '◷',
        'Seleccionar hora de inicio',
        function() {

            abrirSelectorHora('horaInicio');

        }
    );

    crearBotonSelector(
        'horaFin',
        '◷',
        'Seleccionar hora de fin',
        function() {

            abrirSelectorHora('horaFin');

        }
    );

    // La tecla Escape permite cerrar el selector abierto.

    document.addEventListener('keydown', function(evento) {

        if (evento.key == 'Escape' && ventanaSelector != null) {

            evento.preventDefault();
            evento.stopPropagation();

            cerrarSelector();

        }

    });

}


// Colocamos un botón sobre el icono original del campo.

function crearBotonSelector(idCampo, simbolo, nombre, accion) {

    let campo = document.getElementById(idCampo);

    let contenedor = document.createElement('div');

    contenedor.className = 'contenedorSelector';

    campo.parentNode.insertBefore(contenedor, campo);

    contenedor.appendChild(campo);

    let boton = document.createElement('button');

    boton.type = 'button';

    boton.className = 'botonSelector';

    boton.textContent = simbolo;

    boton.setAttribute('aria-label', nombre);

    boton.addEventListener('click', accion);

    contenedor.appendChild(boton);

}


// ------------------------------------------------------------
// VENTANA DE LOS SELECTORES
// ------------------------------------------------------------

// Creamos una ventana sobre la pantalla que estamos utilizando.
// La reutilizamos también para las confirmaciones.

function crearVentanaSelector(titulo) {

    cerrarSelector();

    ventanaSelector = document.createElement('div');

    ventanaSelector.className = 'ventanaSelector';

    let panel = document.createElement('div');

    panel.className = 'panelSelector';

    panel.setAttribute('role', 'dialog');

    panel.setAttribute('aria-modal', 'true');

    panel.setAttribute('aria-label', titulo);

    let cabecera = document.createElement('div');

    cabecera.className = 'cabeceraSelector';

    let encabezado = document.createElement('h2');

    encabezado.textContent = titulo;

    let botonCerrar = document.createElement('button');

    botonCerrar.type = 'button';

    botonCerrar.className = 'cerrarSelector';

    botonCerrar.textContent = '×';

    botonCerrar.setAttribute('aria-label', 'Cerrar ventana');

    botonCerrar.addEventListener('click', cerrarSelector);

    cabecera.appendChild(encabezado);
    cabecera.appendChild(botonCerrar);

    panel.appendChild(cabecera);

    ventanaSelector.appendChild(panel);

    document.body.appendChild(ventanaSelector);

    // Cerramos la ventana si pulsamos fuera de su contenido.

    ventanaSelector.addEventListener('click', function(evento) {

        if (evento.target == ventanaSelector) {

            cerrarSelector();

        }

    });

    botonCerrar.focus();

    return panel;

}

function cerrarSelector() {

    if (ventanaSelector != null) {

        ventanaSelector.remove();

        ventanaSelector = null;

    }

}


// Botones utilizados dentro del calendario y selector horario.

function crearBotonOpcion(texto, seleccionado) {

    let boton = document.createElement('button');

    boton.type = 'button';

    boton.className = 'botonOpcion';

    boton.textContent = texto;

    if (seleccionado) {

        boton.classList.add('elegido');

    }

    return boton;

}


// ------------------------------------------------------------
// CALENDARIO MENSUAL
// ------------------------------------------------------------

function abrirCalendario() {

    let fecha = document.getElementById('fechaCita').value;

    let fechaCampo = fechaSeleccionada;

    if (fecha != '') {

        fechaCampo = convertirFecha(fecha);

    }

    mesCalendario = new Date(
        fechaCampo.getFullYear(),
        fechaCampo.getMonth(),
        1
    );

    dibujarCalendario();

}


// Construimos el calendario en función del mes elegido.

function dibujarCalendario() {

    let panel = crearVentanaSelector('Seleccionar fecha');

    let anio = mesCalendario.getFullYear();

    let mes = mesCalendario.getMonth();

    // Nombre del mes y flechas de navegación.

    let navegacion = document.createElement('div');

    navegacion.className = 'navegacionCalendario';

    let anterior = crearBotonOpcion('❮', false);

    anterior.setAttribute('aria-label', 'Mes anterior');

    anterior.addEventListener('click', function() {

        cambiarMes(-1);

    });

    let nombreMes = document.createElement('strong');

    nombreMes.className = 'nombreMes';

    nombreMes.textContent = meses[mes] + ' ' + anio;

    let siguiente = crearBotonOpcion('❯', false);

    siguiente.setAttribute('aria-label', 'Mes siguiente');

    siguiente.addEventListener('click', function() {

        cambiarMes(1);

    });

    navegacion.appendChild(anterior);
    navegacion.appendChild(nombreMes);
    navegacion.appendChild(siguiente);

    panel.appendChild(navegacion);

    // Organizamos los días del mes en siete columnas.

    let calendario = document.createElement('div');

    calendario.className = 'calendario';

    let nombresDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    for (let i = 0; i < nombresDias.length; i++) {

        let nombreDia = document.createElement('span');

        nombreDia.className = 'nombreDiaCalendario';

        nombreDia.textContent = nombresDias[i];

        calendario.appendChild(nombreDia);

    }

    // Calculamos el día de la semana en el que comienza el mes.
    // Adaptamos el resultado para que la semana empiece en lunes.

    let primerDia = new Date(anio, mes, 1).getDay();

    primerDia = (primerDia + 6) % 7;

    for (let i = 0; i < primerDia; i++) {

        calendario.appendChild(
            document.createElement('span')
        );

    }

    // El día cero del mes siguiente corresponde
    // al último día del mes actual.

    let totalDias = new Date(anio, mes + 1, 0).getDate();

    let fechaCampo = document.getElementById('fechaCita').value;

    for (let dia = 1; dia <= totalDias; dia++) {

        let fechaDia = new Date(anio, mes, dia);

        let fechaTexto = prepararFechaFormulario(fechaDia);

        let botonDia = crearBotonOpcion(
            dia,
            fechaTexto == fechaCampo
        );

        botonDia.setAttribute(
            'aria-label',
            dia + ' de ' + meses[mes] + ' de ' + anio
        );

        botonDia.addEventListener('click', function() {

            document.getElementById('fechaCita').value =
                fechaTexto;

            cerrarSelector();

        });

        calendario.appendChild(botonDia);

    }

    panel.appendChild(calendario);

}

function cambiarMes(cantidad) {

    mesCalendario.setMonth(
        mesCalendario.getMonth() + cantidad
    );

    dibujarCalendario();

}


// ------------------------------------------------------------
// SELECTOR DE HORAS Y MINUTOS
// ------------------------------------------------------------

function abrirSelectorHora(idCampo) {

    campoHorario = document.getElementById(idCampo);

    let valor = campoHorario.value;

    // Recuperamos la hora que ya aparece en el formulario.

    if (valor != '') {

        let partes = valor.split(':');

        horaElegida = Number(partes[0]);

        minutoElegido = Number(partes[1]);

    } else {

        horaElegida = hour();

        minutoElegido = 0;

    }

    dibujarSelectorHora();

}

function dibujarSelectorHora() {

    let panel = crearVentanaSelector('Seleccionar hora');

    let horaMostrada = document.createElement('div');

    horaMostrada.className = 'horaMostrada';

    horaMostrada.textContent =
        nf(horaElegida, 2) + ':' +
        nf(minutoElegido, 2);

    panel.appendChild(horaMostrada);

    // Creamos dos columnas desplazables.

    let columnas = document.createElement('div');

    columnas.className = 'columnasHorario';

    let columnaHoras = crearColumnaHorario(
        'Horas',
        24,
        horaElegida
    );

    let columnaMinutos = crearColumnaHorario(
        'Minutos',
        60,
        minutoElegido
    );

    columnas.appendChild(columnaHoras);

    columnas.appendChild(columnaMinutos);

    panel.appendChild(columnas);

    // Trasladamos la hora al formulario al pulsar Aceptar.

    let botonAceptar = document.createElement('button');

    botonAceptar.type = 'button';

    botonAceptar.className = 'aceptarHorario';

    botonAceptar.textContent = 'Aceptar';

    botonAceptar.addEventListener('click', function() {

        campoHorario.value =
            nf(horaElegida, 2) + ':' +
            nf(minutoElegido, 2);

        cerrarSelector();

    });

    panel.appendChild(botonAceptar);

    // Situamos ambas listas en los valores seleccionados.

    let listaHoras = columnaHoras.querySelector('.listaHorario');

    let listaMinutos = columnaMinutos.querySelector('.listaHorario');

    listaHoras.scrollTop = max(0, horaElegida * 33 - 66);

    listaMinutos.scrollTop = max(0, minutoElegido * 33 - 66);

}


// Generamos los botones correspondientes a las 24 horas
// o a los 60 minutos.

function crearColumnaHorario(nombre, cantidad, valorActual) {

    let columna = document.createElement('div');

    columna.className = 'columnaHorario';

    let etiqueta = document.createElement('div');

    etiqueta.className = 'etiquetaHorario';

    etiqueta.textContent = nombre;

    columna.appendChild(etiqueta);

    let lista = document.createElement('div');

    lista.className = 'listaHorario';

    for (let i = 0; i < cantidad; i++) {

        let boton = crearBotonOpcion(
            nf(i, 2),
            i == valorActual
        );

        boton.addEventListener('click', function() {

            if (nombre == 'Horas') {

                horaElegida = i;

            } else {

                minutoElegido = i;

            }

            dibujarSelectorHora();

        });

        lista.appendChild(boton);

    }

    columna.appendChild(lista);

    return columna;

}


// ------------------------------------------------------------
// VALIDACIÓN Y GUARDADO DE CITAS
// ------------------------------------------------------------

function guardarCita() {

    ocultarErrorFormulario();

    // Recogemos los datos introducidos.

    let titulo =
        document.getElementById('tituloCita').value.trim();

    let fecha =
        document.getElementById('fechaCita').value;

    let horaInicio =
        document.getElementById('horaInicio').value;

    let horaFin =
        document.getElementById('horaFin').value;

    let categoria =
        document.querySelector('input[name="categoria"]:checked').value;

    let notas =
        document.getElementById('notasCita').value.trim();

    // Comprobamos los campos obligatorios.

    if (titulo == '') {

        mostrarErrorFormulario('Introduce un título para la cita.');

        return;

    }

    if (fecha == '') {

        mostrarErrorFormulario('Selecciona una fecha.');

        return;

    }

    if (horaInicio == '') {

        mostrarErrorFormulario('Indica la hora de inicio.');

        return;

    }

    if (document.getElementById('horaFin').validity.badInput) {

        mostrarErrorFormulario('Introduce una hora de fin válida.');

        return;

    }

    // La hora de fin es opcional. Si se introduce,
    // debe ser posterior a la hora de inicio.

    if (horaFin != '' && horaFin <= horaInicio) {

        mostrarErrorFormulario(
            'La hora de fin debe ser posterior a la de inicio.'
        );

        return;

    }

    // Creamos un objeto con los datos de la cita.

    let datos = {
        id: Date.now(),
        titulo: titulo,
        fecha: fecha,
        horaInicio: horaInicio,
        horaFin: horaFin,
        categoria: categoria,
        notas: notas,
        estado: 'pendiente'
    };

    let estamosEditando = citaEnEdicion != null;

    // Distinguimos entre una cita nueva y una que ya existe.

    if (estamosEditando) {

        if (!actualizarCita(citaEnEdicion, datos)) {

            mostrarErrorFormulario(
                'No se han podido guardar los cambios.'
            );

            return;

        }

    } else {

        citas.push(datos);

        if (!guardarCitas()) {

            citas.pop();

            mostrarErrorFormulario(
                'No se ha podido guardar la cita.'
            );

            return;

        }

    }

    // Si hemos modificado la fecha, mostramos el día
    // correspondiente a la cita después de guardarla.

    fechaSeleccionada = convertirFecha(fecha);

    citaEnEdicion = null;

    citaSeleccionada = datos.id;

    mostrarFecha();

    mostrarHorarioCita(datos);

    mostrarCitas();

    cerrarSelector();

    if (estamosEditando) {

        mostrarDetalleCita(datos);

    } else {

        mostrarPantalla('agenda');

    }

}


// ------------------------------------------------------------
// MENSAJES DE VALIDACIÓN
// ------------------------------------------------------------

function mostrarErrorFormulario(mensaje) {

    let aviso = document.getElementById('errorFormulario');

    aviso.textContent = mensaje;

    aviso.hidden = false;

}

function ocultarErrorFormulario() {

    document.getElementById('errorFormulario').hidden = true;

}

function mostrarErrorDetalle(mensaje) {

    let aviso = document.getElementById('errorDetalle');

    aviso.textContent = mensaje;

    aviso.hidden = false;

}


// ------------------------------------------------------------
// ALMACENAMIENTO LOCAL
// ------------------------------------------------------------

// Recuperamos las citas guardadas al abrir la extensión.

function cargarCitas() {

    let citasGuardadas = getItem('citasAgenda');

    if (Array.isArray(citasGuardadas)) {

        citas = citasGuardadas;

    }

}


// Guardamos el array completo con storeItem() de p5.js.

function guardarCitas() {

    try {

        storeItem('citasAgenda', citas);

        return true;

    } catch (error) {

        console.error('No se han podido guardar las citas:', error);

        return false;

    }

}


// Buscamos una cita mediante su identificador.

function buscarCita(id) {

    for (let i = 0; i < citas.length; i++) {

        if (citas[i].id == id) {

            return citas[i];

        }

    }

    return null;

}


// ------------------------------------------------------------
// CITAS DEL DÍA
// ------------------------------------------------------------

function obtenerCitasDia() {

    let fecha = prepararFechaFormulario(fechaSeleccionada);

    let citasDia = [];

    for (let i = 0; i < citas.length; i++) {

        if (citas[i].fecha == fecha) {

            citasDia.push(citas[i]);

        }

    }

    // Ordenamos las citas por su hora de inicio.

    citasDia.sort(function(a, b) {

        if (a.horaInicio < b.horaInicio) {

            return -1;

        }

        if (a.horaInicio > b.horaInicio) {

            return 1;

        }

        return 0;

    });

    return citasDia;

}


// Actualizamos la lista, los iconos y el progreso diario.

function mostrarCitas() {

    let lista = document.getElementById('listaCitas');

    let citasDia = obtenerCitasDia();

    lista.textContent = '';

    if (citasDia.length == 0) {

        let mensaje = document.createElement('p');

        mensaje.id = 'agendaVacia';

        mensaje.textContent =
            'No hay citas programadas para este día.';

        lista.appendChild(mensaje);

    } else {

        for (let i = 0; i < citasDia.length; i++) {

            lista.appendChild(
                crearTarjetaCita(citasDia[i])
            );

        }

    }

    mostrarIconosMosaico(citasDia);

    actualizarSeleccion();

    actualizarContador(citasDia);

}


// ------------------------------------------------------------
// TARJETAS DE LAS CITAS
// ------------------------------------------------------------

function crearTarjetaCita(cita) {

    let tarjeta = document.createElement('div');

    tarjeta.className = 'cita';

    tarjeta.dataset.id = cita.id;

    // Dentro de la tarjeta distinguimos la zona de selección
    // del botón que abre la pantalla de detalle.

    let seleccion = document.createElement('button');

    seleccion.type = 'button';

    seleccion.className = 'seleccionarTarjeta';

    let icono = document.createElement('span');

    icono.className = 'iconoCategoria iconoCita ' +
                      iconosCategorias[cita.categoria];

    icono.setAttribute('aria-hidden', 'true');

    let hora = document.createElement('span');

    hora.className = 'horaCita';

    hora.textContent = cita.horaInicio;

    let titulo = document.createElement('span');

    titulo.className = 'tituloCita';

    titulo.textContent = cita.titulo;

    seleccion.appendChild(icono);
    seleccion.appendChild(hora);
    seleccion.appendChild(titulo);

    seleccion.addEventListener('click', function() {

        seleccionarCita(cita, false);

    });

    tarjeta.appendChild(seleccion);

    // Las citas completadas aparecen tachadas
    // y llevan una marca de verificación.

    if (cita.estado == 'completada') {

        tarjeta.classList.add('completada');

        let marca = document.createElement('span');

        marca.className = 'marcaCompletada';

        marca.textContent = '✓';

        marca.setAttribute('aria-label', 'Cita completada');

        tarjeta.appendChild(marca);

    }

    // Las canceladas permanecen visibles en la agenda.

    if (cita.estado == 'cancelada') {

        tarjeta.classList.add('cancelada');

        let estado = document.createElement('span');

        estado.className = 'marcaCancelada';

        estado.textContent = 'Cancelada';

        tarjeta.appendChild(estado);

    }

    // Añadimos una flecha para consultar los datos de la cita.

    let verDetalle = document.createElement('button');

    verDetalle.type = 'button';

    verDetalle.className = 'verDetalle';

    verDetalle.textContent = '❯';

    verDetalle.title = 'Ver detalle';

    verDetalle.setAttribute(
        'aria-label',
        'Consultar ' + cita.titulo
    );

    verDetalle.addEventListener('click', function() {

        mostrarDetalleCita(cita);

    });

    tarjeta.appendChild(verDetalle);

    return tarjeta;

}


// ------------------------------------------------------------
// ICONOS DE LAS CITAS EN EL MOSAICO
// ------------------------------------------------------------

// Creamos una capa transparente sobre el canvas.

function prepararIconosMosaico() {

    let mosaico = document.getElementById('mosaico');

    capaIconos = document.createElement('div');

    capaIconos.id = 'capaIconos';

    mosaico.appendChild(capaIconos);

}


// Obtenemos la hora en la que comienza una cita.

function obtenerHoraCita(cita) {

    let partes = cita.horaInicio.split(':');

    return Number(partes[0]);

}


// Agrupamos las citas que comienzan dentro de una misma hora.

function mostrarIconosMosaico(citasDia) {

    capaIconos.textContent = '';

    for (let hora = 0; hora < piezas.length; hora++) {

        let citasHora = [];

        for (let i = 0; i < citasDia.length; i++) {

            if (obtenerHoraCita(citasDia[i]) == hora) {

                citasHora.push(citasDia[i]);

            }

        }

        if (citasHora.length > 0) {

            crearGrupoIconos(hora, citasHora);

        }

    }

}


// Colocamos los iconos en la esquina inferior izquierda
// de su pieza. Si hay varios, se sitúan uno encima de otro.

function crearGrupoIconos(hora, citasHora) {

    let x = pantallaX(piezas[hora][0]);

    let y = pantallaY(piezas[hora][1]);

    let alto = medida(piezas[hora][3]);

    let grupo = document.createElement('div');

    grupo.className = 'grupoIconos';

    grupo.style.left = (x + 4) + 'px';

    grupo.style.bottom =
        (altoMosaico - y - alto + 4) + 'px';

    grupo.style.maxHeight = (alto - 8) + 'px';

    grupo.style.maxWidth =
        (medida(piezas[hora][2]) - 8) + 'px';

    for (let i = 0; i < citasHora.length; i++) {

        grupo.appendChild(
            crearIconoMosaico(citasHora[i])
        );

    }

    capaIconos.appendChild(grupo);

}


// Cada icono es un botón que permite seleccionar su cita.

function crearIconoMosaico(cita) {

    let boton = document.createElement('button');

    boton.type = 'button';

    boton.className = 'botonIconoMosaico';

    boton.dataset.id = cita.id;

    boton.title = cita.horaInicio + ' — ' + cita.titulo;

    boton.setAttribute(
        'aria-label',
        cita.horaInicio + ' ' + cita.titulo
    );

    let icono = document.createElement('span');

    icono.className = 'iconoCategoria ' +
                      iconosCategorias[cita.categoria];

    icono.setAttribute('aria-hidden', 'true');

    boton.appendChild(icono);

    // Reducimos la intensidad según el estado de la cita.

    if (cita.estado == 'completada') {

        boton.classList.add('completada');

    }

    if (cita.estado == 'cancelada') {

        boton.classList.add('cancelada');

    }

    boton.addEventListener('click', function() {

        seleccionarCita(cita, true);

    });

    return boton;

}


// ------------------------------------------------------------
// INTERACCIÓN CON LAS PIEZAS DEL MOSAICO
// ------------------------------------------------------------

function prepararInteraccionMosaico() {

    let lienzo = document.querySelector('#mosaico canvas');

    lienzo.addEventListener('click', function(evento) {

        let limites = lienzo.getBoundingClientRect();

        let x = (evento.clientX - limites.left) *
                anchoMosaico / limites.width;

        let y = (evento.clientY - limites.top) *
                altoMosaico / limites.height;

        let hora = obtenerPiezaPulsada(x, y);

        if (hora != -1) {

            seleccionarCitaHora(hora);

        }

    });

}


// Comprobamos primero la pieza activa, ya que se dibuja
// por encima de las demás.

function obtenerPiezaPulsada(x, y) {

    let horaActual = hour();

    if (puntoDentroPieza(x, y, horaActual)) {

        return horaActual;

    }

    // Recorremos las otras piezas en orden inverso
    // para respetar su orden de dibujo.

    for (let i = piezas.length - 1; i >= 0; i--) {

        if (puntoDentroPieza(x, y, i)) {

            return i;

        }

    }

    return -1;

}


// Comprobamos si el punto pulsado pertenece al rectángulo.

function puntoDentroPieza(x, y, hora) {

    let piezaX = pantallaX(piezas[hora][0]);

    let piezaY = pantallaY(piezas[hora][1]);

    let ancho = medida(piezas[hora][2]);

    let alto = medida(piezas[hora][3]);

    return (
        x >= piezaX &&
        x <= piezaX + ancho &&
        y >= piezaY &&
        y <= piezaY + alto
    );

}


// Si hay varias citas en una hora, podemos recorrerlas
// pulsando sucesivamente sobre la misma pieza.

function seleccionarCitaHora(hora) {

    let citasDia = obtenerCitasDia();

    let citasHora = [];

    for (let i = 0; i < citasDia.length; i++) {

        if (obtenerHoraCita(citasDia[i]) == hora) {

            citasHora.push(citasDia[i]);

        }

    }

    if (citasHora.length == 0) {

        return;

    }

    let siguiente = 0;

    for (let i = 0; i < citasHora.length; i++) {

        if (citasHora[i].id == citaSeleccionada) {

            siguiente = (i + 1) % citasHora.length;

        }

    }

    seleccionarCita(citasHora[siguiente], true);

}


// ------------------------------------------------------------
// SELECCIÓN DE CITAS
// ------------------------------------------------------------

function seleccionarCita(cita, desdeMosaico) {

    citaSeleccionada = cita.id;

    mostrarHorarioCita(cita);

    actualizarSeleccion();

    // Desplazamos la lista hasta la tarjeta seleccionada
    // cuando la cita se pulsa desde el mosaico.

    if (desdeMosaico) {

        let tarjetas = document.querySelectorAll('.cita');

        for (let i = 0; i < tarjetas.length; i++) {

            if (tarjetas[i].dataset.id == citaSeleccionada) {

                tarjetas[i].scrollIntoView({
                    block: 'nearest'
                });

            }

        }

    }

}


// Destacamos la tarjeta y el icono de la cita seleccionada.

function actualizarSeleccion() {

    let tarjetas = document.querySelectorAll('.cita');

    for (let i = 0; i < tarjetas.length; i++) {

        let boton = tarjetas[i].querySelector('.seleccionarTarjeta');

        if (tarjetas[i].dataset.id == citaSeleccionada) {

            tarjetas[i].classList.add('seleccionada');

            boton.setAttribute('aria-pressed', 'true');

        } else {

            tarjetas[i].classList.remove('seleccionada');

            boton.setAttribute('aria-pressed', 'false');

        }

    }

    let botones = document.querySelectorAll('.botonIconoMosaico');

    for (let i = 0; i < botones.length; i++) {

        if (botones[i].dataset.id == citaSeleccionada) {

            botones[i].classList.add('seleccionado');

            botones[i].setAttribute('aria-pressed', 'true');

        } else {

            botones[i].classList.remove('seleccionado');

            botones[i].setAttribute('aria-pressed', 'false');

        }

    }

}


// ------------------------------------------------------------
// DETALLE DE CITA
// ------------------------------------------------------------

// Asociamos los botones de la pantalla de detalle
// con sus correspondientes acciones.

function prepararDetalle() {

    document.getElementById('volverDetalle')
        .addEventListener('click', cerrarDetalleCita);

    document.getElementById('editarCita')
        .addEventListener('click', abrirEdicion);

    document.getElementById('completarCita')
        .addEventListener('click', completarCita);

    document.getElementById('cancelarCita')
        .addEventListener('click', confirmarCancelacion);

    document.getElementById('eliminarCita')
        .addEventListener('click', confirmarEliminacion);

}


// Recuperamos los datos y los mostramos en la pantalla de detalle.

function mostrarDetalleCita(cita) {

    seleccionarCita(cita, false);

    document.getElementById('errorDetalle').hidden = true;

    document.getElementById('nombreDetalle').textContent =
        cita.titulo;

    document.getElementById('categoriaDetalle').textContent =
        cita.categoria;

    let icono = document.getElementById('iconoDetalle');

    icono.className = 'iconoCategoria ' +
                      iconosCategorias[cita.categoria];

    document.getElementById('fechaDetalle').textContent =
        fechaEnTexto(convertirFecha(cita.fecha));

    document.getElementById('horarioDetalle').textContent =
        horarioEnTexto(cita);

    // Adaptamos el texto y el estilo al estado de la cita.

    let estado = 'Pendiente';

    let etiquetaEstado = document.getElementById('estadoDetalle');

    etiquetaEstado.className = '';

    if (cita.estado == 'completada') {

        estado = 'Completada';

        etiquetaEstado.classList.add('completada');

    } else if (cita.estado == 'cancelada') {

        estado = 'Cancelada';

        etiquetaEstado.classList.add('cancelada');

    }

    etiquetaEstado.textContent = estado;

    // Mostramos las notas, si la cita tiene alguna.

    let notas = cita.notas;

    if (notas == '') {

        notas = 'Sin notas adicionales.';

    }

    document.getElementById('notasDetalle').textContent = notas;

    actualizarBotonesDetalle(cita);

    mostrarPantalla('pantallaDetalleCita');

}


// Algunos botones dejan de estar disponibles
// cuando una cita cambia de estado.

function actualizarBotonesDetalle(cita) {

    let botonCompletar = document.getElementById('completarCita');

    let botonCancelar = document.getElementById('cancelarCita');

    botonCompletar.disabled = cita.estado != 'pendiente';

    botonCancelar.disabled = cita.estado == 'cancelada';

    if (cita.estado == 'completada') {

        botonCompletar.textContent = '✓ Cita completada';

    } else if (cita.estado == 'cancelada') {

        botonCompletar.textContent = 'Cita cancelada';

    } else {

        botonCompletar.textContent = 'Completar cita';

    }

    if (cita.estado == 'cancelada') {

        botonCancelar.textContent = 'Cita cancelada';

    } else {

        botonCancelar.textContent = 'Cancelar cita';

    }

}

function cerrarDetalleCita() {

    mostrarPantalla('agenda');

}


// ------------------------------------------------------------
// EDICIÓN DE CITAS
// ------------------------------------------------------------

// Reutilizamos el formulario de nueva cita y recuperamos
// los datos de la cita que vamos a modificar.

function abrirEdicion() {

    let cita = buscarCita(citaSeleccionada);

    if (cita == null) {

        return;

    }

    abrirFormulario();

    citaEnEdicion = cita.id;

    document.getElementById('tituloFormulario').textContent =
        'Editar cita';

    document.getElementById('guardarCita').textContent =
        'Guardar cambios';

    document.getElementById('tituloCita').value = cita.titulo;

    document.getElementById('fechaCita').value = cita.fecha;

    document.getElementById('horaInicio').value = cita.horaInicio;

    document.getElementById('horaFin').value = cita.horaFin;

    document.getElementById('notasCita').value = cita.notas;

    // Recuperamos la categoría que tenía asignada.

    let categorias = document.querySelectorAll(
        'input[name="categoria"]'
    );

    for (let i = 0; i < categorias.length; i++) {

        categorias[i].checked =
            categorias[i].value == cita.categoria;

    }

}


// Sustituimos los datos de la cita existente conservando
// su identificador y su estado.

function actualizarCita(id, datos) {

    for (let i = 0; i < citas.length; i++) {

        if (citas[i].id == id) {

            let citaAnterior = citas[i];

            datos.id = citaAnterior.id;

            datos.estado = citaAnterior.estado;

            citas[i] = datos;

            // Recuperamos los datos anteriores si falla el guardado.

            if (!guardarCitas()) {

                citas[i] = citaAnterior;

                return false;

            }

            return true;

        }

    }

    return false;

}


// ------------------------------------------------------------
// COMPLETAR CITAS
// ------------------------------------------------------------

function completarCita() {

    let cita = buscarCita(citaSeleccionada);

    if (cita == null || cita.estado != 'pendiente') {

        return;

    }

    cita.estado = 'completada';

    if (!guardarCitas()) {

        cita.estado = 'pendiente';

        mostrarErrorDetalle(
            'No se ha podido completar la cita.'
        );

        return;

    }

    mostrarCitas();

    mostrarDetalleCita(cita);

}


// ------------------------------------------------------------
// CANCELACIÓN DE CITAS
// ------------------------------------------------------------

// Cambiamos el estado de la cita sin eliminar sus datos.

function cancelarCita(id) {

    let cita = buscarCita(id);

    if (cita == null || cita.estado == 'cancelada') {

        return false;

    }

    let estadoAnterior = cita.estado;

    cita.estado = 'cancelada';

    if (!guardarCitas()) {

        cita.estado = estadoAnterior;

        return false;

    }

    mostrarCitas();

    mostrarDetalleCita(cita);

    return true;

}


// ------------------------------------------------------------
// ELIMINACIÓN DE CITAS
// ------------------------------------------------------------

// Eliminamos del array la cita correspondiente al identificador.

function eliminarCita(id) {

    for (let i = 0; i < citas.length; i++) {

        if (citas[i].id == id) {

            let citaEliminada = citas[i];

            citas.splice(i, 1);

            // Si falla el guardado, recuperamos la cita.

            if (!guardarCitas()) {

                citas.splice(i, 0, citaEliminada);

                return false;

            }

            citaSeleccionada = null;

            document.getElementById('horaCita').textContent = '';

            mostrarCitas();

            cerrarDetalleCita();

            return true;

        }

    }

    return false;

}


// ------------------------------------------------------------
// VENTANAS DE CONFIRMACIÓN
// ------------------------------------------------------------

// Reutilizamos la misma estructura para las dos acciones.

function mostrarConfirmacion(titulo, mensaje, textoBoton, accion) {

    let panel = crearVentanaSelector(titulo);

    let texto = document.createElement('p');

    texto.className = 'mensajeConfirmacion';

    texto.textContent = mensaje;

    panel.appendChild(texto);

    let botones = document.createElement('div');

    botones.className = 'botonesConfirmacion';

    let volver = document.createElement('button');

    volver.type = 'button';

    volver.textContent = 'Volver';

    volver.className = 'botonSecundario';

    volver.addEventListener('click', cerrarSelector);

    let confirmar = document.createElement('button');

    confirmar.type = 'button';

    confirmar.textContent = textoBoton;

    confirmar.className = 'botonPrincipal';

    confirmar.addEventListener('click', function() {

        if (accion()) {

            cerrarSelector();

        } else {

            texto.textContent =
                'No se han podido guardar los cambios.';

        }

    });

    botones.appendChild(volver);

    botones.appendChild(confirmar);

    panel.appendChild(botones);

}


// Conservamos el identificador de la cita al abrir
// la ventana de confirmación.

function confirmarCancelacion() {

    let id = citaSeleccionada;

    mostrarConfirmacion(
        '¿Cancelar cita?',
        'La cita permanecerá en la agenda con el estado «Cancelada».',
        'Cancelar cita',
        function() {

            return cancelarCita(id);

        }
    );

}

function confirmarEliminacion() {

    let id = citaSeleccionada;

    mostrarConfirmacion(
        '¿Eliminar cita?',
        'La cita se eliminará definitivamente. Esta acción no se puede deshacer.',
        'Eliminar cita',
        function() {

            return eliminarCita(id);

        }
    );

}


// ------------------------------------------------------------
// PROGRESO DIARIO
// ------------------------------------------------------------

// Calculamos el porcentaje de citas completadas
// sin incluir las citas canceladas.

function actualizarContador(citasDia) {

    let total = 0;

    let completadas = 0;

    for (let i = 0; i < citasDia.length; i++) {

        if (citasDia[i].estado != 'cancelada') {

            total++;

            if (citasDia[i].estado == 'completada') {

                completadas++;

            }

        }

    }

    let porcentaje = 0;

    // Evitamos dividir entre cero si no hay citas.

    if (total > 0) {

        porcentaje = completadas / total * 100;

    }

    document.getElementById('contadorCitas').textContent =
        completadas + ' de ' + total + ' citas';

    document.getElementById('barraProgreso').value =
        porcentaje;

}
