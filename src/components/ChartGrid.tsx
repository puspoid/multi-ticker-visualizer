import { ChartWidget } from './ChartWidget';
import type { TimeRange, ChartType } from '../App';

interface ChartGridProps {
    tickers: string[];
    timeRange: TimeRange;
    showMAs: boolean;
    chartType: ChartType;
    extendedHours: boolean;
    expandedTicker: string | null;
    onExpand: (ticker: string | null) => void;
}

export function ChartGrid({ tickers, timeRange, showMAs, chartType, extendedHours, expandedTicker, onExpand }: ChartGridProps) {
    if (tickers.length === 0) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30">
                <div className="text-center text-zinc-500">
                    <p className="mb-2">No tickers selected.</p>
                    <p className="text-sm">Add some tickers or create a new portfolio to get started.</p>
                </div>
            </div>
        );
    }

    // If a chart is expanded, show only that chart full width/height
    if (expandedTicker) {
        return (
            <div className="w-full h-[calc(100vh-16rem)] sm:h-[calc(100vh-12rem)] relative z-10 animate-in fade-in zoom-in-95 duration-200">
                <ChartWidget
                    ticker={expandedTicker}
                    timeRange={timeRange}
                    showMAs={showMAs}
                    chartType={chartType}
                    extendedHours={extendedHours}
                    isExpanded={true}
                    onExpandToggle={() => onExpand(null)}
                />
            </div>
        );
    }

    // Optimize grid for many charts
    let gridCols = 'grid-cols-1';
    if (tickers.length >= 2 && tickers.length <= 4) gridCols = 'sm:grid-cols-2 lg:grid-cols-2';
    else if (tickers.length >= 5) gridCols = 'sm:grid-cols-2 lg:grid-cols-3';

    return (
        <div className={`grid ${gridCols} gap-4 w-full h-full animate-in fade-in duration-300`}>
            {tickers.map((ticker) => (
                <div key={ticker} className="min-h-[300px]">
                    <ChartWidget
                        ticker={ticker}
                        timeRange={timeRange}
                        showMAs={showMAs}
                        chartType={chartType}
                        extendedHours={extendedHours}
                        isExpanded={false}
                        onExpandToggle={() => onExpand(ticker)}
                    />
                </div>
            ))}
        </div>
    );
}
