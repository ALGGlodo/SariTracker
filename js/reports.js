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

