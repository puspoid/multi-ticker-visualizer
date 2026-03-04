import { useState, useEffect } from 'react';
import { ChartGrid } from './components/ChartGrid';
import { PortfolioManager } from './components/PortfolioManager';
import { Header } from './components/Header';

const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', 'AMD'];

export type TimeRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y';
export type ChartType = 'candle' | 'area';

function App() {
  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [portfolios, setPortfolios] = useState<Record<string, string[]>>({
    'Big Tech': DEFAULT_TICKERS,
  });
  const [activePortfolio, setActivePortfolio] = useState<string>('Big Tech');

  // New Global States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showMAs, setShowMAs] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  // Load portfolios and theme from localStorage on mount
  useEffect(() => {
    const savedPortfolios = localStorage.getItem('portfolios');
    if (savedPortfolios) {
      try {
        const parsed = JSON.parse(savedPortfolios);
        setPortfolios(parsed);
        const firstKey = Object.keys(parsed)[0];
        if (firstKey) {
          setActivePortfolio(firstKey);
          setTickers(parsed[firstKey]);
        }
      } catch (e) {
        console.error('Failed to parse portfolios from localStorage', e);
      }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setIsDarkMode(false);
    }
  }, []);

  // Save portfolios when they change
  useEffect(() => {
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
  }, [portfolios]);

  // Apply and save dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSelectPortfolio = (name: string) => {
    if (portfolios[name]) {
      setActivePortfolio(name);
      setTickers(portfolios[name]);
      setExpandedTicker(null);
    }
  };

  const handleSavePortfolio = (name: string, newTickers: string[]) => {
    setPortfolios((prev) => ({
      ...prev,
      [name]: newTickers,
    }));
    setActivePortfolio(name);
    setTickers(newTickers);
  };

  const handleDeletePortfolio = (name: string) => {
    const updated = { ...portfolios };
    delete updated[name];
    setPortfolios(updated);
    setExpandedTicker(null);

    // Select first available after delete
    const keys = Object.keys(updated);
    if (keys.length > 0) {
      setActivePortfolio(keys[0]);
      setTickers(updated[keys[0]]);
    } else {
      setActivePortfolio('');
      setTickers([]);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleMAs = () => setShowMAs(!showMAs);
  const toggleChartType = () => setChartType(prev => prev === 'candle' ? 'area' : 'candle');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        showMAs={showMAs}
        onToggleMAs={toggleMAs}
        chartType={chartType}
        onToggleChartType={toggleChartType}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <main className="flex-1 flex flex-col p-4 gap-4 max-w-[1920px] mx-auto w-full relative">
        <PortfolioManager
          portfolios={portfolios}
          activePortfolio={activePortfolio}
          currentTickers={tickers}
          onSelect={handleSelectPortfolio}
          onSave={handleSavePortfolio}
          onDelete={handleDeletePortfolio}
        />

        <div className="flex-1 min-h-0 relative">
          <ChartGrid
            tickers={tickers}
            timeRange={timeRange}
            showMAs={showMAs}
            chartType={chartType}
            expandedTicker={expandedTicker}
            onExpand={setExpandedTicker}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
