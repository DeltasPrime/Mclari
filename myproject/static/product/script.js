let exchangeRateUSD;
let exchangeRateEUR;
let currentPage = 1;
let totalPages = 1;

async function fetchExchangeRates() {
    let responseUSD = await fetch('https://mindicador.cl/api/dolar');
    let dataUSD = await responseUSD.json();
    exchangeRateUSD = dataUSD.serie[0].valor;

    let responseEUR = await fetch('https://mindicador.cl/api/euro');
    let dataEUR = await responseEUR.json();
    exchangeRateEUR = dataEUR.serie[0].valor;
}

async function fetchProducts(page = 1, search = '', sort = '') {
    let url = `/api/productos/?page=${page}`;
    if (search) {
        url += `&search=${search}`;
    }
    if (sort) {
        url += `&sort=${sort}`;
    }
    let response = await fetch(url);
    let data = await response.json();
    totalPages = Math.ceil(data.count / 9); 
    return data;
}

function renderProducts(data) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    data.results.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        const productImage = document.createElement('img');
        productImage.src = product.imagen ? product.imagen : '/static/product/default_image.jpg';
        productImage.alt = product.nombre;

        const productName = document.createElement('div');
        productName.classList.add('product-name');
        productName.textContent = product.nombre; 

        const productMarca = document.createElement('div');
        productMarca.classList.add('product-marca');
        productMarca.textContent = ` ${product.marca}`;

        const productPrecioCLP = document.createElement('div');
        productPrecioCLP.classList.add('product-precio', 'price-clp');
        productPrecioCLP.textContent = `Precio: $${product.precio_valor} CLP`;

        const productPrecioUSD = document.createElement('div');
        productPrecioUSD.classList.add('product-precio', 'price-usd');
        productPrecioUSD.style.display = 'none';

        const productPrecioEUR = document.createElement('div');
        productPrecioEUR.classList.add('product-precio', 'price-eur');
        productPrecioEUR.style.display = 'none';

        const productStock = document.createElement('div');
        productStock.classList.add('product-stock');
        productStock.textContent = `Stock: ${product.stock}`;

        const productTipo = document.createElement('div');
        productTipo.classList.add('product-tipo');
        productTipo.textContent = `Tipo: ${product.tipo}`;

        productCard.appendChild(productImage);
        productCard.appendChild(productName);
        productCard.appendChild(productMarca);
        productCard.appendChild(productPrecioCLP);
        productCard.appendChild(productPrecioUSD);
        productCard.appendChild(productPrecioEUR);
        productCard.appendChild(productStock);
        productCard.appendChild(productTipo);

        productList.appendChild(productCard);
    });
    renderPagination();
    convertPrices(); 
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.onclick = () => changePage(currentPage - 1);
        pagination.appendChild(prevButton);
    }

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    pagination.appendChild(pageInfo);

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.onclick = () => changePage(currentPage + 1);
        pagination.appendChild(nextButton);
    }
}

function changePage(page) {
    currentPage = page;
    applyFilters();
}

async function applyFilters() {
    let query = document.getElementById('search').value.toLowerCase();
    let sortOption = document.getElementById('sort').value;

    let products = await fetchProducts(currentPage, query, sortOption);

    renderProducts(products);
}

function convertPrices() {
    const currency = document.getElementById('currency').value;
    const pricesCLP = document.querySelectorAll('.price-clp');
    const pricesUSD = document.querySelectorAll('.price-usd');
    const pricesEUR = document.querySelectorAll('.price-eur');
    
    pricesCLP.forEach((priceCLP, index) => {
        const priceUSD = pricesUSD[index];
        const priceEUR = pricesEUR[index];
        const clpValue = parseFloat(priceCLP.textContent.replace('Precio: $', '').replace(' CLP', ''));
        
        if (currency === 'USD') {
            const usdValue = (clpValue / exchangeRateUSD).toFixed(2);
            priceUSD.textContent = `Precio: $${usdValue} USD`;
            priceCLP.style.display = 'none';
            priceUSD.style.display = 'inline';
            priceEUR.style.display = 'none';
        } else if (currency === 'EUR') {
            const eurValue = (clpValue / exchangeRateEUR).toFixed(2);
            priceEUR.textContent = `Precio: €${eurValue} EUR`;
            priceCLP.style.display = 'none';
            priceUSD.style.display = 'none';
            priceEUR.style.display = 'inline';
        } else {
            priceCLP.style.display = 'inline';
            priceUSD.style.display = 'none';
            priceEUR.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const formData = new FormData(addProductForm);
            const messageDiv = document.getElementById('message');

            fetch('/api/productos/', {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                messageDiv.textContent = 'Producto agregado con éxito';
                messageDiv.style.color = 'green';
                
                setTimeout(() => {
                    window.location.href = '/api/';
                }, 2000);
            })
            .catch((error) => {
                console.error('Error:', error);
                messageDiv.textContent = 'Error al agregar el producto';
                messageDiv.style.color = 'red';
            });
        });
    }
});

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('sort').addEventListener('change', applyFilters);

document.addEventListener('DOMContentLoaded', async function () {
    await fetchExchangeRates();
    applyFilters();
});
