# BroStock AI

BroStock AI is a full-stack stock analytics dashboard built with FastAPI, JavaScript, and Chart.js.  
It fetches live stock market data and visualizes it using interactive charts with professional-grade technical indicators.

The project has evolved from a simple price chart into a modular technical analysis dashboard.

---

## Current Features

### Price & Trend Analysis
- Live stock price fetching via Yahoo Finance (yfinance)
- Interactive dynamic price chart (Chart.js)
- 7-day and 21-day Moving Averages (MA7, MA21)
- Toggle controls for MA visibility
- Adaptive price line thickness based on indicator visibility

### Volume Analysis
- Volume bars integrated into the main price chart
- Separate Y-axis handling for clean scaling
- Visual confirmation of price strength

### RSI (Relative Strength Index – 14)
- Full RSI momentum panel (0–100 scale)
- Overbought (70) and Oversold (30) reference levels
- Background heat-zone shading
- Backend-calculated rolling averages
- Defensive handling of NaN and infinite values

### MACD (Moving Average Convergence Divergence)
- EMA(12) and EMA(26) based MACD line
- 9-period Signal line
- Histogram with dynamic green/red coloring
- Separate synchronized panel
- Momentum strength visualization

### Dashboard Controls
- Technical Mode / AI Mode toggle (AI mode scaffolded)
- Clean separation of technical panels
- Responsive dark-themed UI
- Smooth chart transitions

### Data Integrity & Stability
- Defensive handling of pandas NaN / inf serialization
- Multi-index DataFrame normalization
- Safe float sanitization before JSON response
- Clean backend-to-frontend data contract

---

## Tech Stack

### Backend
- Python
- FastAPI
- yfinance
- pandas
- Exponential & rolling window calculations

### Frontend
- HTML
- CSS (custom dark UI styling)
- JavaScript
- Chart.js (multi-dataset mixed charts)

---

## Architecture Overview

User Input  
→ JavaScript fetch request  
→ FastAPI backend  
→ Yahoo Finance data (yfinance)  
→ Backend computes indicators (MA, RSI, MACD, Volume)  
→ Safe JSON serialization  
→ Chart.js renders multi-panel interactive dashboard  

All financial calculations are performed in the backend to maintain clean separation of concerns and avoid frontend numerical instability.

---

## Indicators Explained

### Moving Averages (MA7 / MA21)
Used to smooth price data and identify short-term vs medium-term trends.

### Volume
Used to confirm price movement strength.
High volume + breakout = stronger conviction.

### RSI (14)
Momentum oscillator:
- Above 70 → Potentially overbought
- Below 30 → Potentially oversold

### MACD
Trend-following momentum indicator:
- MACD crossing above signal → Bullish shift
- MACD crossing below signal → Bearish shift
- Histogram shows momentum acceleration

---

## Roadmap (In Progress)

- [ ] Regression-based forecasting model
- [ ] Confidence interval bands
- [ ] Time-range selector (1W, 1M, 3M, 1Y)
- [ ] Candlestick chart mode
- [ ] Crosshair synchronization across panels
- [ ] AI forecast visualization panel
- [ ] Deployment (cloud hosting)

---

## Why This Project?

This project demonstrates:

- Full-stack system design
- Financial indicator implementation from scratch
- API design & structured JSON contracts
- Defensive data engineering practices
- Chart.js multi-panel architecture
- State management in interactive dashboards
- Incremental, versioned feature expansion

---

## Disclaimer

This project is for educational and portfolio purposes only.  
It does not provide financial advice.
