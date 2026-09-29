/* =====================================================
   CONFIGURACIÓN SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://wnhtggbhguqqljohhcda.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_OzZTME17eLsWIMpwPD6Beg_cscbWqIh";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


let alumnos = [];



/* =====================================================
   VARIABLES PARA MODALES
===================================================== */

window.alumnoEditando = null;

window.alumnoEliminando = null;



/* =====================================================
   LOGIN
===================================================== */

document
    .getElementById("form-login")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("login-email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("login-password")
                    .value;


            const mensaje =
                document
                    .getElementById("mensaje-login");


            mensaje.textContent =
                "Ingresando...";


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            if (error) {

                console.error(error);

                mensaje.textContent =
                    "❌ Correo o contraseña incorrectos.";

                return;

            }


            mensaje.textContent = "";

            iniciarAplicacion();

        }
    );



/* =====================================================
   COMPROBAR SESIÓN
===================================================== */

async function comprobarSesion() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(error);

        mostrarLogin();

        return;

    }


    if (
        data.session
    ) {

        iniciarAplicacion();

    } else {

        mostrarLogin();

    }

}



/* =====================================================
   MOSTRAR LOGIN
===================================================== */

function mostrarLogin() {

    document
        .getElementById("pantalla-login")
        .classList.remove("oculto");


    document
        .getElementById("aplicacion")
        .classList.add("oculto");

}



/* =====================================================
   INICIAR APLICACIÓN
===================================================== */

async function iniciarAplicacion() {

    document
        .getElementById("pantalla-login")
        .classList.add("oculto");


    document
        .getElementById("aplicacion")
        .classList.remove("oculto");


    await cargarAlumnos();

}



/* =====================================================
   CERRAR SESIÓN
===================================================== */

async function cerrarSesion() {

    const confirmar =
        confirm(
            "¿Seguro que quieres cerrar sesión?"
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        console.error(error);

        alert(
            "No se pudo cerrar la sesión."
        );

        return;

    }


    alumnos = [];

    mostrarLogin();

}



/* =====================================================
   CARGAR ALUMNOS
===================================================== */

async function cargarAlumnos() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("alumnos")
            .select("*")
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(error);

        alert(
            "No se pudieron cargar los alumnos."
        );

        return;

    }


    alumnos =
        data.map(
            function (alumno) {

                return {

                    id:
                        alumno.id,

                    nombre:
                        alumno.nombre || "",

                    curso:
                        alumno.curso || "",

                    decimas:
                        Number(
                            alumno.decimas || 0
                        ),

                    historial:
                        Array.isArray(
                            alumno.historial
                        )
                            ? alumno.historial
                            : []

                };

            }
        );


    alumnos.forEach(
        function (alumno) {

            alumno.historial =
                alumno.historial.map(
                    function (movimiento) {

                        return {

                            tipo:
                                movimiento.tipo || "",

                            cantidad:
                                Number(
                                    movimiento.cantidad || 0
                                ),

                            motivo:
                                movimiento.motivo || "Sin motivo",

                            fecha:
                                movimiento.fecha ||
                                new Date().toISOString()

                        };

                    }
                );

        }
    );


    actualizarFiltroCursos();

    mostrarAlumnos();

}



/* =====================================================
   GUARDAR ALUMNO
===================================================== */

async function guardarAlumno(alumno) {

    const {
        error
    } =
        await supabaseClient
            .from("alumnos")
            .update({

                nombre:
                    alumno.nombre,

                curso:
                    alumno.curso,

                decimas:
                    alumno.decimas,

                historial:
                    alumno.historial

            })
            .eq(
                "id",
                alumno.id
            );


    if (error) {

        console.error(error);

        alert(
            "No se pudieron guardar los cambios."
        );

        return false;

    }


    return true;

}



/* =====================================================
   RESUMEN
===================================================== */

