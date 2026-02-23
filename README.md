# BroStock AI

BroStock AI is a full-stack stock analytics dashboard built with FastAPI, JavaScript, and Chart.js.
It fetches live stock market data and visualizes it using interactive charts with technical indicators such as moving averages.

---

## Current Features

- Live stock price fetching via Yahoo Finance (yfinance)
- Interactive dynamic line chart (Chart.js)
- 7-day and 21-day Moving Averages (MA7, MA21)
- Gradient-styled modern UI
- FastAPI backend serving structured JSON
- Clean frontend-backend architecture
- Defensive handling of pandas NaN serialization

---

## Tech Stack

### Backend
- Python
- FastAPI
- yfinance
- pandas

### Frontend
- HTML
- CSS
- JavaScript
- Chart.js

---

## Architecture Overview

User Input  
→ JavaScript fetch request  
→ FastAPI backend  
→ Yahoo Finance API  
→ Backend processes & structures data  
→ JSON response  
→ Chart.js renders interactive visualization  

All financial calculations (e.g., moving averages) are handled in the backend to maintain clean separation of concerns.

---

## Roadmap (In Progress)

- [ ] Add prediction model (regression-based forecasting)
- [ ] Add confidence interval bands
- [ ] Add time-range selector (1W, 1M, 3M, 1Y)
- [ ] Add RSI indicator
- [ ] Add prediction accuracy metrics
- [ ] Deploy to AWS

---

## Disclaimer

This project is for educational and portfolio purposes only.  
It does not provide financial advice.

---

## Why This Project?

This project demonstrates:

- Full-stack integration
- API design & JSON structuring
- Data transformation in backend
- Chart-based visualization
- Debugging serialization and data-shape issues
- Incremental feature development
