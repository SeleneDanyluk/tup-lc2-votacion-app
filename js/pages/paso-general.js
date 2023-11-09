// Definicion de constantes
const tipoRecuento = 1;
const periodosSelect = document.getElementById("select-anio");
const cargosSelect = document.getElementById("select-cargo");
const distritoSelect = document.getElementById("select-distrito");
const seccionSelect = document.getElementById("select-seccion");
const hdSeccionProvincial = document.getElementById("hdSeccionProvincial");


// Definicion de variables
var datos = null;
var tipoEleccion = null;


// Determinamos si estamos en la pagina paso o generales
if (location.href.includes("paso")) {
    tipoEleccion = 1
} else {
    tipoEleccion = 2
}

//setear intervalo (ver para mostrar los otros mensajes)
var mensajeContenedor = document.getElementById("mensaje");
var mensaje = document.getElementById("p-message")
mensaje.innerHTML = "Debe seleccionar los valores a filtrar y hacer clic en el botón FILTRAR."
mensajeContenedor.style.display = "flex";
setTimeout(function() {
    mensajeContenedor.style.display = "none";
}, 10000);


// Obtenemos las opciones para el select de año
fetch("https://resultados.mininterior.gob.ar/api/menu/periodos")
    .then(response => response.json())
    .then(data => {
        // Agregamos las opciones obtenidas al html
        data.forEach(anio => {
            var option = document.createElement("option");
            option.value = anio;
            option.text = anio;
            periodosSelect.appendChild(option);
        });
    }).catch((error) => {
        console.error("Error al obtener datos de la API:", error);
    });


// Al realizarse un cambio en el select de año se llama a combo cargo
function comboCargo() {
    // Limpiamos las opciones del combo antes de cargarlas nuevamente
    cargosSelect.innerText = null;
    var option = document.createElement("option");
    option.value = 0
    option.text = 'Cargo'
    cargosSelect.appendChild(option);

    // Si se seleccionó un año buscamos los cargos correspondientes
    if (periodosSelect.value != 0) {
        fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + periodosSelect.value)
            .then(response => response.json())
            .then(datosFiltrado => {
                datos = datosFiltrado
                // Guardamos los datos obtenidos en una variable global para reutilizarlos
                // si hay error puede ser porque saque esto datos = datosFIltro
                datosFiltrado.forEach((eleccion) => {
                    if (eleccion.IdEleccion == tipoEleccion) {
                        // Agregamos las opciones correspondientes al html
                        eleccion.Cargos.forEach((cargo) => {
                            var option = document.createElement("option");
                            option.value = cargo.IdCargo
                            option.text = cargo.Cargo
                            cargosSelect.appendChild(option);
                        })
                    }
                })
            }).catch((error) => {
                console.error("Error al obtener datos de la API:", error);
            });
        // Si se des-selecciona el año no permitimos seleccionar lo demás
    } else {
        comboDistrito();
    }
}

// Al realizarse un cambio en el select de cargo se llama a combo distrito
function comboDistrito() {
    // Limpiamos las opciones del combo antes de cargarlas nuevamente
    distritoSelect.innerText = null;
    var option = document.createElement("option");
    option.value = 0
    option.text = 'Distrito'
    distritoSelect.appendChild(option);

    // Si se seleccionó un año y un cargo buscamos los distritos correspondientes
    if (periodosSelect.value != 0 && cargosSelect.value != 0) {
        datos.forEach((eleccion) => {
            if (eleccion.IdEleccion == tipoEleccion) {
                eleccion.Cargos.forEach((cargo) => {
                    if (cargo.IdCargo == cargosSelect.value) {
                        // Agregamos las opciones correspondientes al html
                        cargo.Distritos.forEach((distrito) => {
                            var option = document.createElement("option");
                            option.value = distrito.IdDistrito
                            option.text = distrito.Distrito
                            distritoSelect.appendChild(option);
                        });
                    }
                });
            }
        });
    }
    else {
        // Si se des-selecciona el año o el cargo no permitimos seleccionar lo demás
        comboSeccion();
    }
}

