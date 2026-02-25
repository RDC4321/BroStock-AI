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

    data = yf.download(ticker, period="3mo", progress=False)
    print("Data fetched!")

    if data.empty:
        return{"error": "Invalid ticker"}
    
    close_prices = data["Close"]
    volume = data["Volume"]
    if hasattr(volume, "columns"):
        volume = volume.iloc[:,0]
    volume_list = volume.fillna(0).tolist()

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

    delta = close_prices.diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()

    avg_loss = avg_loss.replace(0, 1e-10)

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    rsi = rsi.replace([float("inf"), float("-inf")], None)
    rsi = rsi.where(rsi.notna(), None)
    rsi_list = [
        None if (x is None or not isinstance(x, (int, float))) else float(x)
        for x in rsi
    ]

    def safe_float(value):
        if value is None:
            return None
        if isinstance(value,float):
            if math.isnan(value) or math.isinf(value):
                return None
        return float(value)
    
    ema12 = close_prices.ewm(span=12, adjust=False).mean()
    ema26 = close_prices.ewm(span=26, adjust=False).mean()
    macd = ema12 - ema26
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal

    macd_list = [safe_float(x) for x in macd]
    signal_list = [safe_float(x) for x in signal]
    hist_list = [safe_float(x) for x in histogram]

    return{
        "ticker": ticker.upper(),
        "latest_price": safe_float(round(float(latest_price),2)),
        "dates": dates,
        "datasets": {
            "prices": [safe_float(x) for x in prices],
            "ma7": [safe_float(x) for x in ma7_list],
            "ma21": [safe_float(x) for x in ma21_list],
            "rsi": [safe_float(x) for x in rsi_list],
            "volume": [safe_float(x) for x in volume_list],
            "macd": macd_list,
            "macd_signal": signal_list,
            "macd_hist": hist_list
        },
        "change": safe_float(round(float(change),2)),
        "percent_change": safe_float(round(float(percent_change),2)),
    }