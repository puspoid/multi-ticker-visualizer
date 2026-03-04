import type { ChartData } from './indicators';

export async function fetchTickerData(ticker: string, range: string = '1Y'): Promise<ChartData[]> {
    try {
        // Map ranges to optimal intervals
        let interval = '1d';
        let queryRange = '1y';

        if (range === '1D') { interval = '1m'; queryRange = '1d'; }
        else if (range === '5D') { interval = '5m'; queryRange = '5d'; }
        else if (range === '1M') { interval = '1h'; queryRange = '1mo'; }
        else if (range === '6M') { interval = '1d'; queryRange = '6mo'; }
        else if (range === 'YTD') { interval = '1d'; queryRange = 'ytd'; }
        else if (range === '1Y') { interval = '1d'; queryRange = '1y'; }

        // We use the local proxy configured in vite.config.ts to avoid CORS issues
        const url = `/api/finance/v8/finance/chart/${ticker}?interval=${interval}&range=${queryRange}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];

        if (!result) {
            throw new Error('No data found for ticker');
        }

        const timestamps: number[] = result.timestamp || [];
        const quote = result.indicators?.quote?.[0];

        if (!quote) {
            throw new Error('No quote data found');
        }

        const chartData: ChartData[] = [];

        for (let i = 0; i < timestamps.length; i++) {
            // Skip null values which can happen in YH finance data
            if (
                quote.open[i] === null ||
                quote.high[i] === null ||
                quote.low[i] === null ||
                quote.close[i] === null
            ) {
                continue;
            }

            const date = new Date(timestamps[i] * 1000);

            // For intraday (1D, 5D), lightweight charts expects UNIX timestamps for time
            // For daily (1M, 6M, YTD, 1Y), it expects YYYY-MM-DD
            const timeVal = (range === '1D' || range === '5D' || range === '1M')
                ? (timestamps[i] as any)
                : date.toISOString().split('T')[0];

            chartData.push({
                time: timeVal,
                open: quote.open[i],
                high: quote.high[i],
                low: quote.low[i],
                close: quote.close[i],
                value: quote.close[i] // default value
            });
        }

        // Sort chronologically just in case
        chartData.sort((a, b) => {
            const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
            const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
            return timeA - timeB;
        });

        // Remove duplicates having same time
        const uniqueData = chartData.filter((item, index, self) => {
            if (index === 0) return true;

            const prevTime = self[index - 1].time;
            const currTime = item.time;

            if (typeof prevTime === 'string' && typeof currTime === 'string') {
                return prevTime !== currTime;
            }
            if (typeof prevTime === 'number' && typeof currTime === 'number') {
                return prevTime !== currTime;
            }

            // If mixed types (shouldn't happen but defensive), convert to string
            return String(prevTime) !== String(currTime);
        });

        return uniqueData;
    } catch (error) {
        console.error(`Failed to fetch data for ${ticker}:`, error);
        throw error;
    }
}
