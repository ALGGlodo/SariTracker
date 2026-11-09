const PRODUCTS_API_URL = "http://localhost:3000/api/products";

let products = [];

const restockCount = document.getElementById("restockCount");
const outOfStockCount = document.getElementById("outOfStockCount");
const recommendationList = document.getElementById("recommendationList");

let purchasePlan = JSON.parse(localStorage.getItem("purchasePlan")) || [];

purchasePlan = purchasePlan.map((item) => ({
    ...item,
    purchaseQuantity: item.purchaseQuantity || 1,
    purchased: item.purchased || false
}));

savePurchasePlan();

const purchasePlanCount = document.getElementById("purchasePlanCount");
const purchasePlanContent = document.getElementById("purchasePlanContent");
const clearPurchasePlan = document.getElementById("clearPurchasePlan");

async function fetchStockProducts(){
    try{
        const response = await fetch(PRODUCTS_API_URL);

        if(!response.ok){
            throw new Error("Failed to retrieve products");
        }
        products = await response.json();

        updateRestockOverview();
        displayRecommendations();
    }catch(error){
        console.log("Error fetching products:", error);
    }
}

function updateRestockOverview(){
    const needsRestocking = products.filter((product) => {
        return Number(product.stock) >= 1 && Number(product.stock) <= 5;
    });

    const outOfStock = products.filter((product) => {
        return  Number(product.stock) === 0;
    })

    restockCount.textContent = needsRestocking.length;
    outOfStockCount.textContent = outOfStock.length;
}

function displayRecommendations(){
    const recommendedProducts = products.filter((product) => {
        return (Number(product.stock) <= 5);
    });

    recommendationList.innerHTML = "";


    if(recommendedProducts.length === 0){
        recommendationList.innerHTML = `
            <div class="empty-recommendations">
                <i class="fa-solid fa-clipboard-check"></i>
                <h4>No recommendations yet</h4>
                <p>Products requiring replenishment will appear here.</p>
            </div>
        `;
        return
    }
    
    recommendedProducts.forEach((product) => {
        const productCard = document.createElement("div");

        productCard.classList.add("recommendation-item");

        const stock = Number(product.stock);

        const priority = stock === 0 ? "Urgent" : "Low Stock";

        productCard.innerHTML = `
            <div>
                <h4>${product.product_name}</h4>
                <p>${product.category}</p>
            </div>

            <div>
                <strong>${stock} units left</strong>
                <span class="${stock === 0 ? "urgent-priority" : "low-priority"}">
                    ${priority}
                </span>
                <button type="button" class="add-to-plan" data-id="${product.id}">
                    Add to Plan
                </button>
            </div>
        `;
        recommendationList.appendChild(productCard);
    });
}

function savePurchasePlan(){
    localStorage.setItem("purchasePlan", JSON.stringify(purchasePlan));
}

function displayPurchasePlan(){
    purchasePlanContent.innerHTML = "";

    purchasePlanCount.textContent = purchasePlan.length;
      if (purchasePlan.length === 0) {
        purchasePlanContent.innerHTML = `
            <div class="empty-purchase-plan">
                <i class="fa-solid fa-cart-flatbed"></i>
                <h4>Your purchase plan is empty</h4>
                <p>Add products from your restock recommendations to start preparing your purchase list.</p>
            </div>
        `;
        return;
    }

    const purchasedCost = purchasePlan.filter((item) => {
        return item.purchased;
    }).length;

    const progressSummary = document.createElement("div");
    progressSummary.classList.add("purchase-progress");
    
    progressSummary.textContent = `${purchasedCost} of ${purchasePlan.length} items purchased`;
    purchasePlanContent.appendChild(progressSummary);

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    const progressFill = document.createElement("div");
    progressFill.classList.add("progress-fill");

    const progressPercentage = (purchasedCost / purchasePlan.length * 100);

    progressFill.style.width = `${progressPercentage}%`;

    progressBar.append(progressFill);
    purchasePlanContent.appendChild(progressBar);

    purchasePlan.forEach((item) => {
        const planItem = document.createElement("div");
        planItem.classList.add("purchase-plan-item");

        if(item.purchased){
            planItem.classList.add("purchased");
        }

        const productInfo = document.createElement("div");
        productInfo.classList.add("product-info");

        const productActions = document.createElement("div");
        productActions.classList.add("product-actions");

        const productName = document.createElement("h4");
        productName.textContent = item.product_name;
        
        const purchasedCheckedBox = document.createElement("input");
        purchasedCheckedBox.type = "checkbox";
        purchasedCheckedBox.classList.add("purchased-checkbox");
        purchasedCheckedBox.checked = item.purchased;
        purchasedCheckedBox.dataset.id = item.id;

        const productStock = document.createElement("p");
        productStock.textContent = `${item.stock} units currently available`;

        productInfo.append(productName, productStock);

        const purchaseQuantity = document.createElement("input");
        purchaseQuantity.type = "number";
        purchaseQuantity.min = 1;
        purchaseQuantity.value = item.purchaseQuantity || 1;
        purchaseQuantity.classList.add("purchase-quantity");
        purchaseQuantity.dataset.id = item.id;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "Remove";
        removeBtn.dataset.id = item.id;
        removeBtn.classList.add("remove-plan-item");

        productActions.append(purchasedCheckedBox, purchaseQuantity, removeBtn);

        planItem.append(productInfo, productActions);
        purchasePlanContent.appendChild(planItem);
    });
}

recommendationList.addEventListener("click", (e) => {
    const button = e.target.closest(".add-to-plan");

    if (!button) return;

    const productId = Number(button.dataset.id);

    const selectedProduct = products.find((product) => {
        return product.id === productId;
    });

    if (!selectedProduct) return;

    const alreadyAdded = purchasePlan.some((item) => {
        return item.id === productId;
    });

    if (alreadyAdded) return;

    purchasePlan.push({
        id: selectedProduct.id,
        product_name: selectedProduct.product_name,
        stock: selectedProduct.stock,
        purchaseQuantity: 1,
        purchased: false
    });

    savePurchasePlan();

    displayPurchasePlan();
});

purchasePlanContent.addEventListener("click", (e) => {
    const button = e.target.closest(".remove-plan-item");

    if (!button) return;
    const productId = Number(button.dataset.id);
    purchasePlan = purchasePlan.filter((item) => {
        return item.id !== productId;
    });

    savePurchasePlan();
    displayPurchasePlan();
});

purchasePlanContent.addEventListener("change", (e) => {
    if (!e.target.classList.contains("purchased-checkbox")) return;

    const productId = Number(e.target.dataset.id);

    purchasePlan = purchasePlan.map((item) => {
        if (item.id === productId) {
            return {
                ...item,
                purchased: e.target.checked
            };
        }

        return item;
    });
    savePurchasePlan();
    displayPurchasePlan();
});

purchasePlanContent.addEventListener("change", (e) =>{
    if (!e.target.classList.contains("purchase-quantity")) return;

    const productId = Number(e.target.dataset.id);
    const newQuantity = Number(e.target.value);

    if(!Number.isInteger(newQuantity) || newQuantity < 1){
        newQuantity = 1;
        e.target.value = 1;
    }

    purchasePlan = purchasePlan.map((item) => {
        if(item.id === productId){
            return{
                ...item,
                purchaseQuantity: newQuantity
            };
        }
        return item;
    });
    savePurchasePlan();
    console.log("Purchase plan updated:", purchasePlan);
});

clearPurchasePlan.addEventListener("click", () => {
    purchasePlan = [];
    displayPurchasePlan();
    savePurchasePlan();

});

fetchStockProducts();
displayPurchasePlan();
