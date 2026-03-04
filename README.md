# Multi-Ticker Visualizer

A lightweight, modern React application for simultaneously tracking and visualizing multiple stock tickers. Built with React, Vite, Tailwind CSS, and TradingView's Lightweight Charts.

## 🚀 Features

* **Multi-Chart Grid**: Monitor multiple assets at once in a responsive grid layout.
* **Real-time Data Fetching**: Utilizes the Yahoo Finance API for up-to-date quote and historical data.
* **Extended Hours**: Toggle pre-market and post-market trading sessions with visual boundary markers.
* **Smart Portfolio Management**: Create, save, edit, and switch between customized lists of stock tickers (saved locally).
* **Elegant Visuals**: 
  * Beautiful **Emerald Green** Area (Mountain) charts by default.
  * Native Candlestick chart support.
  * Clean, compact unified header layout.
* **Technical Indicators**: One-click toggling for Simple Moving Averages (SMA 9, 21, 50, 100).
* **Dynamic Time Scales**: Switch seamlessly between 1D (intraday), 5D, 1M, 6M, YTD, and 1Y views.
* **Dark/Light Mode**: Full aesthetic support for both dark and light themes, remembering user preferences.
* **Fullscreen Mode**: Click any ticker symbol to instantly expand its chart to fill the screen for detailed analysis.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18, Vite
- **Styling**: Tailwind CSS
- **Charting Engine**: Lightweight Charts (v4)
- **Icons**: Lucide React
- **Language**: TypeScript

## 📦 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/puspoid/multi-ticker-visualizer.git
   cd multi-ticker-visualizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *Note: A local proxy is configured in `vite.config.ts` to route Yahoo Finance API requests and bypass CORS restrictions during development.*

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📝 License

MIT License.
