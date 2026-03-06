window.latestData = null;
import { fetchStock } from "./api.js";
import { renderPriceChart, renderMACD, renderAIChart } from "./charts.js";
import { 
    updatePriceUI, 
    showLoading, 
    showError, 
    initializeUI 
} from "./ui.js";
let forecastDays = 7;

async function searchStock() {

    const tickerInput = document.getElementById("tickerInput");
    const ticker = tickerInput.value.trim().toUpperCase();
    const days = forecastDays;

    if (!ticker) {
        showError("Please enter a stock ticker.");
        return;
    }

    showLoading(true);

    try {
        const data = await fetchStock(ticker,days);
        console.log("API DATA:", data);
        
        if (data.error) {
            showError(data.error);
            showLoading(false);
            return;
        }

        updatePriceUI(data);
        window.latestData = data;
        renderPriceChart(data);
        renderMACD(data);

        if (data.forecast){
            renderAIChart(
                data.dates,
                data.datasets.prices,
                data.forecast.dates,
                data.forecast.prices
        );
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        showError("Something went wrong. Please try again.");
    }

    showLoading(false);
}


window.searchStock = searchStock;
initializeUI();

document.querySelectorAll(".forecast-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".forecast-btn")
                .forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                forecastDays = btn.dataset.days;
                if(window.latestData){
                    searchStock();
                }
            });
        });