function actualizarResumen() {

    const filtro =
        document
            .getElementById("filtro-curso")
            .value;


    const lista =
        alumnos.filter(
            function (alumno) {

                if (
                    filtro === "todos"
                ) {

                    return true;

                }

                return (
                    alumno.curso === filtro
                );

            }
        );


    const totalAlumnos =
        lista.length;


    const totalDecimas =
        lista.reduce(
            function (total, alumno) {

                return (
                    total +
                    Number(alumno.decimas || 0)
                );

            },
            0
        );


    const promedio =
        totalAlumnos > 0
            ? totalDecimas / totalAlumnos
            : 0;


    document
        .getElementById("total-alumnos")
        .textContent =
        totalAlumnos;


    document
        .getElementById("total-decimas")
        .textContent =
        totalDecimas.toFixed(1)
            .replace(".", ",");


    document
        .getElementById("promedio-decimas")
        .textContent =
        promedio.toFixed(1)
            .replace(".", ",");

}



/* =====================================================
   FILTRO DE CURSOS
===================================================== */

function actualizarFiltroCursos() {

    const select =
        document
            .getElementById("filtro-curso");


    const cursoActual =
        select.value;


    const cursos =
        [
            ...new Set(
                alumnos
                    .map(
                        function (alumno) {
                            return alumno.curso;
                        }
                    )
                    .filter(
                        function (curso) {
                            return curso.trim() !== "";
                        }
                    )
            )
        ]
        .sort();


    select.innerHTML = "";


    const opcionTodos =
        document.createElement("option");

    opcionTodos.value =
        "todos";

    opcionTodos.textContent =
        "Todos los cursos";

    select.appendChild(
        opcionTodos
    );


    cursos.forEach(
        function (curso) {

            const opcion =
                document.createElement("option");

            opcion.value =
                curso;

            opcion.textContent =
                curso;

            select.appendChild(
                opcion
            );

        }
    );


    if (
        cursos.includes(
            cursoActual
        )
    ) {

        select.value =
            cursoActual;

    } else {

        select.value =
            "todos";

    }


    actualizarResumen();

}



/* =====================================================
   FILTRAR CURSO
===================================================== */

function filtrarCurso() {

    mostrarAlumnos();

}



/* =====================================================
   MOSTRAR ALUMNOS
===================================================== */

function mostrarAlumnos() {

    const contenedor =
        document
            .getElementById("lista-alumnos");


    const filtroCurso =
        document
            .getElementById("filtro-curso")
            .value;


    const buscador =
        document
            .getElementById("buscador-alumno")
            .value
            .toLowerCase()
            .trim();


    contenedor.innerHTML = "";


    alumnos.forEach(
        function (alumno, indice) {

            if (
                filtroCurso !== "todos" &&
                alumno.curso !== filtroCurso
            ) {

                return;

            }


            if (
                buscador !== "" &&
                !alumno.nombre
                    .toLowerCase()
                    .includes(buscador)
            ) {

                return;

            }


            const tarjeta =
                document.createElement("div");


            tarjeta.className =
                "tarjeta-alumno";


            const historialHTML =
                generarHistorialHTML(
                    alumno,
                    indice
                );


            tarjeta.innerHTML = `

                <div class="cabecera-alumno">

                    <div>

                        <h3>
                            ${escapeHTML(alumno.nombre)}
                        </h3>

                        <div class="curso-alumno">
                            🏫 ${escapeHTML(alumno.curso)}
                        </div>

                    </div>


                    <div class="decimas-destacadas">

                        <span class="texto-decimas">
                            DÉCIMAS
                        </span>

                        <span class="numero-decimas">
                            ${Number(alumno.decimas || 0)
                                .toFixed(1)
                                .replace(".", ",")}
                        </span>

                    </div>

                </div>


                <div class="grupo-botones">

                    <button
                        class="boton boton-sumar"
                        onclick="sumar(${indice}, 0.1)"
                    >
                        +0,1
                    </button>


                    <button
                        class="boton boton-sumar"
                        onclick="sumar(${indice}, 0.2)"
                    >
                        +0,2
                    </button>


                    <button
                        class="boton boton-sumar"
                        onclick="sumar(${indice}, 0.5)"
                    >
                        +0,5
                    </button>


                    <button
                        class="boton boton-restar"
                        onclick="restar(${indice}, 0.1)"
                    >
                        -0,1
                    </button>

                </div>


                <div class="fila-botones">

                    <button
                        class="boton boton-personalizado"
                        onclick="cantidadPersonalizada(${indice})"
                    >
                        ✏️ Personalizado
                    </button>


                    <button
                        class="boton boton-admin"
                        onclick="editarAlumno(${indice})"
                    >
                        ✏️ Editar
                    </button>


                    <button
                        class="boton boton-admin"
                        onclick="eliminarAlumno(${indice})"
                    >
                        🗑️ Eliminar
                    </button>


                    <button
                        class="boton boton-deshacer"
                        onclick="deshacerUltimoMovimiento(${indice})"
                    >
                        ↩️ Deshacer
                    </button>

                </div>


                <div class="fila-botones">

                    <button
                        class="boton boton-admin"
                        onclick="alternarHistorial(${indice})"
                    >
                        📜 Ver / ocultar historial
                    </button>

                </div>


                <div
                    id="historial-${indice}"
                    class="historial-contenido historial-oculto"
                >
                    ${historialHTML}
                </div>

            `;


            contenedor.appendChild(
                tarjeta
            );

        }
    );


    actualizarResumen();

}



