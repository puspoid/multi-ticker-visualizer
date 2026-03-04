export interface ChartData {
    time: string; // YYYY-MM-DD
    open: number;
    high: number;
    low: number;
    close: number;
    value: number; // For line series
}

export function calculateSMA(data: ChartData[], period: number): ChartData[] {
    const smaData: ChartData[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            // Not enough data points to calculate SMA
            continue;
        }

        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }

        smaData.push({
            ...data[i],
            value: sum / period,
        });
    }

    return smaData;
}
