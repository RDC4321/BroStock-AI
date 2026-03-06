import yfinance as yf
import math
import numpy as np
from sklearn.linear_model import LinearRegression

class StockAnalyzer:

    def __init__(self, ticker: str):
        self.ticker = ticker.upper()
        self.data = None
        self.close_prices = None
        self.volume = None
    
    def fetch_data(self):
        self.data = yf.download(self.ticker, period="3mo", progress=False)
        if self.data.empty:
            return False
        return True
    
    def prepare_data(self):
        self.close_prices = self.data["Close"]
        self.volume = self.data["Volume"]

        if hasattr(self.close_prices, "columns"):
            self.close_prices = self.close_prices.iloc[:,0]

        if hasattr(self.volume,"columns"):
            self.volume = self.volume.iloc[:,0]

    def calculate_indicators(self):

        self.ma7 = self.close_prices.rolling(window=7).mean()
        self.ma21 = self.close_prices.rolling(window=21).mean()

        delta = self.close_prices.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)

        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()

        avg_loss = avg_loss.replace(0, 1e-10)

        rs = avg_gain / avg_loss
        self.rsi = 100 - (100 / (1 + rs))

        ema12 = self.close_prices.ewm(span=12, adjust=False).mean()
        ema26 = self.close_prices.ewm(span=26, adjust=False).mean()

        self.macd = ema12 - ema26
        self.macd_signal = self.macd.ewm(span=9, adjust=False).mean()
        self.macd_hist = self.macd - self.macd_signal
    
    def build_response(self, days=7):
        def safe_float(value):
            try:
                value = float(value)
                if math.isnan(value) or math.isinf(value):
                    return None
                return value
            except:
                return None
        
        dates = self.data.index.strftime("%Y-%m-%d").tolist()
        prices = [safe_float(x) for x in self.close_prices]

        previous_price = self.close_prices.iloc[-2]
        latest_price = self.close_prices.iloc[-1]

        change = latest_price - previous_price
        percent_change = (change/previous_price) * 100

        forecast_dates, forecast_prices = self.forecast_prices(days)

        return{
            "ticker":self.ticker,
            "latest_price":safe_float(round(float(latest_price),2)),
            "dates": dates,
            "datasets": {
                "prices":prices,
                "ma7": [safe_float(x) for x in self.ma7],
                "ma21": [safe_float(x) for x in self.ma21],
                "rsi": [safe_float(x) for x in self.rsi],
                "volume": [safe_float(x) for x in self.volume.fillna(0)],
                "macd": [safe_float(x) for x in self.macd],
                "macd_signal": [safe_float(x) for x in self.macd_signal],
                "macd_hist": [safe_float(x) for x in self.macd_hist],
            },
            "forecast": {
                "dates": forecast_dates,
                "prices": [safe_float(x) for x in forecast_prices]
            },
            "change":safe_float(round(float(change),2)),
            "percent_change":safe_float(round(float(percent_change),2)),
        }
    
    def forecast_prices(self, days_ahead=7):
        prices = np.array(self.close_prices).reshape(-1,1)

        X = np.arange(len(prices)).reshape(-1,1)

        model = LinearRegression()
        model.fit(X,prices)

        future_x = np.arange(len(prices), len(prices)+days_ahead).reshape(-1,1)

        forecast = model.predict(future_x)

        last_date = self.data.index[-1]

        forecast_dates = [
            (last_date + np.timedelta64(i+1,'D')).strftime("%Y-%m-%d")
            for i in range(days_ahead)
        ]
        
        return forecast_dates, forecast.flatten()