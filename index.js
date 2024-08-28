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
let uniqueId = 0;

// Filtros
const searchInput = document.getElementById('search');
const statusFilter = document.getElementById('status-filter');
const formatFilter = document.getElementById('format-filter');
const platformFilter = document.getElementById('platform-filter');
const genreFilter = document.getElementById('genre-filter');
const clearFiltersBtn = document.getElementById('clear-filters');

// Aplicar filtros mientras se escriben o cambian
searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);
formatFilter.addEventListener('change', applyFilters);
platformFilter.addEventListener('change', applyFilters);
genreFilter.addEventListener('change', applyFilters);

function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedFormat = formatFilter.value;
    const selectedPlatform = platformFilter.value;
    const selectedGenre = genreFilter.value;

    const allResourceCards = document.querySelectorAll('.resource-card');

    allResourceCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const status = card.querySelector('p:nth-of-type(4)').textContent.split(': ')[1];
        const format = card.querySelector('p:nth-of-type(3)').textContent.split(': ')[1];
        const platform = card.querySelector('p:nth-of-type(2)').textContent.split(': ')[1];
        const genre = card.querySelector('p:nth-of-type(1)').textContent.split(': ')[1];

        // Verificar si todos los filtros coinciden
        const matchesSearch = !searchText || name.includes(searchText);
        const matchesStatus = !selectedStatus || status === selectedStatus;
        const matchesFormat = !selectedFormat || format === selectedFormat;
        const matchesPlatform = !selectedPlatform || platform === selectedPlatform || platform.includes(selectedPlatform);
        const matchesGenre = !selectedGenre || genre === selectedGenre || genre.includes(selectedGenre);

        // Mostrar o esconder la tarjeta según si todos los filtros coinciden
        if (matchesSearch && matchesStatus && matchesFormat && matchesPlatform && matchesGenre) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para limpiar todos los filtros
function clearFilters() {
    searchInput.value = '';
    statusFilter.value = '';
    formatFilter.value = '';
    platformFilter.value = '';
    genreFilter.value = '';

    // Volver a mostrar todas las tarjetas
    const allResourceCards = document.querySelectorAll('.resource-card');
    allResourceCards.forEach(card => {
        card.style.display = 'block';
    });
}

// Evento para limpiar filtros al hacer clic en el botón
clearFiltersBtn.addEventListener('click', clearFilters);

// Generador de IDs únicos
function generateUniqueId() {
    uniqueId += 1;
    return uniqueId;
}

// Abre el modal
addResourceBtn.addEventListener("click", () => {
    addResourceModal.style.display = 'block';
    editingResource = null; // Resetea la edición
});

// Evento para eliminar todos los recursos
deleteAllBtn.addEventListener('click', async () => {
    let confirmDeleteAll = confirm('¿Estás seguro que deseas eliminar todos los recursos?\n¡Esta acción no se puede deshacer!');
    if (confirmDeleteAll) {
        await deleteAllResources();
    }
});

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

// Cargar los recursos desde la API al cargar la página
window.addEventListener('load', async () => {
    await loadResourcesFromApi();
    updateSectionTitlesVisibility();
});

// Toma la información del recurso en el formulario y realiza las validaciones necesarias
addResourceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('resource-name').value;
    const image = document.getElementById('imageLink').value;

    // Recolecta todos los géneros seleccionados
    const genreCheckboxes = document.querySelectorAll('input[name="genre"]:checked');
    const genres = Array.from(genreCheckboxes).map(checkbox => checkbox.value);

    const platform = document.getElementById('resource-platform').value;
    const format = document.getElementById('resource-format').value;
    const status = document.getElementById('resource-status').value;
    const finishDate = document.getElementById('resource-finish-date').value;
    const rating = document.getElementById('resource-rating').value;
    const review = document.getElementById('resource-review').value;

    //Validación de selección de género
    if (genres.length == 0) {
        alert("Debe seleccionar por lo menos un género");
        return;
    }

    // Validación de fecha menor a hoy
    const today = new Date();
    const date = new Date(finishDate);
    if (date > today) {
        alert("Fecha inválida\n¡Por favor intentalo de nuevo!");
        return;
    }

    // Validaciones para el estado Terminado
    if (status === "Terminado") {
        if (!finishDate || !rating || !review) {
            alert("Campos faltantes. Para marcar como terminado, todos los campos de fecha, valoración y reseña deben estar completos.");
            return;
        }
    } else {
        if (finishDate || rating || review) {
            alert("Campos inválidos. No puede haber fecha, valoración o reseña si el estado no es 'terminado'.");
            return;
        }
    }

    const newResource = {
        id: editingResource ? editingResource.id : generateUniqueId(),
        name,
        image,
        genre: genres,
        platform,
        format,
        status,
        finishDate,
        rating,
        review
    };

    if (editingResource) {
        await updateResource(newResource);
    } else {
        await addResource(newResource);
    }

    // Limpia el formulario y cierra el modal
    addResourceForm.reset();
    addResourceModal.style.display = 'none';
});

