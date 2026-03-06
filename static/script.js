let chart;
let rsiChart;
let macdChart;

const DATASET_INDEX = {
    VOLUME: 0,
    PRICE: 1,
    MA7: 2,
    MA21: 3
};

function searchStock(){
    let ticker = document.getElementById("tickerInput").value;
    document.getElementById("loadingText").style.display = "inline";

    if (ticker == ""){
        alert("Please enter a stock ticker!");
        return;
    }
    fetch(`/predict?ticker=${ticker}`)
    .then(response=> response.json())
    .then(data=>{
        document.getElementById("loadingText").style.display = "none";
        if (data.error){
            document.getElementById("result").innerHTML = data.error;
            return;
        }
        const priceElement = document.getElementById("priceText");
        const changeElement = document.getElementById("changeText");

        priceElement.innerHTML = `${data.ticker} $${data.latest_price}`;

        const change = data.change;
        const percent = data.percent_change;
    
        if (change >=0){
            changeElement.innerHTML =  ` ▲ +${change} (${percent.toFixed(2)}%)`;
            changeElement.className = "change positive";
        } else {
            changeElement.innerHTML =  ` ▼ ${change} (${percent.toFixed(2)}%)`;
            changeElement.className = "change negative";
        }
        renderChart(
            data.dates, 
            data.datasets.prices,
            data.datasets.ma7,
            data.datasets.ma21,
            data.datasets.rsi,
            data.datasets.volume,
            data.ticker
        );
        renderAIChart(
            data.dates,
            data.datasets.prices,
            data.forecast.dates,
            data.forecast.prices
        );
        renderMACD(
            data.dates,
            data.datasets.macd,
            data.datasets.macd_signal,
            data.datasets.macd_hist
        );
    })
    .catch(error => {
        console.error("Error", error);
    });
    
}


document.getElementById("toggleMA7").addEventListener("change", function(){
        chart.data.datasets[DATASET_INDEX.MA7].hidden = !this.checked;
        if (!chart.data.datasets[DATASET_INDEX.MA7].hidden || !chart.data.datasets[DATASET_INDEX.MA21].hidden){
            chart.data.datasets[DATASET_INDEX.PRICE].borderWidth = 3;
        } else {
            chart.data.datasets[DATASET_INDEX.PRICE].borderWidth = 4;
        }
        chart.update();
    });
document.getElementById("toggleMA21").addEventListener("change", function() {
        chart.data.datasets[DATASET_INDEX.MA21].hidden = !this.checked;
        if (!chart.data.datasets[DATASET_INDEX.MA7].hidden || !chart.data.datasets[DATASET_INDEX.MA21].hidden){
            chart.data.datasets[DATASET_INDEX.PRICE].borderWidth = 3;
        } else {
            chart.data.datasets[DATASET_INDEX.PRICE].borderWidth = 4;
        }
        chart.update();
    });

let currentMode = "technical";

const techBtn = document.getElementById("techMode");
const aiBtn = document.getElementById("aiMode");

function setmode(mode) {

    currentMode = mode;

    techBtn.classList.remove("active");
    aiBtn.classList.remove("active");

    if (mode === "technical"){
        techBtn.classList.add("active");
    } else {
        aiBtn.classList.add("active");
    }
    updateMode();
}

techBtn.addEventListener("click", ()=> setmode("technical"));
aiBtn.addEventListener("click", ()=> setmode("ai"));

function updateMode() {

    const techPanels = document.getElementById("technicalPanels");
    const aiPanels = document.getElementById("aiPanels");

    if (currentMode === "technical"){
        techPanels.style.display = "block";
        aiPanels.style.display = "none";
    } else{
        techPanels.style.display = "none";
        aiPanels.style.display = "block";
    }
    if (!chart) return;

    if (currentMode === "technical") {
        chart.data.datasets[DATASET_INDEX.MA7].hidden = false; //for MA7
        chart.data.datasets[DATASET_INDEX.MA21].hidden = false; //for MA21
    } else{
        chart.data.datasets[DATASET_INDEX.MA7].hidden = true;
        chart.data.datasets[DATASET_INDEX.MA21].hidden = true;
    }

    chart.update();
}