/* =====================================================
   HISTORIAL HTML
===================================================== */

function generarHistorialHTML(
    alumno,
    indice
) {

    if (
        !alumno.historial ||
        alumno.historial.length === 0
    ) {

        return `
            <div class="historial-vacio">
                No hay movimientos registrados.
            </div>
        `;

    }


    return alumno.historial
        .slice()
        .reverse()
        .map(
            function (movimiento) {

                const esSuma =
                    movimiento.tipo === "suma";


                const signo =
                    esSuma
                        ? "+"
                        : "-";


                const clase =
                    esSuma
                        ? "historial-suma"
                        : "historial-resta";


                const fecha =
                    new Date(
                        movimiento.fecha
                    );


                const fechaTexto =
                    fecha.toLocaleString(
                        "es-CL"
                    );


                return `

                    <div
                        class="historial-movimiento ${clase}"
                    >

                        <span class="movimiento-cantidad">
                            ${signo}${Number(
                                movimiento.cantidad
                            ).toFixed(1)}
                        </span>


                        <span class="movimiento-motivo">
                            ${escapeHTML(
                                movimiento.motivo
                            )}
                        </span>


                        <span class="movimiento-fecha">
                            ${fechaTexto}
                        </span>

                    </div>

                `;

            }
        )
        .join("");

}



/* =====================================================
   MOSTRAR / OCULTAR HISTORIAL
===================================================== */

function alternarHistorial(indice) {

    const elemento =
        document.getElementById(
            `historial-${indice}`
        );


    if (!elemento) {
        return;
    }


    elemento.classList.toggle(
        "historial-oculto"
    );

}



/* =====================================================
   BUSCAR
===================================================== */

function buscarAlumno() {

    mostrarAlumnos();

}



/* =====================================================
   PEDIR MOTIVO
===================================================== */

function pedirMotivo(
    tipo,
    cantidad
) {

    const mensaje =
        tipo === "suma"

            ? `¿Por qué quieres sumar ${cantidad} décimas?`

            : `¿Por qué quieres restar ${cantidad} décimas?`;


    const motivo =
        prompt(mensaje);


    if (
        motivo === null
    ) {

        return null;

    }


    const texto =
        motivo.trim();


    if (
        texto === ""
    ) {

        return "Sin motivo";

    }


    return texto;

}



/* =====================================================
   SUMAR
===================================================== */

async function sumar(
    indice,
    cantidad
) {

    const alumno =
        alumnos[indice];


    const motivo =
        pedirMotivo(
            "suma",
            cantidad
        );


    if (
        motivo === null
    ) {

        return;

    }


    alumno.decimas =
        Number(alumno.decimas || 0)
        +
        Number(cantidad);


    alumno.historial.push({

        tipo:
            "suma",

        cantidad:
            Number(cantidad),

        motivo:
            motivo,

        fecha:
            new Date().toISOString()

    });


    const guardado =
        await guardarAlumno(
            alumno
        );


    if (!guardado) {

        return;

    }


    mostrarAlumnos();

}



