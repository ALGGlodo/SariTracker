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