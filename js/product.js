const API_URL = "http://localhost:3000/api/products";

const productsTable = document.getElementById('productsTable');

const addProductForm  = document.getElementById('addProductForm');
const productNameInput = document.getElementById("productName");
const productCategoryInput = document.getElementById('productsCategory');
const productPriceInput = document.getElementById('productPrice');

async function fetchProducts() {
    try{
        const response = await fetch(API_URL);
        if(!response.ok){
            throw new Error("Failed to retrieve products.");
        }
        const products = await response.json();
        
        displayProducts(products);
    }catch(error){
         console.error("Error fetching products:", error);
    }
}
fetchProducts();

addProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newProduct = {
        product_name: productNameInput.value.trim(),
        category: productCategoryInput.value.trim(),
        price: Number(productPriceInput.value)
    };
    try{
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProduct)
        });
        const result = await response.json();
        if(!response.ok){
            throw new Error(result.message || "Failed to add product.");
        }
        console.log("Product added:", result);
        
        addProductForm.reset();

        fetchProducts();
    }catch(error){
        console.error("Error adding product:", error);
    }
})

function displayProducts(products){
    productsTable.replaceChildren(); // Clear existing rows

    if(products.length === 0){
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 3;
        cell.textContent = "No products available.";

        row.appendChild(cell);
        productsTable.appendChild(row);

        return;
    }

    products.forEach(product => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const priceCell = document.createElement("td");
        const actionCell = document.createElement("td");

        nameCell.textContent = `${product.product_name} (${product.category})`;
        priceCell.textContent = `₱${Number(product.price).toFixed(2)}`;
        actionCell.textContent = "Comming Soon";

        row.appendChild(nameCell);
        row.appendChild(priceCell);
        row.appendChild(actionCell);

        productsTable.appendChild(row);
    });
}