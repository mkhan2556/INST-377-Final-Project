
const convertBtn = document.getElementById("convertBtn");
const historyList = document.getElementById("historyList");


let chart;

window.onload = loadHistory;


convertBtn.addEventListener("click", async () => {
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;
  const amount = document.getElementById("amount").value;

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  try {

    const response = await fetch(
      `/api/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
    );

    const data = await response.json();

    
    document.getElementById("convertedAmount").innerText =
      `${data.fromCurrency} → ${data.toCurrency}: ${data.result}`;

    document.getElementById("exchangeRate").innerText =
      `Rate: 1 ${data.fromCurrency} = ${data.rate} ${data.toCurrency}`;

    document.getElementById("date").innerText =
      `Date: ${data.date}`;

    
    await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromCurrency,
        to: toCurrency,
        amount: amount,
        result: data.result,
        date: data.date
      })
    });

    
    loadHistory();

  } catch (error) {
    console.error("Convert error:", error);
    alert("Error occurred during conversion");
  }
});


async function loadHistory() {
  try {
    const res = await fetch("/api/history");
    const data = await res.json();

    historyList.innerHTML = "";

    const labels = [];
    const values = [];

    data.forEach(item => {
     
      const li = document.createElement("li");
      li.innerText = `${item.amount} ${item.from_currency} → ${item.result} ${item.to_currency}`;
      historyList.appendChild(li);

      
      labels.push(item.date);
      values.push(item.result);
    });

    renderChart(labels, values);

  } catch (error) {
    console.error("History load error:", error);
  }
}



function renderChart(labels, dataValues) {
  const canvas = document.getElementById("historyChart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Converted Amount",
          data: dataValues,
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}