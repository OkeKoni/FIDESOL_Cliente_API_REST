//import {ClienteFiltros} from "./ClienteFiltros";

// obtiene datos de países desde una API y los devuelve simplificado y estructurado para su uso en la aplicación.
async function getData() {
  // Realiza una petición a la API de países.
  const url = "https://restcountries.com/v3.1/all";

  try {
    // Hace una petición a la URL.
    const response = await fetch(url);

    // Verifica si la respuesta es correcta.
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    // Convierte la respuesta en un json.
    const json = await response.json();

    // Transforma los datos recibidos para crear un nuevo array con solo la información necesaria de cada país.
    return json.map((country) => {
      return {
        flag: country.flags.png,
        name: country.name.common,
        capital: country.capital ? country.capital : 'N/A',
        region: country.region,
        poblacion: country.population,
        idioma: country.languages ? Object.values(country.languages)[0] : 'N/A',
      }
    });

    // Si ocurre algún error, retorna un array vacío además del error.
  } catch (error) {
    console.error("Error");
    return [];
  }
}

// La función creará copias en la estructura del código HTML, rellenándola con los datos de cada país.
// Toma como parámetro un objeto país
function countryTarjeta(country){
  // Busca una plantilla HTML con id "country-template"
  let countryTemplate = document.querySelector("#country-template");

  // Añade la información obtenida en el elemento HTML que se indique.
  let flagImage = countryTemplate.content.querySelector("img");
  let name = countryTemplate.content.querySelector("h2");
  let capital = countryTemplate.content.querySelector("p[name=capital]");
  let region = countryTemplate.content.querySelector("p[name=region]");
  let poblacion = countryTemplate.content.querySelector("p[name=poblacion]");
  let idioma = countryTemplate.content.querySelector("p[name=idioma]");

  // Actualiza el contenido de estos elementos con los datos del país.
  flagImage.src = country.flag;
  name.textContent = country.name;
  capital.textContent = country.capital;
  region.textContent = country.region;
  poblacion.textContent = country.poblacion;
  idioma.textContent = country.idioma;

  // Crea una copia de la plantilla con los nuevos datos.
  let copy = document.importNode(countryTemplate.content, true);
  // Añade esta copia en el contenedor principal
  document.querySelector("#card-container").appendChild(copy);
}

/* Utiliza la función que vimos anteriormente `getData()` cuando recibe los datos (.then). Por cada país en
la respuesta llama a `countryTarjeta()` para crear su visualización.*/
getData().then(response => {
  response.forEach(country => {
    countryTarjeta(country);
  })
});

// Función asíncrona que realiza los filtos para buscar la información que se le pida a la aplicación.
async function buscarPorParametros(){
  // Recoge el valor que le introducimos al input.
  const terminoBusqueda = document.getElementById("consultaSearch");
  // Recoge el valor para determinar el tipo de búsqueda que hará el cliente.
  const parametros = document.getElementById("select-parametro");
  // Selecciona la tarjeta con la información completa.
  const cardContainer = document.querySelector("#card-container");

  // Si no existe nada, da error
  if (!terminoBusqueda || !parametros || !cardContainer) {
    console.error("No se encontraron los elementos necesarios");
  }

  try{
    // Limpia el contenedor de trarjetas
      cardContainer.innerHTML = '';

      // Si no hay término de búsqueda muestra los países usando 'getData()'.
    if(terminoBusqueda.value === ""){
      const datos = await getData();
      datos.forEach(country => countryTarjeta(country));
      return;
  }

  let datos;

    // Filtra según queramos la máxima o la mínima población.
  if(parametros.value === "4" || parametros.value === "5"){
    const response = await fetch("https://restcountries.com/v3.1/all");
    datos = await response.json();
    const poblacion = parseInt(terminoBusqueda.value);

    if(parametros.value === "4"){
      // Filtra países con población mayor o igual al valor.
        datos = datos.filter(country => country.population >= poblacion);
    } else {
      // Filtra países con población menor o igual al valor.
      datos = datos.filter(country => country.population <= poblacion);
    }

  } else {
    let url = "https://restcountries.com/v3.1/";

    // Construye una URL específica según el parámetro introducido al switch
    switch(parametros.value ){
      case "0":
        // Nombre
        url += `name/${terminoBusqueda.value}`;
        break;

      case "1":
        // Continente
        url += `region/${terminoBusqueda.value}`;
        break;

      case "2":
        // Capital
        url += `capital/${terminoBusqueda.value}`;
        break;

      case "3":
        // Idioma
        url += `language/${terminoBusqueda.value}`;
        break;

      default:
        // Por defecto, el parámetro no es válido.
        throw new Error("Parámetro no válido");
    }

    // Hace la petición a la API con la URL construida.
    const response = await fetch(url);

    // Si no hay resultados, muestra un mensaje de error.
    if(!response.ok) throw new Error("Error en la petición");
    datos = await response.json();
  }

  // Si no se añaden datos, se crea un div que pone el error.
  if(!datos || datos.length === 0){
    cardContainer.innerHTML = '<div class="error">No se encontraron países con ese criterio</div>';
    return;
  }
  // Ordena de mayor a menor la población.
  datos.sort((a, b) => b.population - a.population);

    // Transformar los datos antes de mostrarlos.
    const paisesFormateados = datos.map(country => ({
      flag: country.flags.png,
      name: country.name.common,
      capital: country.capital ? country.capital[0] : 'N/A',
      region: country.region,
      poblacion: country.population,
      idioma: country.languages ? Object.values(country.languages)[0] : 'N/A',
    }));

    // Añade los datos buscados en las tarjetas.
    paisesFormateados.forEach(country => countryTarjeta(country));

    // Si algo falla, únicamente muestra 'Sin resultados'.
  } catch(error){
    cardContainer.innerHTML = `<div class="error">Sin resultados</div>`
    console.error(error);
  }
}


// Maneja toda la interactividad inicial de la página.
document.addEventListener("DOMContentLoaded", async () => {
  // Cargar todos los países al inicio cuando página carga.
  const datos = await getData();
  datos.forEach(country => countryTarjeta(country));

  // Event listener para el botón "Ver Tod0", cuando se hace click en ella se limpia el contenedor y muestra todos los países.
  document.getElementById("verTodo").addEventListener("click", async () => {
    // Selecciona el contenedor.
    const cardContainer = document.querySelector("#card-container");
    // Limpia el contenedor.
    cardContainer.innerHTML = '';
    // Se meten nuevamente todos los datos en la tarjeta
    const datos = await getData();
    datos.forEach(country => countryTarjeta(country));
  });


  // Event listener para el input de búsqueda.
  let espera;
  // Para cuando el usuario escriba en el input de búsqueda.
  const inputBusqueda = document.getElementById("consultas");
  inputBusqueda.addEventListener("input", () => {
    clearTimeout(espera);
    // Espera medio segundo
    espera = setTimeout(buscarPorParametros, 500);
  });

  // Event listener para el select de parámetros, cambia cuando se cambia el parámetro de búsqueda
  document.getElementById("select-parametro").addEventListener("change", () => {
    if(inputBusqueda.value !== "") {
      buscarPorParametros();
    }
  });
});
















































