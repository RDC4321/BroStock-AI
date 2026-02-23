from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import yfinance as yf
import time
import math

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

@app.get("/predict")
def predict(ticker: str):
    print("Fetching data for: ", ticker)

    data = yf.download(ticker, period="1mo", progress=False)
    print("Data fetched!")

    if data.empty:
        return{"error": "Invalid ticker"}
    
    close_prices = data["Close"]

    #for handling multi-index cases safely
    if hasattr(close_prices, "columns"):
        close_prices = close_prices.iloc[:,0]
    latest_price = close_prices.iloc[-1]

    dates = data.index.strftime("%Y-%m-%d").tolist()
    prices = [float(x) for x in close_prices]

    previous_price = close_prices.iloc[-2]
    change = latest_price - previous_price
    percent_change = (change/previous_price) * 100
    ma7 = close_prices.rolling(window=7).mean()
    ma21 = close_prices.rolling(window=21).mean()
    ma7_list = [
        None if (isinstance(x,float) and math.isnan(x)) else float(x)
        for x in ma7
    ]
    ma21_list = [
        None if (isinstance(x,float) and math.isnan(x)) else float(x)
        for x in ma21
    ]

    return{
        "ticker": ticker.upper(),
        "latest_price": round(float(latest_price),2),
        "dates": dates,
        "datasets":{
            "prices": prices,
            "ma7": ma7_list,
            "ma21" :ma21_list,
        },
        "change": round(float(change),2),
        "percent_change": round(float(percent_change),2) 
    }