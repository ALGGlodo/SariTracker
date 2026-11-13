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
const productModal = document.getElementById("productModal");
const closeProductModalButton = document.getElementById("closeProductModal");
const cancelProductModal = document.getElementById("cancelProductModal");
const productForm = document.getElementById("productForm");
const productsTableBody = document.getElementById("productsTableBody");
const totalProductsCount = document.getElementById("totalProductsCount");
const lowStockCount = document.getElementById("lowStockCount");
const newProductName = document.getElementById("newProductName");
const newProductCategory = document.getElementById("newProductCategory");
const newProductPrice = document.getElementById("newProductPrice");
const newProductStock = document.getElementById("newProductStock");
const dashboardTotalProducts = document.getElementById("dashboardTotalProducts");
const dashboardLowStock = document.getElementById("dashboardLowStock");
const customerBalanceDialog = document.getElementById("customerBalance");
const openBalanceModalButtons = document.querySelectorAll(".open-balance-modal");
const closeBalanceModal = document.getElementById("closeBalanceModal");
const customerBalanceForm = document.getElementById("customerBalanceForm");
const customerNameInput = document.getElementById("customerName");
const productBalanceInput = document.getElementById("productBalance")
const originalAmountInput = document.getElementById("originalAmount");
const customerBalanceList = document.getElementById("customerBalanceList");
const unpaidBalanceTableBody = document.getElementById("unpaidBalanceTableBody");
const totalUnpaidBalance = document.getElementById("totalUnpaidBalance");
const customersWithBalance = document.getElementById("customersWithBalance");
const paymentsReceivedToday = document.getElementById("paymentsReceivedToday");
//FOR SEARCH AND FILTER IN THE PRODUCT MANAGEMENT SECTION OF THE DASHBOARD
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.querySelectorAll(".category-filter");

let selectedStockStatus = "all";
// Set the default selected stock status
let sales = JSON.parse(localStorage.getItem("stockMateSales")) || [];
sales = sales.map((sale, index) => ({
    ...sale,
    id: sale.id ?? Date.now() + index
}));
localStorage.setItem("stockMateSales", JSON.stringify(sales));

/* DISPLAY SAVED SALES */
function displaySales(){
    salesTableBody.innerHTML = "";

    let total = 0;

    const todaySales = sales.filter((sale) => {
        const saleDate = new Date(sale.dateTime);
        const today = new Date();

        return (
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear()
        );
    });

    todaySales.forEach((sale) => {
        const row = salesTableBody.insertRow(0);

    row.insertCell().textContent = sale.dateTime;
    row.insertCell().textContent = sale.productName;
    row.insertCell().textContent = sale.quantity;
    row.insertCell().textContent = `₱${sale.orderPrice.toFixed(2)}`;
    row.insertCell().textContent = `₱${sale.subtotal.toFixed(2)}`;

    const actionCell = row.insertCell();

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "edit-sale";
    editButton.dataset.id = sale.id;
    console.log("Clicked button:", editButton.className, "Sale ID:", sale.id);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-sale";
    deleteButton.dataset.id = sale.id;

    actionCell.append(editButton, deleteButton);

    total += Number(sale.subtotal || 0);
    });
    salesTotal.textContent = `₱${total.toFixed(2)}`;

    const today = new Date();

    const todaysSales = sales.filter((sale) => {
        const saleDate = new Date(sale.dateTime);

        return(
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear()
        );
    });


    const todaysTotal = todaysSales.reduce((total, sale) => {
        return total + Number(sale.subtotal || 0);
    }, 0);
    todaySalesTotal.textContent = `₱${todaysTotal.toFixed(2)}`;
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
        id: Date.now(),
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

salesTableBody.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if(!button) return;

    const saleId = Number(button.dataset.id);
    console.log("Clicked button:", button.className, "Sale ID:", saleId);

    if(button.classList.contains("edit-sale")){
        const sale = sales.find((item) => item.id === saleId);

        if(!sale) return

        productNameInput.value = sale.productName;
        productPrice.value = sale.orderPrice;
        productQuantity.value = sale.quantity;

        productSubtotal.value = (sale.orderPrice * sale.quantity).toFixed(2);

        editingSaleId = sale.id;

        saleModal.showModal();
    }

    if(button.classList.contains("delete-sale")){
        const confirmed = confirm("Are you sure you want to delete this sale?");

        if(!confirmed) return;

        sales = sales.filter(sale => sale.id !== saleId);

        localStorage.setItem("stockMatesSales", JSON.stringify(sales));

        displaySales();
    }
});

