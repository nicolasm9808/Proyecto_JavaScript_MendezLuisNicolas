// Variables para los elementos del DOM
const addResourceBtn = document.getElementById('add-resource-btn');
const addResourceModal = document.getElementById('add-resource-modal');
const closeModalBtn = document.querySelector('.close-btn');
const addResourceForm = document.getElementById('add-resource-form');
const seriesList = document.getElementById('series-list');
const moviesList = document.getElementById('movies-list');
const booksList = document.getElementById('books-list');

// Abre el modal
addResourceBtn.addEventListener('click', () => {
    addResourceModal.style.display = 'block';
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

// Maneja el envío del formulario para agregar un recurso
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

    if (format === 'serie') {
        addResourceToCategory(seriesList, name, genre, platform, status, finishDate, rating, review, format);
    } else if (format === 'pelicula') {
        addResourceToCategory(moviesList, name, genre, platform, status, finishDate, rating, review, format);
    } else if (format === 'libro') {
        addResourceToCategory(booksList, name, genre, platform, status, finishDate, rating, review, format);
    }

    // Limpia el formulario y cierra el modal
    addResourceForm.reset();
    addResourceModal.style.display = 'none';
});

// Función para agregar un recurso a una categoría específica
function addResourceToCategory(category, name, genre, platform, status, finishDate, rating, review, format) {
    const resourceCard = document.createElement('div');
    resourceCard.className = 'resource-card';

    resourceCard.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Género:</strong> ${genre}</p>
        <p><strong>Plataforma:</strong> ${platform}</p>
        <p><strong>Estado:</strong> ${status}</p>
        <p><strong>Formato:</strong> ${format}</p>
        <p><strong>Fecha de Terminación:</strong> ${finishDate || 'N/A'}</p>
        <p><strong>Valoración:</strong> ${rating ? '⭐'.repeat(rating) : 'N/A'}</p>
        <p><strong>Reseña:</strong> ${review || 'N/A'}</p>
    `;

    category.appendChild(resourceCard);

    // Guardar en LocalStorage
    saveResourceToLocalStorage(name, genre, platform, status, finishDate, rating, review, format);
}

function saveResourceToLocalStorage(name, genre, platform, status, finishDate, rating, review, format) {
    const resources = JSON.parse(localStorage.getItem('resources')) || [];
    const resource = { name, genre, platform, status, finishDate, rating, review, format };
    resources.push(resource);
    localStorage.setItem('resources', JSON.stringify(resources));
}

function loadResourcesFromLocalStorage() {
    const resources = JSON.parse(localStorage.getItem('resources')) || [];

    resources.forEach(resource => {
        const { name, genre, platform, status, finishDate, rating, review, format } = resource;

        if (format === 'serie') {
            addResourceToCategory(seriesList, name, genre, platform, status, finishDate, rating, review, format);
        } else if (format === 'pelicula') {
            addResourceToCategory(moviesList, name, genre, platform, status, finishDate, rating, review, format);
        } else if (format === 'libro') {
            addResourceToCategory(booksList, name, genre, platform, status, finishDate, rating, review, format);
        }
    });
}

// Llamar a la función cuando se carga la página
window.addEventListener('load', loadResourcesFromLocalStorage);

// Filtrado y búsqueda (puedes extender esto según tus necesidades)
const searchInput = document.getElementById('search');
const statusFilter = document.getElementById('status-filter');
const formatFilter = document.getElementById('format-filter');
const platformFilter = document.getElementById('platform-filter');

searchInput.addEventListener('input', filterResources);
statusFilter.addEventListener('change', filterResources);
formatFilter.addEventListener('change', filterResources);
platformFilter.addEventListener('change', filterResources);

function filterResources() {
    const searchValue = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value.toLowerCase();
    const formatValue = formatFilter.value.toLowerCase();
    const platformValue = platformFilter.value.toLowerCase();

    filterCategory(seriesList, searchValue, statusValue, formatValue, platformValue);
    filterCategory(moviesList, searchValue, statusValue, formatValue, platformValue);
    filterCategory(booksList, searchValue, statusValue, formatValue, platformValue);
}

function filterCategory(category, searchValue, statusValue, formatValue, platformValue) {
    const cards = category.getElementsByClassName('resource-card');

    for (let card of cards) {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const status = card.querySelector('p:nth-of-type(4)').textContent.toLowerCase();
        const format = card.querySelector('p:nth-of-type(3)').textContent.toLowerCase();
        const platform = card.querySelector('p:nth-of-type(2)').textContent.toLowerCase();

        const matchesSearch = name.includes(searchValue);
        const matchesStatus = statusValue === 'all' || status.includes(statusValue);
        const matchesFormat = formatValue === 'all' || format.includes(formatValue);
        const matchesPlatform = platformValue === 'all' || platform.includes(platformValue);

        if (matchesSearch && matchesStatus && matchesFormat && matchesPlatform) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    }
}