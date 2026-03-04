import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { fetchTickerData } from '../utils/api';
import { calculateSMA } from '../utils/indicators';
import { Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import type { TimeRange, ChartType } from '../App';

interface ChartWidgetProps {
    ticker: string;
    timeRange?: TimeRange;
    chartType?: ChartType;
    showMAs?: boolean;
    extendedHours?: boolean;
    isExpanded?: boolean;
    onExpandToggle?: () => void;
}

export function ChartWidget({
    ticker,
    timeRange = '1Y',
    chartType = 'candle',
    showMAs = true,
    extendedHours = false,
    isExpanded = false,
    onExpandToggle
}: ChartWidgetProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<any>(null);
    const smaSeriesRefs = useRef<ISeriesApi<"Line">[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPrice, setCurrentPrice] = useState<{ price: number; change: number; pctChange: number } | null>(null);

    // Recreate / Update Chart Data when ticker or range changes
    useEffect(() => {
        let isMounted = true;

        // Determine dynamic formatting based on time range
        const isIntraday = timeRange === '1D' || timeRange === '5D' || timeRange === '1M';

        const loadData = async () => {
            try {
                if (!chartRef.current) setLoading(true);
                setError(null);

                const { data, meta } = await fetchTickerData(ticker, timeRange, extendedHours);

                if (!isMounted) return;

                if (data.length === 0) {
                    throw new Error('No data available');
                }

                const latestPrice = meta.regularMarketPrice || data[data.length - 1].close;

                // For intraday ranges, meta.previousClose contains the real previous daily close.
                // For daily ranges (1Y, 6M etc), meta.previousClose is null, so we use yesterday's close from the data array.
                let prevClose = meta.previousClose;
                if (!prevClose) {
                    prevClose = data.length > 1 ? data[data.length - 2].close : latestPrice;
                }

                const change = latestPrice - prevClose;
                const pctChange = prevClose ? (change / prevClose) * 100 : 0;

                setCurrentPrice({
                    price: latestPrice,
                    change,
                    pctChange
                });

                // Subtle layout background change if extended hours are active
                const isDark = document.documentElement.classList.contains('dark');
                const bgColor = extendedHours
                    ? (isDark ? '#1a1f24' : '#f0fdf4') // Very subtle emerald tint
                    : 'transparent';

                // Initialize chart if container exists
                if (chartContainerRef.current && !chartRef.current) {
                    const chart = createChart(chartContainerRef.current, {
                        layout: {
                            background: { color: bgColor },
                            textColor: '#a1a1aa',
                        },
                        grid: {
                            vertLines: { color: 'rgba(39, 39, 42, 0.5)' },
                            horzLines: { color: 'rgba(39, 39, 42, 0.5)' },
                        },
                        rightPriceScale: {
                            borderVisible: false,
                            scaleMargins: {
                                top: 0.1,
                                bottom: 0.1,
                            },
                        },
                        timeScale: {
                            borderVisible: false,
                            timeVisible: isIntraday,
                            secondsVisible: false,
                        },
                        crosshair: {
                            mode: 1,
                            vertLine: {
                                color: '#52525b',
                                style: 3,
                                labelBackgroundColor: '#3f3f46',
                            },
                            horzLine: {
                                color: '#52525b',
                                style: 3,
                                labelBackgroundColor: '#3f3f46',
                            },
                        },
                        autoSize: true, // Will resize via ResizeObserver in LightweightCharts >= 4.0
                    });

                    chartRef.current = chart;

                    let mainSeries;
                    if (chartType === 'area') {
                        mainSeries = chart.addAreaSeries({
                            lineColor: '#10b981', // emerald-500
                            topColor: 'rgba(16, 185, 129, 0.4)',
                            bottomColor: 'rgba(16, 185, 129, 0)',
                            lineWidth: 2,
                        });
                    } else {
                        mainSeries = chart.addCandlestickSeries({
                            upColor: '#10b981',
                            downColor: '#ef4444',
                            borderVisible: false,
                            wickUpColor: '#10b981',
                            wickDownColor: '#ef4444',
                        });
                    }
                    seriesRef.current = mainSeries;

                    const maVids = [
                        { period: 9, color: '#3b82f6', title: 'SMA 9' },
                        { period: 21, color: '#f59e0b', title: 'SMA 21' },
                        { period: 50, color: '#ec4899', title: 'SMA 50' },
                        { period: 100, color: '#8b5cf6', title: 'SMA 100' },
                    ];

                    smaSeriesRefs.current = maVids.map(({ color, title }) => {
                        return chart.addLineSeries({
                            color,
                            lineWidth: 1,
                            title,
                            crosshairMarkerVisible: false,
                            lastValueVisible: false,
                            priceLineVisible: false,
                            visible: showMAs
                        });
                    });
                }

                // Apply timescale options and layout
                if (chartRef.current) {
                    chartRef.current.applyOptions({
                        timeScale: {
                            timeVisible: isIntraday,
                        },
                        layout: {
                            background: { color: bgColor }
                        }
                    });
                }

                // Create markers for sessions if Extended Hours are active
                let markers: any[] = [];
                if (extendedHours && meta.tradingPeriods && isIntraday) {
                    const addMarker = (time: any, text: string, color: string, position: 'aboveBar' | 'belowBar') => {
                        // Ensure the time exists in our dataset to anchor the marker
                        const matchingPoint = data.find((d: any) => d.time === time);
                        if (matchingPoint) {
                            markers.push({
                                time,
                                position,
                                color,
                                shape: position === 'aboveBar' ? 'arrowDown' : 'arrowUp',
                                text,
                            });
                        } else {
                            // Find closest subsequent point
                            const closest = data.find((d: any) => d.time > time);
                            if (closest) {
                                markers.push({
                                    time: closest.time,
                                    position,
                                    color,
                                    shape: position === 'aboveBar' ? 'arrowDown' : 'arrowUp',
                                    text,
                                });
                            }
                        }
                    };

                    if (meta.tradingPeriods.pre) addMarker(meta.tradingPeriods.pre.start, 'Pre-Market Open', '#6366f1', 'aboveBar');
                    if (meta.tradingPeriods.regular) {
                        addMarker(meta.tradingPeriods.regular.start, 'Market Open', '#10b981', 'belowBar');
                        addMarker(meta.tradingPeriods.regular.end, 'Market Close', '#ef4444', 'aboveBar');
                    }
                    if (meta.tradingPeriods.post) addMarker(meta.tradingPeriods.post.end, 'Post-Market Close', '#6366f1', 'aboveBar');
                }

                if (seriesRef.current) {
                    if (chartType === 'area') {
                        seriesRef.current.setData(data.map(d => ({
                            time: d.time as Time,
                            value: d.close
                        })));
                    } else {
                        seriesRef.current.setData(data.map(d => ({
                            time: d.time as Time,
                            open: d.open,
                            high: d.high,
                            low: d.low,
                            close: d.close
                        })));
                    }
                    // Apply Markers
                    seriesRef.current.setMarkers(markers);
                }

                const maPeriods = [9, 21, 50, 100];
                maPeriods.forEach((period, i) => {
                    if (smaSeriesRefs.current[i]) {
                        const smaData = calculateSMA(data, period);
                        smaSeriesRefs.current[i].setData(smaData.map(d => ({
                            time: d.time as Time,
                            value: d.value
                        })));
                    }
                });

            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    setError('Failed to load chart data');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    // Auto fit after initial render and when timeRange changes
                    if (chartRef.current) {
                        chartRef.current.timeScale().fitContent();
                    }
                }
            }
        };

        loadData();
        const interval = setInterval(loadData, 5 * 60 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [ticker, timeRange, chartType, extendedHours]); // Re-fetch when ticker, range, type, or extendedHours changes

    // Update MAs visibility when showMAs prop changes
    useEffect(() => {
        if (smaSeriesRefs.current && smaSeriesRefs.current.length > 0) {
            smaSeriesRefs.current.forEach(series => {
                series.applyOptions({ visible: showMAs });
            });
        }
    }, [showMAs]);

    return (
        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col relative transition-colors duration-300 ${isExpanded ? 'h-full shadow-2xl' : 'h-[300px] sm:h-full min-h-[300px] hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/50 flex justify-between items-center z-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-colors duration-300 group">

                <div className="flex items-center gap-3">
                    <h2
                        className={`font-bold text-lg tracking-tight ${onExpandToggle ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors' : ''}`}
                        onClick={onExpandToggle}
                        title={isExpanded ? "Minimize Chart" : "Expand Chart"}
                    >
                        {ticker}
                    </h2>
                    {onExpandToggle && (
                        <button
                            onClick={onExpandToggle}
                            className={`p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-100 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800`}
                        >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {currentPrice && !loading && (
                    <div className="flex flex-col items-end">
                        <span className="font-mono font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            ${currentPrice.price.toFixed(2)}
                        </span>
                        <span className={`text-xs font-medium flex items-center ${currentPrice.change >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {currentPrice.change >= 0 ? '+' : ''}{currentPrice.change.toFixed(2)} ({currentPrice.pctChange >= 0 ? '+' : ''}{currentPrice.pctChange.toFixed(2)}%)
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 relative bg-white dark:bg-zinc-900 transition-colors duration-300">
                {loading && !chartRef.current && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/80 dark:bg-zinc-900/80 z-20 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-20 text-rose-500 dark:text-rose-400 flex-col gap-2 px-4 text-center">
                        <AlertCircle className="w-8 h-8" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div ref={chartContainerRef} className="absolute inset-0" />
            </div>
        </div>
    );
}
