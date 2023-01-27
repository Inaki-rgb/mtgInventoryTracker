// nuestro array que va a contener las cartas del "inventario" y que se va a guardar en el local storage
let savedCards = [];

// esto es para que cuando cargue la pagina la tabla que muestra nuestro inventario aparezca de una
window.onload = function() {
    // trae el array que se encuentra en el local storage
    const savedCards = JSON.parse(localStorage.getItem("savedCards")) || [];

    // actualiza la tabla con la informacion del array recuperado en local storage
    savedCards.forEach(card => {
        addRow(card);
    });
};


async function getCardData(cardName) {
    // connexion con el endpoint del API que busca la carta ingresada por el usuario
    const url = `https://api.scryfall.com/cards/search?q=${cardName}`;
    
    // genera el GET request al API
    const response = await fetch(url);
    
    // parsea la respuesta como JSON
    const data = await response.json();
    
    // return la data
    return data;
}
// declaramos la variable que contiene el input del usuario
const form = document.querySelector("#card-form");

// generamos el evento
form.addEventListener("submit", event => {
    event.preventDefault();
    const cardName = document.querySelector("#card-name").value;
    if (cardName.length===0){
        alert("Por favor ingresar el nombre de una carta.");
        return
    }
    clearImages()
    getCardData(cardName)
        .then(data => {
            displayCard(data);
        })
        .catch(error => {
            console.log(error);
        });
});

// esta funcion es lo que nos permite ver las imagenes asociadas a la carta ingresada por el usuario.
function displayCard(cardData) {
    const cardContainer = document.querySelector("#card-image");
    cardData.data.forEach(card => { // por cada "hit" de carta que encontramos genera un tag img y le asigna el valor correspondiente
        const img = document.createElement("img");
        img.src = card.image_uris.normal;
        img.alt = card.name;
        img.addEventListener("click", () => { // evento divertido que hace que cuando el usuario clickea una carta corre una funcion que guarda la data de la carta en un array :D
            saveCard(card); // dicha funcion :D
        });
        cardContainer.appendChild(img);
    });
}

function saveCard(card) {
    if(confirm(`Do you want to add ${card.name} to the saved cards?`)){ // aviso visual y confirmacion de que ha hecho click en una carta y si desea guardarla
        savedCards.push(card);
        createTableRows(savedCards);
    }
    let savedCardsString = JSON.stringify(savedCards); // convierte array actualizado en json 
    localStorage.setItem("savedCards", savedCardsString);// guarda array convertido en string json al local storage, actualizandolo
    console.log(savedCards);
}
function updateTable() {
    // busca el array savedCards hecho string del local storage
    const savedCardsString = localStorage.getItem("savedCards");
    // parsea el string a un array de nuevo
    savedCards = JSON.parse(savedCardsString);
}

function createTableRows(savedCards) {
    // elimina las filas existentes
    const tbody = document.getElementById("saved-cards-tbody");
    tbody.innerHTML = "";
    // crea una fila para cada carta
    savedCards.forEach(card => {
        addRow(card)
    });
}
// funcion que se ocupa de generar cada fila para la tabla.
function addRow(card) {
    // crea la fila
    const row = document.createElement("tr");
    const usdPrecio = card.prices.usd;

    // crea la columna "Nombre" y agrega el nombre de la carta
    const nombre = document.createElement("td");
    nombre.textContent = card.name;
    row.appendChild(nombre);

    // crea la columna "Edicion" que es la edicion de la carta y agrega la edicion de la carta que se agrega.
    const edicion = document.createElement("td");
    edicion.textContent = card.set_name;
    row.appendChild(edicion);

    // crea la columna "Rareza" y agrega la rareza de la carta
    const rareza = document.createElement("td");
    rareza.textContent = card.rarity;
    row.appendChild(rareza);

    // crea la columna "Tipo" que es el tipo de carta y agrega el tipo de carta que se esta agregando.
    const tipo = document.createElement("td");
    tipo.textContent = card.type_line;
    row.appendChild(tipo);

    // crea la columna "Precio" y va a contener el precio de la carta.
    const precio = document.createElement("td");
    precio.textContent = "USD "+usdPrecio;
    row.appendChild(precio);

    // creamos el boton "x". Sirve para eliminar la fila del array y tabla.
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", event => {
        const index = savedCards.indexOf(card);
        savedCards.splice(index, 1);
        localStorage.setItem("savedCards", JSON.stringify(savedCards));
        createTableRows(savedCards);
    });
    row.appendChild(deleteButton);

    // apenda la fila a la tabla
    document.getElementById("saved-cards-tbody").appendChild(row);
}

// boton para dejar en limpio por si el usuario desea limpiar
const clearButton = document.getElementById("clear-button");
clearButton.addEventListener("click", clearImages);

function clearImages() {
    event.preventDefault();
    // selecciona todas los img tags
    const images = document.querySelectorAll("img");
    // loopea cada una de los tags y los remueve del DOM
    images.forEach(img => img.remove());
}

// variable que usamos para asignar el evento del boton para eliminar lo que haya guardado en el local storage
const clearLocalStorageButton = document.getElementById("clear-local-storage");

// evento que se ocupa de eliminar el local storage con un aviso y refresh de la tabla
clearLocalStorageButton.addEventListener("click", function() {
    localStorage.removeItem("savedCards");
    alert("Inventario existente eliminado!");
    createTableRows([]);
    savedCards = [];
});