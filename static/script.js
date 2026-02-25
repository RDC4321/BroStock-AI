let chart;
let rsiChart;
let macdChart;

function searchStock(){
    let ticker = document.getElementById("tickerInput").value;

    if (ticker == ""){
        alert("Please enter a stock ticker!");
        return;
    }
    fetch("http://127.0.0.1:8000/predict?ticker=" + ticker)
    .then(response=> response.json())
    .then(data=>{
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
            changeElement.innerHTML =  ` ▼ +${change} (${percent.toFixed(2)}%)`;
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

function renderChart(dates,prices,ma7,ma21,rsi,volume,ticker){
    console.log(dates);
    console.log(prices);
    const ctx = document.getElementById("stockChart").getContext("2d");
    //for destroying old chart if it exists
    if (chart) {
        chart.destroy();
    }
    const gradient = ctx.createLinearGradient(0,0,0,400);
    gradient.addColorStop(0, "rgba(0,255,204,0.8)");
    gradient.addColorStop(1, "rgba(0,255,204,0.05)");

    chart = new Chart(ctx, {
        type:"line",
        data:{
            labels: dates,
            datasets: [{
                type: "bar",
                label: "Volume",
                data: volume,
                yAxisID: "yVolume",
                backgroundColor: "rgba(0,255,204,0.15)",
                borderWidth:0
            },
            {
                label: ticker + " Price",
                data: prices,
                borderColor: "#00ffcc",
                backgroundColor: gradient,
                fill: true,
                borderwidth: 3,
                tension: 0.4, //smooth curves
                pointRadius: 0
            },
            {
                label: "MA 7",
                data: ma7,
                borderColor: "#FFD700",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: false
            },
            {
                label: "MA 21",
                data: ma21,
                borderColor: "#FF8C00",
                borderWidth: 1.5,
                tension: 0.4,
                pointRadius: 0,
                fill: false
            }
            ]
        },
        options: {
            animation: {
                duration: 600,
                easing: "easeOutCubic"
            },
            transitions: {
                show: {
                    animations: {
                        x: {duration: 0},
                        y: {duration: 0}
                    }
                },
                hide: {
                    animations: {
                        x: {duration: 0},
                        y: {duration: 0}
                    }
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color:"white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.1)"
                    }
                },
                y:{
                    ticks: {
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.1)"
                    }
                },
                yVolume: {
                    position: "right",
                    grid: {display:false},
                    ticks: {display:false}
                }
            }
        }
    });
    updateMode();

    const rsiCtx = document.getElementById("rsiChart").getContext("2d");

    if (rsiChart) {
        rsiChart.destroy();
    }

    rsiChart = new Chart(rsiCtx,{
        type: "line",
        data:{
            labels: dates,
            datasets: [{
                label: "RSI (14)",
                data: rsi,
                borderColor: "#ff00ff",
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                fill: false
            },
            {
                label: "Overbought (70)",
                data: new Array(dates.length).fill(70),
                borderColor: "rgba(255,0,0,0.5)",
                borderDash: [5,5],
                pointRadius:0
            },
            {
                label: "Oversold (30)",
                data: new Array(dates.length).fill(30),
                borderColor: "rgba(0,255,0,0.5)",
                borderDash: [5,5],
                pointRadius:0
            }]
        },
        options: {
            responsive: true,
            plugins:{
                legend: {labels: {color: "white"}},
                beforeDraw: (chart) => {
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return;

                    const {top,bottom,left,right} = chartArea;
                    const height = bottom - top;

                    ctx.save();

                    ctx.fillStyle = "rgba(255,0,0,0.05)";
                    ctx.fillRect(left,top,right - left,height * 0.3);

                    ctx.fillStyle = "rgba(0,255,0,0.05)";
                    ctx.fillRect(left,bottom - height * 0.3, right - left, height * 0.3);

                    ctx.restore();
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {color: "white"},
                    grid: {color: "rgba(255,255,255,0.1)"},
                    afterBuildTicks: function(scale) {
                        scale.ticks = [0,30,50,70,100].map(v=>({value:v}));
                    }
                },
                x: {display: false}
            } 
        }
    });
}

function renderMACD(dates,macd,signal,hist){

    const ctx = document.getElementById("macdChart").getContext("2d");
    if (macdChart) macdChart.destroy();
    macdChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: dates,
            datasets: [
                {
                    type: "bar",
                    label: "histogram",
                    data: hist,
                    backgroundColor: hist.map(v =>
                        v >= 0 ? "rgba(0,255,0,0.6)" : "rgba(255,0,0,0.6)"
                    )
                },
                {
                    type: "line",
                    label: "MACD",
                    data: macd,
                    borderColor: "#00ffff",
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    type: "line",
                    label: "Signal",
                    data: signal,
                    borderColor: "#ffcc00",
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {labels: {color: "white"}}
            },
            scales: {
                x:{display:false},
                y: {
                    ticks: {color: "white"},
                    grid: {color:"rgba(255,255,255,0.1)"}
                }
            }
        }
    });
}

document.getElementById("toggleMA7").addEventListener("change", function(){
        chart.data.datasets[2].hidden = !this.checked;
        if (!chart.data.datasets[2].hidden || !chart.data.datasets[3].hidden){
            chart.data.datasets[1].borderWidth = 3;
        } else {
            chart.data.datasets[1].borderWidth = 4;
        }
        chart.update();
    });
document.getElementById("toggleMA21").addEventListener("change", function() {
        chart.data.datasets[3].hidden = !this.checked;
        if (!chart.data.datasets[2].hidden || !chart.data.datasets[3].hidden){
            chart.data.datasets[1].borderWidth = 3;
        } else {
            chart.data.datasets[1].borderWidth = 4;
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
        chart.data.datasets[2].hidden = false; //for MA7
        chart.data.datasets[3].hidden = false; //for MA21
    } else{
        chart.data.datasets[2].hidden = true;
        chart.data.datasets[3].hidden = true;
    }

    chart.update();
}