// Al realizarse un cambio en el select de distrito se llama a combo seccion
function comboSeccion() {
    // Limpiamos las opciones del combo antes de cargarlas nuevamente
    seccionSelect.innerText = null;
    var option = document.createElement("option");
    option.value = 0
    option.text = 'Seccion'
    seccionSelect.appendChild(option);

    // Si se seleccionó un año, un cargo y un distrito buscamos las secciones correspondientes
    if (periodosSelect.value != 0 && cargosSelect.value != 0 && distritoSelect != 0) {
        datos.forEach((eleccion) => {
            if (eleccion.IdEleccion == tipoEleccion) {
                eleccion.Cargos.forEach((cargo) => {
                    if (cargo.IdCargo == cargosSelect.value) {
                        cargo.Distritos.forEach((distrito) => {
                            if (distrito.IdDistrito == distritoSelect.value) {
                                // Agregamos las opciones correspondientes al html
                                distrito.SeccionesProvinciales.forEach((seccion) => {
                                    hdSeccionProvincial.value = seccion.IDSeccionProvincial;
                                    seccion.Secciones.forEach((secciones) => {
                                        var option = document.createElement("option");
                                        option.value = secciones.IdSeccion;
                                        option.text = secciones.Seccion;
                                        seccionSelect.appendChild(option);
                                    })

                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

async function consultarResultados() {
    let cargoTxt = cargosSelect.options[cargosSelect.selectedIndex].innerText; //obtener el texto del campo seleccionado
    const anioEleccion = periodosSelect.value; // Valor seleccionado en el select de año
    const categoriaId = cargosSelect.value; // Valor seleccionado en el select de cargo
    const distritoId = distritoSelect.value; // Valor seleccionado en el select de distrito
    let seccionProvincialId = hdSeccionProvincial.value;
    if (seccionProvincialId == "undefined") {
        seccionProvincialId = "";
    };
    const seccionId = seccionSelect.value;
    console.log(seccionId);
    const circuitoId = ""; // Valor por defecto
    const mesaId = ""; // Valor por defecto

    // Validar que todos los campos estén completos
    if (
        anioEleccion === "0" ||
        categoriaId === "0" ||
        distritoId === "0" ||
        seccionProvincialId === "0" ||
        seccionId === "0"
    ) {
        alert("Por favor, complete todos los campos de selección en amarillo."); //mensaje amarillo
        return;
    }

    try {
        const url = "https://resultados.mininterior.gob.ar/api/resultados/getResultados";
        const queryParams = `?anioEleccion=${anioEleccion}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${categoriaId}&distritoId=${distritoId}&seccionProvincialId=${seccionProvincialId}&seccionId=${seccionId}&circuitoId=${circuitoId}&mesaId=${mesaId}`;
        console.log(url + queryParams);
        const response = await fetch(url + queryParams);
        datos = await response.json();
        console.log(datos.estadoRecuento.mesasTotalizadas);
        cargarDatosHTML(datos);
    } catch (error) {
            mensaje.classList.remove("yellow")
            mensaje.classList.add("red")
            mensaje.innerHTML = "Error.Se produjo un error al intentar agregar resultados al informe."
            mensajeContenedor.style.display = "flex";
            setTimeout(function() {
                mensajeContenedor.style.display = "none";
            }, 5000);
    }
}

//hacer desaparecer todo y que aparezca cuando se carga la api
function cargarDatosHTML(datos) {
    mesas = document.getElementById("mesas-escrutadas");
    electores = document.getElementById("electores");
    participacion = document.getElementById("participacion");

    mesas.innerHTML = datos.estadoRecuento.mesasTotalizadas
    electores.innerHTML = datos.estadoRecuento.cantidadElectores
    participacion.innerHTML = `${datos.estadoRecuento.participacionPorcentaje}%`
}