import { Activity, Sun, Moon, Eye, EyeOff, BarChart2, TrendingUp, Clock, Clock3 } from 'lucide-react';
import type { TimeRange, ChartType } from '../App';
import { PortfolioManager } from './PortfolioManager';

interface HeaderProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    showMAs: boolean;
    onToggleMAs: () => void;
    chartType: ChartType;
    onToggleChartType: () => void;
    extendedHours: boolean;
    onToggleExtendedHours: () => void;
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
    portfolios: Record<string, string[]>;
    activePortfolio: string;
    currentTickers: string[];
    onSelectPortfolio: (name: string) => void;
    onSavePortfolio: (name: string, tickers: string[]) => void;
    onDeletePortfolio: (name: string) => void;
}

const TIME_RANGES: TimeRange[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y'];

export function Header({
    isDarkMode,
    onToggleTheme,
    showMAs,
    onToggleMAs,
    chartType,
    onToggleChartType,
    extendedHours,
    onToggleExtendedHours,
    timeRange,
    onTimeRangeChange,
    portfolios,
    activePortfolio,
    currentTickers,
    onSelectPortfolio,
    onSavePortfolio,
    onDeletePortfolio
}: HeaderProps) {
    return (
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-20 transition-colors duration-300 shadow-sm">
            <div className="max-w-[1920px] mx-auto px-4 py-3 sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-500/10 p-2 rounded-lg ring-1 ring-indigo-500/20">
                            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="font-semibold text-lg tracking-tight hidden md:block">Multi-Ticker Visualizer</h1>
                    </div>

                    {/* Mobile Time Ranges moved to top right on mobile */}
                    <div className="sm:hidden flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800 shrink-0">
                        {TIME_RANGES.map((range) => (
                            <button
                                key={range}
                                onClick={() => onTimeRangeChange(range)}
                                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${timeRange === range
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Portfolio Manager integrated into Header */}
                <div className="w-full sm:flex-1 sm:max-w-2xl sm:mx-6 flex items-center justify-center">
                    <PortfolioManager
                        portfolios={portfolios}
                        activePortfolio={activePortfolio}
                        currentTickers={currentTickers}
                        onSelect={onSelectPortfolio}
                        onSave={onSavePortfolio}
                        onDelete={onDeletePortfolio}
                        compact={true}
                    />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 disable-scrollbars shrink-0">
                    <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                        {TIME_RANGES.map((range) => (
                            <button
                                key={range}
                                onClick={() => onTimeRangeChange(range)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${timeRange === range
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onToggleMAs}
                            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-indigo-500/20"
                            title={showMAs ? "Hide Moving Averages" : "Show Moving Averages"}
                        >
                            {showMAs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span className="hidden lg:inline text-xs font-medium">MAs</span>
                        </button>

                        <button
                            onClick={onToggleChartType}
                            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-indigo-500/20"
                            title={chartType === 'candle' ? "Switch to Mountain Chart" : "Switch to Candlestick Chart"}
                        >
                            {chartType === 'candle' ? <BarChart2 className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                            <span className="hidden lg:inline text-xs font-medium">Type</span>
                        </button>

                        <button
                            onClick={onToggleExtendedHours}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 border ${extendedHours
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 border-transparent hover:border-indigo-500/20'}`}
                            title={extendedHours ? "Hide Extended Hours" : "Show Extended Hours"}
                        >
                            {extendedHours ? <Clock className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
                            <span className="hidden lg:inline text-xs font-medium">Ext</span>
                        </button>

                        <button
                            onClick={onToggleTheme}
                            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors border border-transparent hover:border-amber-500/20"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium">Live</span>
                    </div>
                </div>
            </div>

        </header>
    );
}