/* =====================================================
   RESTAR
===================================================== */

async function restar(
    indice,
    cantidad
) {

    const alumno =
        alumnos[indice];


    const motivo =
        pedirMotivo(
            "resta",
            cantidad
        );


    if (
        motivo === null
    ) {

        return;

    }


    alumno.decimas =
        Number(alumno.decimas || 0)
        -
        Number(cantidad);


    alumno.historial.push({

        tipo:
            "resta",

        cantidad:
            Number(cantidad),

        motivo:
            motivo,

        fecha:
            new Date().toISOString()

    });


    const guardado =
        await guardarAlumno(
            alumno
        );


    if (!guardado) {

        return;

    }


    mostrarAlumnos();

}



/* =====================================================
   CANTIDAD PERSONALIZADA
===================================================== */

async function cantidadPersonalizada(
    indice
) {

    const valor =
        prompt(
            "¿Cuántas décimas quieres agregar o quitar?"
        );


    if (
        valor === null
    ) {

        return;

    }


    const cantidad =
        Number(
            valor.replace(",", ".")
        );


    if (
        isNaN(cantidad) ||
        cantidad <= 0
    ) {

        alert(
            "Ingresa una cantidad válida."
        );

        return;

    }


    const operacion =
        prompt(
            "Escribe SUMAR o RESTAR:"
        );


    if (
        operacion === null
    ) {

        return;

    }


    const tipo =
        operacion
            .trim()
            .toLowerCase();


    if (
        tipo !== "sumar" &&
        tipo !== "restar"
    ) {

        alert(
            "Debes escribir SUMAR o RESTAR."
        );

        return;

    }


    if (
        tipo === "sumar"
    ) {

        await sumar(
            indice,
            cantidad
        );

    } else {

        await restar(
            indice,
            cantidad
        );

    }

}



/* =====================================================
   DESHACER
===================================================== */

async function deshacerUltimoMovimiento(
    indice
) {

    const alumno =
        alumnos[indice];


    if (
        !alumno.historial ||
        alumno.historial.length === 0
    ) {

        alert(
            "Este alumno no tiene movimientos para deshacer."
        );

        return;

    }


    const ultimo =
        alumno.historial[
            alumno.historial.length - 1
        ];


    const confirmar =
        confirm(
            `¿Deshacer el último movimiento de ${alumno.nombre}?`
        );


    if (!confirmar) {

        return;

    }


    if (
        ultimo.tipo === "suma"
    ) {

        alumno.decimas -=
            Number(
                ultimo.cantidad
            );

    } else {

        alumno.decimas +=
            Number(
                ultimo.cantidad
            );

    }


    alumno.historial.pop();


    const guardado =
        await guardarAlumno(
            alumno
        );


    if (!guardado) {

        return;

    }


    mostrarAlumnos();

}



/* =====================================================
   AGREGAR ALUMNO
===================================================== */

async function agregarAlumno() {

    const nombre =
        document
            .getElementById("nombre-alumno")
            .value
            .trim();


    const curso =
        document
            .getElementById("curso-alumno")
            .value
            .trim();


    if (
        nombre === ""
    ) {

        alert(
            "Ingresa el nombre del alumno."
        );

        return;

    }


    if (
        curso === ""
    ) {

        alert(
            "Ingresa el curso."
        );

        return;

    }


    const nuevoAlumno = {

        nombre:
            nombre,

        curso:
            curso,

        decimas:
            0,

        historial:
            []

    };


    const {
        data,
        error
    } =
        await supabaseClient
            .from("alumnos")
            .insert(
                nuevoAlumno
            )
            .select()
            .single();


    if (error) {

        console.error(error);

        alert(
            "No se pudo agregar el alumno."
        );

        return;

    }


    alumnos.push({

        id:
            data.id,

        nombre:
            data.nombre,

        curso:
            data.curso,

        decimas:
            Number(
                data.decimas || 0
            ),

        historial:
            Array.isArray(
                data.historial
            )
                ? data.historial
                : []

    });


    document
        .getElementById("nombre-alumno")
        .value = "";


    document
        .getElementById("curso-alumno")
        .value = "";


    ocultarFormulario();

    actualizarFiltroCursos();

    mostrarAlumnos();

}



