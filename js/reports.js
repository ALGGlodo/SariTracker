const selectDateBtn = document.getElementById("calendar-btn");
const hiddenCalendar = document.getElementById("hidden-date-input");
const totalSales = document.getElementById("totalSales");
const salesTableBody = document.getElementById("salesTableBody");
const tableTotal = document.getElementById("tableTotal");
const salesReport = JSON.parse(localStorage.getItem("stockMateSales")) || [];
const todaysSales = salesReport.filter((report) => {
  const saleDate = new Date(report.dateTime);
  const today = new Date();

  return (
    saleDate.getDate() === today.getDate() &&
    saleDate.getMonth() === today.getMonth() &&
    saleDate.getFullYear() === today.getFullYear()
  );
});

if (hiddenCalendar === null || selectDateBtn === null) {
  throw new Error(
    "Error: Required date picker elements were not found. Please check the HTML structure.",
  );
}
selectDateBtn.addEventListener("click", () => {
  hiddenCalendar.showPicker();
});

hiddenCalendar.addEventListener("change", () => {
  const selectedDate = new Date(hiddenCalendar.value);
    const selectedDateReport = salesReport.filter((report) => {
        const reportDate = new Date(report.dateTime);
        return (
        reportDate.getDate() === selectedDate.getDate() &&
        reportDate.getMonth() === selectedDate.getMonth() &&
        reportDate.getFullYear() === selectedDate.getFullYear()
        );
    });
    const todaysTotal = selectedDateReport.reduce((total, report) => {
        return total + Number(report.subtotal || 0);
    }, 0);
    totalSales.textContent = `₱${todaysTotal.toFixed(2)}`;
    totalTransactions.textContent = selectedDateReport.length;

    salesTableBody.innerHTML = ""; // Clear previous rows

    tableTotal.textContent = `₱${todaysTotal.toFixed(2)}`;

    if(selectedDateReport.length === 0) {
      salesTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No sales transactions found for the selected date.</td>
        </tr>
      `;
    }else {
    selectedDateReport.forEach((report) => {
        const row = document.createElement("tr")
        row.innerHTML = `
            <td>${new Date(report.dateTime).toLocaleString()}</td>
            <td>${report.productName || "N/A"}</td>
            <td>${report.quantity || 0}</td>
            <td>₱${Number(report.orderPrice || 0).toFixed(2)}</td>
            <td>₱${Number(report.subtotal || 0).toFixed(2)}</td>
        `;
        salesTableBody.appendChild(row);
    });
    }
});

const totalTransactions = document.getElementById("totalTransactions");

const unpaidBalance =
  JSON.parse(localStorage.getItem("stockMateBalances")) || [];
const totalUnpaidBalance = document.getElementById("totalUnpaidBalance");
totalUnpaidBalance.textContent = `₱${unpaidBalance
  .reduce((total, balance) => {
    return total + Number(balance.remainingBalance || 0);
  }, 0)
  .toFixed(2)}`;

const businessDate = document.getElementById("businessDay");
const today = new Date();
businessDate.textContent = `Business Day | ${today.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
})}`;

let productSummary = {};

salesReport.forEach((report) => {
  if (Object.hasOwn(productSummary, report.productName)) {
    productSummary[report.productName].totalQuantity += Number(report.quantity || 0);
    productSummary[report.productName].totalRevenue += Number(report.subtotal || 0);
  } else {
    productSummary[report.productName] = {
      totalQuantity: Number(report.quantity || 0),
      totalRevenue: Number(report.subtotal || 0),
    };
  }
});

const bestSellingProducts = Object.entries(productSummary).sort((a, b) => {
  return b[1].totalQuantity - a[1].totalQuantity || b[1].totalRevenue - a[1].totalRevenue;
});

console.log(productSummary);

const bestSellingTableBody = document.getElementById("bestSellingTableBody");

bestSellingTableBody.innerHTML = "";

if(bestSellingProducts.length === 0){
  bestSellingTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="empty-state">No sales data available yet.</td>
    </tr>
  `;
}else{

bestSellingProducts.forEach((product,index) => {
  bestSellingTableBody.innerHTML += `
    <tr>
      <td>${index + 1}</td>
      <td>${product[0]}</td>
      <td>${product[1].totalQuantity}</td>
      <td>₱${product[1].totalRevenue.toFixed(2)}</td>
    </tr>
  `;
});
}

const bestSellingCanvas = document.getElementById("bestSellingChart");

new Chart(bestSellingCanvas, {
  type: "bar",
  data: {
    labels: bestSellingProducts.map(product => product[0]),
    datasets: [{
      label: "Quantity Sold",
      data: bestSellingProducts.map(product => product[1].totalQuantity),
      backgroundColor: "#163D2A",
      borderColor: "#163D2A", 
      borderWidth: 2,
      categoryPercentage: 0.8,
      barPercentage: 0.8,
      borderRadius: 5
    }]
  },
  options:{
    responsive: true,
    plugins: {
      title:{
        display: true,
        text: "Best Selling Products",
        font: {
          size: 18
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Products"
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantity Sold"
        }
      }
    }
  }
});