/* FOR PRODUCT MANAGEMENT STOCK MODAL */
closeProductModalButton.addEventListener("click", () => {
    productModal.close();
});

cancelProductModal.addEventListener("click", () => {
    productModal.close();
});

let products = [];
let editingProductId = null;

const PRODUCTS_API_URL = "http://localhost:3000/api/products";

async function fetchDashboardProducts(){
    try{
        const response = await fetch(PRODUCTS_API_URL);

        if(!response.ok){
            throw new Error("Failed to retrieve products from the server.");
        }
        products = await response.json();

        displayProducts();
    }catch(error){
        console.error("Error fetching dashboard products:", error);
    }
}

function applyProductFilters() {
    const searchValue = searchInput.value.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);
    
    const stock = Number(product.stock);

    const matchedStatus = selectedStockStatus === "all" ||
    (selectedStockStatus === "in-stock" && stock > 5) ||
    (selectedStockStatus === "low-stock" && stock >= 1 && stock <= 5) ||
    (selectedStockStatus === "out-of-stock" && stock === 0);

    return matchesSearch && matchedStatus;
    });
    displayProducts(filteredProducts);
}

searchInput.addEventListener("input", () => {
    applyProductFilters();
});
categoryFilters.forEach((button) => {
    button.addEventListener("click", () => {
        selectedStockStatus = button.dataset.status;

        applyProductFilters();
    });
});

function displayProducts(productsToDisplay = products){
    productsTableBody.innerHTML = "";

    productsToDisplay.forEach((product) => {
        const row = productsTableBody.insertRow();

        row.insertCell().textContent = product.product_name;
        row.insertCell().textContent = product.category;
        row.insertCell().textContent = `₱${Number(product.price).toFixed(2)}`;
        row.insertCell().textContent = product.stock;

        const statusCell = row.insertCell();
        const status = document.createElement("span");

        if(product.stock === 0){
            status.textContent = "Out of Stock";
            status.className = "stock-status out-of-stock";
        }else if(product.stock >= 1 && product.stock <= 5){
            status.textContent = "Low Stock";
            status.className = "stock-status low-stock";
        }else{
            status.textContent = "In Stock";
            status.className = "stock-status in-stock";
        }
        statusCell.appendChild(status);

        const actionsCell = row.insertCell();
        actionsCell.classList.add("sale-actions");

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

    totalProductsCount.textContent = products.length;
    dashboardTotalProducts.textContent = `${products.length} Products`;

    const lowStockProducts = products.filter((product) => {
        return product.stock >= 1 && product.stock <= 5;
    });
    lowStockCount.textContent = lowStockProducts.length;
    dashboardLowStock.textContent = `${lowStockProducts.length} Products`;
}

const openProductModalButtons = document.querySelectorAll(".open-product-modal");

openProductModalButtons.forEach(button => {
    button.addEventListener("click", () => {
        editingProductId = null;
        productForm.reset();

        document.getElementById("productModalTitle").textContent = "Add Product";
        document.getElementById("saveProductButton").textContent = "Save Product";

        productModal.showModal();
    });
});

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productName = newProductName.value.trim();
    const productCategory = newProductCategory.value;
    const productPrice = Number(newProductPrice.value);
    const productStock = Number(newProductStock.value);

    if(!productName || !productCategory || !Number.isFinite(productPrice) || productPrice <= 0 || !Number.isInteger(productStock) || productStock < 0){
        return;
    }

    const newProduct = {
        product_name: productName,
        category: productCategory,
        price: productPrice,
        stock: productStock
    }

    try{

        const url = editingProductId !== null ? `${PRODUCTS_API_URL}/${editingProductId}` : PRODUCTS_API_URL;

        const method = editingProductId !== null ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProduct)
        });

        const result = await response.json();

        if(!response.ok){
            throw new Error(result.error || "Failed to save product.");
        }
        console.log("Product saved successfully:", result);

        productForm.reset();
        editingProductId = null;
        productModal.close();

        await fetchDashboardProducts();
    }catch(error){
        console.error("Error adding product:", error);
        }
    });

