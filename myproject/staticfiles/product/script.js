let exchangeRateUSD;
let exchangeRateEUR;

async function fetchExchangeRates() {
    let responseUSD = await fetch('https://mindicador.cl/api/dolar');
    let dataUSD = await responseUSD.json();
    exchangeRateUSD = dataUSD.serie[0].valor;

    let responseEUR = await fetch('https://mindicador.cl/api/euro');
    let dataEUR = await responseEUR.json();
    exchangeRateEUR = dataEUR.serie[0].valor;
}

async function fetchProducts() {
    let response = await fetch('/api/productos/');
    let products = await response.json();
    return products;
}

function renderProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        const productImage = document.createElement('img');
        productImage.src = product.imagen ? product.imagen : '/static/product/default_image.jpg';
        productImage.alt = product.nombre;

        const productName = document.createElement('div');
        productName.classList.add('product-name');
        productName.textContent = `Nombre: ${product.nombre}`;

        const productMarca = document.createElement('div');
        productMarca.classList.add('product-marca');
        productMarca.textContent = `Marca: ${product.marca}`;

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
}

async function applyFilters() {
    let query = document.getElementById('search').value.toLowerCase();
    let sortOption = document.getElementById('sort').value;

    let products = await fetchProducts();
    let filteredProducts = products.filter(product => product.nombre.toLowerCase().includes(query));

    switch (sortOption) {
        case 'precio_asc':
            filteredProducts.sort((a, b) => a.precio_valor - b.precio_valor);
            break;
        case 'precio_desc':
            filteredProducts.sort((a, b) => b.precio_valor - a.precio_valor);
            break;
        case 'marca_asc':
            filteredProducts.sort((a, b) => a.marca.localeCompare(b.marca));
            break;
        case 'marca_desc':
            filteredProducts.sort((a, b) => b.marca.localeCompare(a.marca));
            break;
        case 'tipo_asc':
            filteredProducts.sort((a, b) => a.tipo.localeCompare(b.tipo));
            break;
        case 'tipo_desc':
            filteredProducts.sort((a, b) => b.tipo.localeCompare(a.tipo));
            break;
        case 'stock_asc':
            filteredProducts.sort((a, b) => a.stock - b.stock);
            break;
        case 'stock_desc':
            filteredProducts.sort((a, b) => b.stock - a.stock);
            break;
        default:
            break;
    }

    renderProducts(filteredProducts);
    convertPrices();
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

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('sort').addEventListener('change', applyFilters);

document.addEventListener('DOMContentLoaded', async function () {
    await fetchExchangeRates();
    applyFilters();
});
