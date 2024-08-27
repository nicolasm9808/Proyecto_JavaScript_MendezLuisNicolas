// Variables para los elementos del DOM
const addResourceBtn = document.getElementById('add-resource-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const addResourceModal = document.getElementById('add-resource-modal');
const closeModalBtn = document.querySelector('.close-btn');
const addResourceForm = document.getElementById('add-resource-form');
const seriesList = document.getElementById('series-list');
const moviesList = document.getElementById('movies-list');
const booksList = document.getElementById('books-list');

let editingResource = null; // Variable para guardar el recurso que se está editando
let uniqueId = 0
// Generador de IDs únicos
function generateUniqueId() {
    uniqueId += 1
};

// Abre el modal
addResourceBtn.addEventListener("click", () => {
    addResourceModal.style.display = 'block';
    editingResource = null; // Resetea la edición
});

// Evento para eliminar todos los recursos
deleteAllBtn.addEventListener('click', () => {
    let confirmDeleteAll = confirm('¿Estás seguro que deseas eliminar todos los recursos?\n¡Esta acción no se puede deshacer!')
    if (confirmDeleteAll) {
        deleteAllResources();
    }
})

// Cierra el modal
closeModalBtn.addEventListener('click', () => {
    addResourceModal.style.display = 'none';
});

// Cierra el modal si se hace clic fuera del contenido del modal
window.addEventListener('click', (event) => {
    if (event.target === addResourceModal) {
        addResourceModal.style.display = 'none';
    }
});

// Cargar los recursos desde localStorage al cargar la página
window.addEventListener('load', () => {
    loadResourcesFromLocalStorage();
});

// Toma la información del recurso en el formulario y realiza las validaciones necesarias
addResourceForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('resource-name').value;
    const genre = document.getElementById('resource-genre').value;
    const platform = document.getElementById('resource-platform').value;
    const status = document.getElementById('resource-status').value;
    const format = document.getElementById('resource-format').value;
    const finishDate = document.getElementById('resource-finish-date').value;
    const rating = document.getElementById('resource-rating').value;
    const review = document.getElementById('resource-review').value;
    
    const newResource = {
        id: editingResource ? editingResource.id : generateUniqueId(),
        name,
        genre,
        platform,
        status,
        finishDate,
        rating,
        review,
        format
    };

    //Validación de fecha menor a hoy
    var today = new Date();
    var date = new Date(finishDate);
    if (date > today) {
        alert("Fecha inválida\n¡Por favor intentelo de nuevo!")
        .break
    }

    //Validaciones para el estado Terminado
    if (status === "terminado") {
        if (finishDate && rating && review) {
            applyChanges(newResource);
        } else {
            alert("Campos faltantes en el formulario\n¡Por favor intentelo de nuevo!")
            .break
        }
    } else {
        if (finishDate || rating || review) {
            alert("Campos inválidos, aún no ha terminado el recurso\n¡Por favor intentelo de nuevo!")
            .break
        } else {
            applyChanges(newResource);
        }
    }
    
});

//Función para aplicar los cambios después de las validaciones del formulario para agregar o editar un recurso
function applyChanges(newResource){
    if (editingResource) {
        // Actualiza el recurso existente
        updateResource(newResource);
    } else {
        // Agrega un nuevo recurso
        addResource(newResource);
    }

    // Limpia el formulario y cierra el modal
    addResourceForm.reset();
    addResourceModal.style.display = 'none';
    saveResourcesToLocalStorage(); // Guarda los cambios en localStorage
}

// Función para agregar un recurso a una categoría específica
function addResourceToCategory(category, resource) {
    const resourceCard = document.createElement('div');
    resourceCard.className = 'resource-card';
    resourceCard.dataset.id = resource.id; // Agregar un atributo de datos único

    resourceCard.innerHTML = `
        <h3>${resource.name}</h3>
        <p><strong>Género:</strong> ${resource.genre}</p>
        <p><strong>Plataforma:</strong> ${resource.platform}</p>
        <p><strong>Estado:</strong> ${resource.status}</p>
        <p><strong>Formato:</strong> ${resource.format}</p>
        <p><strong>Fecha de Terminación:</strong> ${resource.finishDate || 'N/A'}</p>
        <p><strong>Valoración:</strong> ${resource.rating ? '⭐'.repeat(resource.rating) : 'N/A'}</p>
        <p><strong>Reseña:</strong> ${resource.review || 'N/A'}</p>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
    `;

    // Añadir funcionalidad de editar y eliminar
    const editBtn = resourceCard.querySelector('.edit-btn');
    const deleteBtn = resourceCard.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => editResource(resourceCard, resource));
    deleteBtn.addEventListener('click', () => {
        category.removeChild(resourceCard);
        removeResourceFromLocalStorage(resource);
    });

    // Añadir la tarjeta al contenedor de la categoría
    category.appendChild(resourceCard);
}

// Función para agregar un recurso a la categoría correcta
function addResource(resource) {
    if (resource.format === 'serie') {
        addResourceToCategory(seriesList, resource);
    } else if (resource.format === 'pelicula') {
        addResourceToCategory(moviesList, resource);
    } else if (resource.format === 'libro') {
        addResourceToCategory(booksList, resource);
    }
}