productsTableBody.addEventListener("click", async (e) => {
    const button = e.target.closest("button");

    if (!button) return;

    const productId = Number(button.dataset.id);

    if (button.classList.contains("edit-product")) {
        const product = products.find((item) => item.id === productId);

        if (!product) return;

        editingProductId = product.id;

        newProductName.value = product.product_name;
        newProductCategory.value = product.category;
        newProductPrice.value = product.price;
        newProductStock.value = product.stock;

        document.getElementById("productModalTitle").textContent = "Update Product";
        document.getElementById("saveProductButton").textContent = "Save Changes";

        productModal.showModal();
    }

    if (button.classList.contains("delete-product")) {
        const confirmed = confirm("Are you sure you want to delete this product?");

        if (!confirmed) return;
        
        try{
            const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
               method: "DELETE" 
            });

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.error || "Failed to delete product.");
            }

            await fetchDashboardProducts();
        }catch(error){
            console.log("Error deleting product:", error);
        }
    }
});

/* LOAD SAVED PRODUCTS WHEN THE PAGE OPENS */
fetchDashboardProducts();

/* CUSTOMER BALANCES SECTION */
let customerBalances = JSON.parse(localStorage.getItem("stockMateBalances")) || [];

customerBalances = customerBalances.map((entry, index) => ({
    ...entry,
    id: entry.id ??  Date.now() + index,
    payments: entry.payments || [],
    remainingBalance: Number(entry.remainingBalance ?? entry.originalAmount)
}));

