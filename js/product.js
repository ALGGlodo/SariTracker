const API_URL = "http://localhost:3000/api/products";

let editingProductId = null;
let allProducts = [];
let selectedCategory = "All";

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
        
        allProducts = await response.json();
        
        displayProducts(allProducts);

    }catch(error){
         console.error("Error fetching products:", error);
    }
}
fetchProducts();

function applyFilters(){
    const searchValue = searchProduct.value.toLowerCase().trim();
    const filteredProducts = allProducts.filter(product => 
        (product.product_name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue)) &&
        (selectedCategory === "All" || (product.category === selectedCategory))
    );
    displayProducts(filteredProducts);
}

addProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newProduct = {
        product_name: productNameInput.value.trim(),
        category: productCategoryInput.value.trim(),
        price: Number(productPriceInput.value)
    };
    try{
        const url = editingProductId ? `${API_URL}/${editingProductId}` : API_URL;

        const method = editingProductId ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProduct)
        })

        const result = await response.json();
        if(!response.ok){
            throw new Error(result.message || "Failed to add product.");
        }
        console.log("Product saved:", result);
        
        addProductForm.reset();
        editingProductId = null;

        fetchProducts();
    }catch(error){
        console.error("Error adding product:", error);
    }
});
    


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
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.dataset.id = product.id;

        actionCell.appendChild(editBtn);

        editBtn.addEventListener("click", () => {
            const selectedProduct = products.find(item => item.id === product.id)

            editingProductId = selectedProduct.id;

            productNameInput.value = selectedProduct.product_name;
            productCategoryInput.value = selectedProduct.category;
            productPriceInput.value = selectedProduct.price;
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.id = product.id;

        actionCell.appendChild(deleteBtn);

        deleteBtn.addEventListener("click", async () => {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${product.id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete product.");
        }

        fetchProducts();

        } catch (error) {
            console.error("Error deleting product:", error);
        }
    });

  

        row.appendChild(nameCell);
        row.appendChild(priceCell);
        row.appendChild(actionCell);

        productsTable.appendChild(row);
    });
}

 
//FOR FILTERING PRODUCTS BY CATEGORY
const filterButtons = document.getElementById("filter-button");
const filterOptions = document.getElementById("filterOptions");
const searchProduct = document.getElementById("searchProduct");

searchProduct.addEventListener("input", () => {
    applyFilters();
})

filterButtons.addEventListener("click", () => {
    filterOptions.hidden = !filterOptions.hidden;
});

const categoryBtn = filterOptions.querySelectorAll("button");

categoryBtn.forEach(button => {
    button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;

        filterButtons.textContent = selectedCategory === "All"
        ? "All Categories"
        : selectedCategory;

        filterOptions.hidden = true;
        applyFilters();

        const filteredProducts = selectedCategory === "All" ? allProducts : allProducts.filter
        (product => product.category === selectedCategory);

        displayProducts(filteredProducts);
    });
});
