const PRODUCTS_API_URL = "http://localhost:3000/api/products";

let products = [];

const restockCount = document.getElementById("restockCount");
const outOfStockCount = document.getElementById("outOfStockCount");
const recommendationList = document.getElementById("recommendationList");

let purchasePlan = JSON.parse(localStorage.getItem("purchasePlan")) || [];
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
        return (Number(product.stock) === 0);
    });
    restockCount.textContent = needsRestocking.length;
    outOfStockCount.textContent = products.length;
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

    purchasePlan.forEach((item) => {
        const planItem = document.createElement("div");
        planItem.classList.add("purchase-plan-item");

        const productName = document.createElement("h4");
        productName.textContent = item.product_name;

        const productStock = document.createElement("p");
        productStock.textContent = `${item.stock} units currently available`;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "Remove";
        removeBtn.dataset.id = item.id;
        removeBtn.classList.add("remove-plan-item");

        planItem.append(productName, productStock, removeBtn);
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
        stock: selectedProduct.stock
    });

    displayPurchasePlan();
});

purchasePlanContent.addEventListener("click", (e) => {
    const button = e.target.closest(".remove-plan-item");

    if (!button) return;

    const productId = Number(button.dataset.id);

    purchasePlan = purchasePlan.filter((item) => {
        return item.id !== productId;
    });

    displayPurchasePlan();
});

clearPurchasePlan.addEventListener("click", () => {
    purchasePlan = [];
    displayPurchasePlan();
});

fetchStockProducts();