function saveCustomerBalances(){
    localStorage.setItem(
        "stockMateBalances",
        JSON.stringify(customerBalances)
    );
}
function formatPeso(amount){
    return `${Number(amount).toFixed(2)}`;
}
function getBalanceStatus(entry){
    if(entry.remainingBalance <= 0) return "Paid";
    if(entry.remainingBalance < entry.originalAmount) return "Partial";
    return "Unpaid";
}
function displayCustomerBalances(){
    unpaidBalanceTableBody.innerHTML = "";
    customerBalanceList.innerHTML = "";

    customerBalances.forEach((entry) => {
        const status = getBalanceStatus(entry);
        const dataText = new Date(entry.dateTime).toLocaleString();

        const productName = typeof entry.productName === "string" ? entry.productName : "Not Recorded";

        const row = unpaidBalanceTableBody.insertRow();

        row.insertCell().textContent = entry.customerName;
        row.insertCell().textContent = productName;
        row.insertCell().textContent = dataText;
        row.insertCell().textContent = formatPeso(entry.originalAmount);
        row.insertCell().textContent = formatPeso(entry.remainingBalance);

        const statusCell = row.insertCell();
        const statusBadge = document.createElement("span");
        statusBadge.className = `balance-status ${status.toLowerCase()}`;
        statusBadge.textContent = status;
        statusCell.appendChild(statusBadge);

        const card = document.createElement("div");
        card.className = "balance-card";

        if(status === "Paid"){
            card.classList.add("is-paid");
        }

        const top = document.createElement("div");
        top.className = "balance-entry-top";

        const name = document.createElement("span");
        name.className = "balance-entry-name";
        name.textContent = entry.customerName;

        const badge = document.createElement("span");
        badge.className = `balance-status ${status.toLowerCase()}`;
        badge.textContent = status;

        top.append(name, badge);

        const date = document.createElement("p");
        date.className = "balance-entry-date";
        date.textContent = dataText;

        const product = document.createElement("p");
        product.className = "balance-entry-product";
        product.textContent = `Product: ${productName} `;

        const details = document.createElement("div");
        details.className = "balance-entry-details";

        const original = document.createElement("span");
        original.textContent = `Original: ${formatPeso(entry.originalAmount)}`;

        const remaining = document.createElement("strong");
        remaining.textContent = `Remaining: ${formatPeso(entry.remainingBalance)}`;

        details.append(original, remaining);

        const actions = document.createElement("div");
        actions.className = "balance-entry-actions";

        if (status !== "Paid") {
            const paymentButton = document.createElement("button");
            paymentButton.type = "button";
            paymentButton.className = "record-payment-btn";
            paymentButton.dataset.id = entry.id;
            paymentButton.textContent = "Record Payment";
            actions.appendChild(paymentButton);
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-balance-btn";
        deleteButton.dataset.id = entry.id;
        deleteButton.textContent = "Delete Entry";
        actions.appendChild(deleteButton);

        card.append(top, date, product, details, actions);
        customerBalanceList.appendChild(card);
    });

    if (customerBalances.length === 0) {
        unpaidBalanceTableBody.innerHTML =
            '<tr><td colspan="5">No customer balances recorded yet.</td></tr>';

        customerBalanceList.innerHTML =
            '<p class="empty-balance">No utang entries yet. Add the first one above.</p>';
    }

    // Dashboard summaries
    const unpaidEntries = customerBalances.filter(
        (entry) => entry.remainingBalance > 0
    );

    const totalOwed = unpaidEntries.reduce(
        (total, entry) => total + entry.remainingBalance,
        0
    );

    const uniqueCustomers = new Set(
        unpaidEntries.map((entry) => entry.customerName.trim().toLowerCase())
    );

    const today = new Date();

    const paymentsToday = customerBalances.reduce((total, entry) => {
        const dailyPayments = entry.payments.filter((payment) => {
            const paymentDate = new Date(payment.dateTime);

            return (
                paymentDate.getDate() === today.getDate() &&
                paymentDate.getMonth() === today.getMonth() &&
                paymentDate.getFullYear() === today.getFullYear()
            );
        });

        return total + dailyPayments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0
        );
    }, 0);

    totalUnpaidBalance.textContent = formatPeso(totalOwed);
    customersWithBalance.textContent = uniqueCustomers.size;
    paymentsReceivedToday.textContent = formatPeso(paymentsToday);
}

    saveCustomerBalances();
    displayCustomerBalances();

    // Open and close the ledger
    openBalanceModalButtons.forEach(button => {
        button.addEventListener("click", () => {
            customerBalanceDialog.showModal();
        });
    });

    closeBalanceModal.addEventListener("click", () => {
    customerBalanceDialog.close();
    });

    // Add a new credit entry
    customerBalanceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const customerName = customerNameInput.value.trim();
    const productBalance = productBalanceInput.value.trim();
    const originalAmount = Number(originalAmountInput.value);

    if (!customerName || !productBalance || !Number.isFinite(originalAmount) || originalAmount <= 0) {
        alert("Enter a customer name and a valid amount.");
        return;
    }

    customerBalances.unshift({
        id: Date.now(),
        customerName,
        productName: productBalance,
        dateTime: new Date().toISOString(),
        originalAmount,
        remainingBalance: originalAmount,
        payments: []
    });

    saveCustomerBalances();
    displayCustomerBalances();
    customerBalanceForm.reset();
});

// Record partial or full payments; handle ledger buttons
    customerBalanceList.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    const entryId = Number(button.dataset.id);
    const entry = customerBalances.find((item) => item.id === entryId);

    if (!entry) return;

    if (button.classList.contains("record-payment-btn")) {
        const answer = prompt(
            `Remaining balance: ${formatPeso(entry.remainingBalance)}\nEnter payment amount:`
        );

        if (answer === null || answer.trim() === "") return;

        const amount = Number(answer);

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Enter a valid payment amount greater than zero.");
            return;
        }

        if (amount > entry.remainingBalance) {
            alert("Payment cannot exceed the remaining balance.");
            return;
        }

        entry.remainingBalance = Math.max(
            0,
            Math.round((entry.remainingBalance - amount) * 100) / 100
        );

        entry.payments.push({
            amount,
            dateTime: new Date().toISOString()
        });

        saveCustomerBalances();
        displayCustomerBalances();
    }

    if (button.classList.contains("delete-balance-btn")) {
        if (!confirm(`Delete ${entry.customerName}'s balance entry and its payment history?`)) {
            return;
        }

        customerBalances = customerBalances.filter(
            (item) => item.id !== entryId
        );

        saveCustomerBalances();
        displayCustomerBalances();
    }
});