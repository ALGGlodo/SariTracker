/*FOR MODAL*/
const saleModal = document.getElementById("saleModal");
const openSaleButtons = document.querySelectorAll(".open-sale-modal");
const closeModal = document.getElementById("closeModal");
const cancelButton = document.getElementById("cancel");
const salesForm = document.getElementById("saleForm");
const salesTableBody = document.getElementById("salesTableBody");
const salesTotal = document.getElementById("salesTotal");
const todaySalesTotal = document.getElementById("todaySalesTotal");
const productPrice = document.getElementById("productPrice");
const productQuantity = document.getElementById("productQuantity");
const productSubtotal = document.getElementById("productSubtotal");
const productNameInput = document.getElementById("productName");

let sales = JSON.parse(localStorage.getItem("stockMateSales")) || [];

/* DISPLAY SAVED SALES */
function displaySales(){
    salesTableBody.innerHTML = "";

    let totalSales = 0;

    sales.forEach((sale) => {

    const row = salesTableBody.insertRow(0);

    row.insertCell().textContent = sale.dateTime;
    row.insertCell().textContent = sale.productName;
    row.insertCell().textContent = sale.quantity;
    row.insertCell().textContent = `₱${sale.orderPrice.toFixed(2)}`;
    row.insertCell().textContent = `₱${sale.subtotal.toFixed(2)}`;

    totalSales += sale.subtotal;
    });
    salesTotal.textContent = `₱${totalSales.toFixed(2)}`;
    todaySalesTotal.textContent = `₱${totalSales.toFixed(2)}`;
}

function calculateSubtotal() {
    const price = Number(productPrice.value);
    const quantity = Number(productQuantity.value);
    const subtotal = price * quantity;
    productSubtotal.value = subtotal.toFixed(2);
}

productPrice.addEventListener("input", calculateSubtotal);
productQuantity.addEventListener("input", calculateSubtotal);

salesForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const productName = productNameInput.value.trim();
    const orderPrice = Number(productPrice.value);
    const quantity = Number(productQuantity.value);

        if (
        !productName ||
        !Number.isFinite(orderPrice) ||
        orderPrice <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        return;
    }

    const subtotal = orderPrice * quantity;
    const dateTime = new Date().toLocaleString();

    const sale = {
        dateTime,
        productName,
        orderPrice,
        quantity,
        subtotal,
    };

    // Add the newest sale to the beginning of the array
    sales.unshift(sale);

    // Save all sales in the browser
    localStorage.setItem("stockMateSales", JSON.stringify(sales));

    // Refresh the table and totals
    displaySales();

    // Reset the form and close the modal
    salesForm.reset();
    productSubtotal.value = "";
    saleModal.close();
});

/* OPEN MODAL */
openSaleButtons.forEach((button) => {
    button.addEventListener("click", () => {
        saleModal.showModal();
    });
});


/* CLOSE MODAL */
closeModal.addEventListener("click", () => {
    saleModal.close();
});

cancelButton.addEventListener("click", () => {
    saleModal.close();
});


/* DISPLAY SAVED SALES WHEN PAGE LOADS */
displaySales();

/* FOR PRODUCT MANAGEMENT STOCK MODAL */
const productModal = document.getElementById("productModal");
const openProductModalButton = document.getElementById("openProductModal");
const closeProductModalButton = document.getElementById("closeProductModal");
const cancelProductModal = document.getElementById("cancelProductModal");

openProductModalButton.addEventListener("click", () => {
    productModal.showModal();
});

closeProductModalButton.addEventListener("click", () => {
    productModal.close();
});

cancelProductModal.addEventListener("click", () => {
    productModal.close();
});

const productForm = document.getElementById("productForm");
const productsTableBody = document.getElementById("productsTableBody");
//const totalProductsCount = document.getElementById("totalProductsCount");
const lowStockCount = document.getElementById("lowStockCount");

const newProductName = document.getElementById("newProductName");
const newProductPrice = document.getElementById("newProductPrice");
const newProductStock = document.getElementById("newProductStock");

let products = JSON.parse(localStorage.getItem("stockMateProducts")) || [];
let editingProductId = null;

function displayProducts() {
    productsTableBody.innerHTML = "";

    products.forEach((product) => {
        const row = productsTableBody.insertRow();

        row.insertCell().textContent = product.name;
        row.insertCell().textContent = `₱${product.price.toFixed(2)}`;
        row.insertCell().textContent = product.stock;

        const statusCell = row.insertCell();
        const status = document.createElement("span");

        if(product.stock === 0){
            status.textContent = "Out of Stock";
            status.className = "stock-status out-of-stock";
        }else if(product.stock <= 5){
            status.textContent = "Low Stock";
            status.className = "stock-status low-stock";
        }else{
            status.textContent = "In Stock";
            status.className = "stock-status in-stock";
        }
        statusCell.appendChild(status);

        const actionsCell = row.insertCell();

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-product";
        editButton.dataset.id = product.id;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-product";
        deleteButton.dataset.id = product.id;

        actionsCell.append(editButton, deleteButton);
    });

    //totalProductsCount.textContent = products.length;
    
    const lowStockProducts = products.filter((product) => {
    return product.stock >= 1 && product.stock <= 5;
    });

    lowStockCount.textContent = lowStockProducts.length;
}

openProductModalButton.addEventListener("click", () => {
    editingProductId = null;
    productForm.reset();

    document.getElementById("productModalTitle").textContent = "Add Product";
    document.getElementById("saveProductButton").textContent = "Save Product";

    productModal.showModal();
});

productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const productName = newProductName.value.trim();
    const productPrice = Number(newProductPrice.value);
    const productStock = Number(newProductStock.value);

    if(!productName || !Number.isFinite(productPrice) || productPrice <= 0 || !Number.isInteger(productStock) || productStock < 0){
        return;
    }

    if(editingProductId !== null){
        const product = products.find((item) => {
            return item.id === editingProductId;
        });
        if(product){
            product.name = productName;
            product.price = productPrice;
            product.stock = productStock;
        }
    }else{
            const product = {
                id: Date.now(),
                name: productName,
                price: productPrice,
                stock: productStock
            };
            products.unshift(product);
        }
        localStorage.setItem("stockMateProducts", JSON.stringify(products));
        displayProducts();
        productForm.reset();
        editingProductId = null;    
        productModal.close();
    });

productsTableBody.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (!button) return;

    const productId = Number(button.dataset.id);

    if (button.classList.contains("edit-product")) {
        const product = products.find((item) => item.id === productId);

        if (!product) return;

        editingProductId = product.id;

        newProductName.value = product.name;
        newProductPrice.value = product.price;
        newProductStock.value = product.stock;

        document.getElementById("productModalTitle").textContent = "Update Product";
        document.getElementById("saveProductButton").textContent = "Save Changes";

        productModal.showModal();
    }

    if (button.classList.contains("delete-product")) {
        const confirmed = confirm("Are you sure you want to delete this product?");

        if (!confirmed) return;
        
        products = products.filter((product) => {
            return product.id !== productId;
        });

        localStorage.setItem("stockMateProducts", JSON.stringify(products));

        displayProducts();
    }
});

/* LOAD SAVED PRODUCTS WHEN THE PAGE OPENS */

displayProducts();