// Función para editar un recurso, abre el modal e ingresa los datos pre existentes
function editResource(card, resource) {
    editingResource = resource;
    document.getElementById('resource-name').value = resource.name;
    document.getElementById('resource-genre').value = resource.genre;
    document.getElementById('resource-platform').value = resource.platform;
    document.getElementById('resource-status').value = resource.status;
    document.getElementById('resource-format').value = resource.format;
    document.getElementById('resource-finish-date').value = resource.finishDate;
    document.getElementById('resource-rating').value = resource.rating;
    document.getElementById('resource-review').value = resource.review;

    addResourceModal.style.display = 'block';
}

// Función para actualizar un recurso
function updateResource(updatedResource) {
    // Actualiza el objeto de recurso
    editingResource = updatedResource;

    // Guarda los cambios en localStorage
    saveResourcesToLocalStorage(); 

    // Actualiza el DOM directamente
    const resourceCards = document.querySelectorAll('.resource-card');
    resourceCards.forEach((card) => {
        const cardId = card.dataset.id;
        if (cardId === updatedResource.id) { // Comparar con el identificador único
            card.innerHTML = `
                <h3>${updatedResource.name}</h3>
                <p><strong>Género:</strong> ${updatedResource.genre}</p>
                <p><strong>Plataforma:</strong> ${updatedResource.platform}</p>
                <p><strong>Estado:</strong> ${updatedResource.status}</p>
                <p><strong>Formato:</strong> ${updatedResource.format}</p>
                <p><strong>Fecha de Terminación:</strong> ${updatedResource.finishDate || 'N/A'}</p>
                <p><strong>Valoración:</strong> ${updatedResource.rating ? '⭐'.repeat(updatedResource.rating) : 'N/A'}</p>
                <p><strong>Reseña:</strong> ${updatedResource.review || 'N/A'}</p>
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Eliminar</button>
            `;

            // Re-asigna las funcionalidades de editar y eliminar
            card.querySelector('.edit-btn').addEventListener('click', () => editResource(card, updatedResource));
            card.querySelector('.delete-btn').addEventListener('click', () => {
                card.parentElement.removeChild(card); // Remueve la tarjeta del DOM
                removeResourceFromLocalStorage(updatedResource); // Actualiza localStorage
            });
        }
    });
}

// Función para guardar los recursos en localStorage
function saveResourcesToLocalStorage() {
    const resources = {
        series: [],
        movies: [],
        books: []
    };

    document.querySelectorAll('.resource-card').forEach((card) => {
        var cardRating = card.querySelector('p:nth-of-type(6)').textContent.split(': ')[1];
        if (cardRating === "N/A") {
            cardRating = "";
        } else{
            cardRating = cardRating.length;
        }

        const resource = {
            id: card.dataset.id,
            name: card.querySelector('h3').textContent,
            genre: card.querySelector('p:nth-of-type(1)').textContent.split(': ')[1],
            platform: card.querySelector('p:nth-of-type(2)').textContent.split(': ')[1],
            status: card.querySelector('p:nth-of-type(3)').textContent.split(': ')[1],
            format: card.querySelector('p:nth-of-type(4)').textContent.split(': ')[1],
            finishDate: card.querySelector('p:nth-of-type(5)').textContent.split(': ')[1],
            rating: cardRating,
            review: card.querySelector('p:nth-of-type(7)').textContent.split(': ')[1]
        };

        if (resource.format === 'serie') {
            resources.series.push(resource);
        } else if (resource.format === 'pelicula') {
            resources.movies.push(resource);
        } else if (resource.format === 'libro') {
            resources.books.push(resource);
        }
    });

    localStorage.setItem('resources', JSON.stringify(resources));
}

// Función para cargar los recursos desde localStorage
function loadResourcesFromLocalStorage() {
    const storedResources = JSON.parse(localStorage.getItem('resources'));

    if (storedResources) {
        storedResources.series.forEach((resource) => addResourceToCategory(seriesList, resource));
        storedResources.movies.forEach((resource) => addResourceToCategory(moviesList, resource));
        storedResources.books.forEach((resource) => addResourceToCategory(booksList, resource));
    }
}

// Función para eliminar un recurso de localStorage
function removeResourceFromLocalStorage(resource) {
    const storedResources = JSON.parse(localStorage.getItem('resources'));

    if (storedResources) {
        if (resource.format === 'serie') {
            storedResources.series = storedResources.series.filter((item) => item.id !== resource.id);
        } else if (resource.format === 'pelicula') {
            storedResources.movies = storedResources.movies.filter((item) => item.id !== resource.id);
        } else if (resource.format === 'libro') {
            storedResources.books = storedResources.books.filter((item) => item.id !== resource.id);
        }

        localStorage.setItem('resources', JSON.stringify(storedResources));
    }
}

//Función para eliminar todos los recursos
function deleteAllResources(){
    seriesList.innerHTML = '';
    moviesList.innerHTML = '';
    booksList.innerHTML = '';

    localStorage.removeItem('resources');
}