// Función para agregar un recurso a una categoría específica
function addResourceToCategory(category, resource) {
    const resourceCard = document.createElement('div');
    resourceCard.className = 'resource-card';
    resourceCard.dataset.id = resource.id; // Agregar un atributo de datos único

    resourceCard.innerHTML = `
        <img src="${resource.image}" alt="${resource.name}">
        <h3>${resource.name}</h3>
        <p><strong>Género:</strong> ${resource.genre.join(', ')}</p>
        <p><strong>Plataforma:</strong> ${resource.platform}</p>
        <p><strong>Formato:</strong> ${resource.format}</p>
        <p><strong>Estado:</strong> ${resource.status}</p>
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
    deleteBtn.addEventListener('click', async () => {
        category.removeChild(resourceCard);
        await removeResourceFromApi(resource);
    });

    // Añadir la tarjeta al contenedor de la categoría
    category.appendChild(resourceCard);
}

// Función para agregar un recurso a la categoría correcta
async function addResource(resource) {
    await fetch('https://66ce25c5199b1d628687ec95.mockapi.io/resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resource)
    });

    addResourceToCategory(
        resource.format === 'Serie' ? seriesList :
            resource.format === 'Película' ? moviesList :
                booksList, resource
    );
    updateSectionTitlesVisibility();
}

// Función para editar un recurso
function editResource(card, resource) {
    editingResource = resource;
    document.getElementById('resource-name').value = resource.name;
    document.getElementById('imageLink').value = resource.image

    // Marca las casillas de verificación para los géneros seleccionados
    document.querySelectorAll('input[name="genre"]').forEach(checkbox => {
        checkbox.checked = resource.genre.includes(checkbox.value);
    });

    document.getElementById('resource-platform').value = resource.platform;
    document.getElementById('resource-format').value = resource.format;
    document.getElementById('resource-status').value = resource.status;
    document.getElementById('resource-finish-date').value = resource.finishDate;
    document.getElementById('resource-rating').value = resource.rating;
    document.getElementById('resource-review').value = resource.review;

    // Asegúrate de que el modal esté visible
    addResourceModal.style.display = 'block';
}

// Función para actualizar un recurso
async function updateResource(updatedResource) {
    await fetch(`https://66ce25c5199b1d628687ec95.mockapi.io/resources/${updatedResource.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedResource)
    });

    // Actualiza solo la tarjeta del recurso editado
    const resourceCard = document.querySelector(`.resource-card[data-id="${updatedResource.id}"]`);
    if (resourceCard) {
        resourceCard.innerHTML = `
            <img src="${updatedResource.image}" alt="${updatedResource.name}">
            <h3>${updatedResource.name}</h3>
            <p><strong>Género:</strong> ${updatedResource.genre.join(', ')}</p>
            <p><strong>Plataforma:</strong> ${updatedResource.platform}</p>
            <p><strong>Formato:</strong> ${updatedResource.format}</p>
            <p><strong>Estado:</strong> ${updatedResource.status}</p>
            <p><strong>Fecha de Terminación:</strong> ${updatedResource.finishDate || 'N/A'}</p>
            <p><strong>Valoración:</strong> ${updatedResource.rating ? '⭐'.repeat(updatedResource.rating) : 'N/A'}</p>
            <p><strong>Reseña:</strong> ${updatedResource.review || 'N/A'}</p>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        `;

        // Re-asigna las funcionalidades de editar y eliminar
        resourceCard.querySelector('.edit-btn').addEventListener('click', () => editResource(resourceCard, updatedResource));
        resourceCard.querySelector('.delete-btn').addEventListener('click', async () => {
            resourceCard.parentElement.removeChild(resourceCard); // Remueve la tarjeta del DOM
            await removeResourceFromApi(updatedResource); // Actualiza la API
        });
    }
}

// Función para cargar los recursos desde la API
async function loadResourcesFromApi() {
    const response = await fetch('https://66ce25c5199b1d628687ec95.mockapi.io/resources');
    const storedResources = await response.json();

    storedResources.forEach((resource) => addResourceToCategory(
        resource.format === 'Serie' ? seriesList :
            resource.format === 'Película' ? moviesList :
                booksList, resource
    ));
}

// Función para eliminar un recurso de la API
async function removeResourceFromApi(resource) {
    await fetch(`https://66ce25c5199b1d628687ec95.mockapi.io/resources/${resource.id}`, {
        method: 'DELETE'
    });
    updateSectionTitlesVisibility();
}

// Función para eliminar todos los recursos
async function deleteAllResources() {
    const response = await fetch('https://66ce25c5199b1d628687ec95.mockapi.io/resources');
    const resources = await response.json();

    await Promise.all(resources.map(resource =>
        fetch(`https://66ce25c5199b1d628687ec95.mockapi.io/resources/${resource.id}`, {
            method: 'DELETE'
        })
    ));

    // Limpiar el DOM
    seriesList.innerHTML = '';
    moviesList.innerHTML = '';
    booksList.innerHTML = '';

    updateSectionTitlesVisibility();
}

function updateSectionTitlesVisibility() {
    const seriesTitle = document.getElementById('series-title');
    const moviesTitle = document.getElementById('movies-title');
    const booksTitle = document.getElementById('books-title');

    // Oculta o muestra los títulos dependiendo de si las listas tienen contenido
    seriesTitle.style.display = seriesList.children.length > 0 ? 'block' : 'none';
    moviesTitle.style.display = moviesList.children.length > 0 ? 'block' : 'none';
    booksTitle.style.display = booksList.children.length > 0 ? 'block' : 'none';
}