/* =====================================================
   MOSTRAR FORMULARIO
===================================================== */

function mostrarFormulario() {

    document
        .getElementById("formulario-alumno")
        .style.display = "block";


    document
        .getElementById("nombre-alumno")
        .focus();

}



/* =====================================================
   OCULTAR FORMULARIO
===================================================== */

function ocultarFormulario() {

    document
        .getElementById("formulario-alumno")
        .style.display = "none";

}



/* =====================================================
   EDITAR ALUMNO
===================================================== */

function editarAlumno(indice) {

    const alumno =
        alumnos[indice];


    window.alumnoEditando =
        indice;


    document
        .getElementById("modal-nombre")
        .value =
        alumno.nombre;


    document
        .getElementById("modal-curso")
        .value =
        alumno.curso;


    document
        .getElementById("modal-editar")
        .classList.remove("oculto");


    document
        .getElementById("modal-nombre")
        .focus();

}



/* =====================================================
   CERRAR MODAL EDITAR
===================================================== */

function cerrarModalEditar() {

    document
        .getElementById("modal-editar")
        .classList.add("oculto");


    window.alumnoEditando =
        null;

}



/* =====================================================
   GUARDAR EDICIÓN
===================================================== */

async function guardarEdicionAlumno() {

    const indice =
        window.alumnoEditando;


    if (
        indice === null ||
        indice === undefined
    ) {

        return;

    }


    const alumno =
        alumnos[indice];


    const nuevoNombre =
        document
            .getElementById("modal-nombre")
            .value
            .trim();


    const nuevoCurso =
        document
            .getElementById("modal-curso")
            .value
            .trim();


    if (
        nuevoNombre === ""
    ) {

        alert(
            "El nombre no puede estar vacío."
        );

        return;

    }


    if (
        nuevoCurso === ""
    ) {

        alert(
            "El curso no puede estar vacío."
        );

        return;

    }


    const nombreAnterior =
        alumno.nombre;


    const cursoAnterior =
        alumno.curso;


    alumno.nombre =
        nuevoNombre;


    alumno.curso =
        nuevoCurso;


    const guardado =
        await guardarAlumno(
            alumno
        );


    if (!guardado) {

        alumno.nombre =
            nombreAnterior;

        alumno.curso =
            cursoAnterior;

        return;

    }


    cerrarModalEditar();


    actualizarFiltroCursos();

    mostrarAlumnos();

}



/* =====================================================
   ELIMINAR ALUMNO
===================================================== */

function eliminarAlumno(indice) {

    const alumno =
        alumnos[indice];


    window.alumnoEliminando =
        indice;


    document
        .getElementById("nombre-eliminar")
        .textContent =
        alumno.nombre;


    document
        .getElementById("modal-eliminar")
        .classList.remove("oculto");

}



/* =====================================================
   CERRAR MODAL ELIMINAR
===================================================== */

function cerrarModalEliminar() {

    document
        .getElementById("modal-eliminar")
        .classList.add("oculto");


    window.alumnoEliminando =
        null;

}



/* =====================================================
   CONFIRMAR ELIMINACIÓN
===================================================== */

async function confirmarEliminacion() {

    const indice =
        window.alumnoEliminando;


    if (
        indice === null ||
        indice === undefined
    ) {

        return;

    }


    const alumno =
        alumnos[indice];


    const {
        error
    } =
        await supabaseClient
            .from("alumnos")
            .delete()
            .eq(
                "id",
                alumno.id
            );


    if (error) {

        console.error(error);

        alert(
            "No se pudo eliminar el alumno."
        );

        return;

    }


    alumnos.splice(
        indice,
        1
    );


    cerrarModalEliminar();


    actualizarFiltroCursos();

    mostrarAlumnos();

}



/* =====================================================
   ESCAPAR HTML
===================================================== */

function escapeHTML(texto) {

    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}



/* =====================================================
   INICIAR
===================================================== */

comprobarSesion();