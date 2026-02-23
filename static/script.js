let chart;

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
        document.getElementById("result").innerHTML =
            "Latest price for " + data.ticker + " is $" + data.latest_price;
        renderChart(
            data.dates, 
            data.datasets.prices,
            data.datasets.ma7,
            data.datasets.ma21,
            data.ticker
        );
    })
    .catch(error => {
        console.error("Error", error);
    });
}

function renderChart(dates,prices,ma7,ma21,ticker){
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
                label: ticker + " Price",
                data: prices,
                borderColor: "#00ffcc",
                backgroundColor: gradient,
                fill: true,
                borderwidth: 3,
                tension: 0.4, //smooth curves
                pointRadius: 0
            }]
        },
        options: {
            animation: {
                duration: 1500,
                easing: "easeInOutQuart"
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
                }
            }
        }
    });
}