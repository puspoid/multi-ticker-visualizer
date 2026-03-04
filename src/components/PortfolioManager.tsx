import { useState } from 'react';
import { Save, FolderLock, Plus, Trash2, Edit2, X } from 'lucide-react';

interface PortfolioManagerProps {
    portfolios: Record<string, string[]>;
    activePortfolio: string;
    currentTickers: string[];
    onSelect: (name: string) => void;
    onSave: (name: string, tickers: string[]) => void;
    onDelete: (name: string) => void;
    compact?: boolean;
}

export function PortfolioManager({
    portfolios,
    activePortfolio,
    currentTickers,
    onSelect,
    onSave,
    onDelete,
    compact = false
}: PortfolioManagerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState('');
    const [editTickersInput, setEditTickersInput] = useState('');

    const handleStartEdit = () => {
        setEditTickersInput(currentTickers.join(', '));
        setNewPortfolioName(activePortfolio);
        setIsEditing(true);
    };

    const handleStartNew = () => {
        setEditTickersInput('');
        setNewPortfolioName('');
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!newPortfolioName.trim()) return;

        // Parse input string into array of cleaned uppercase tickers
        const newTickers = editTickersInput
            .split(',')
            .map(t => t.trim().toUpperCase())
            .filter(t => t.length > 0);

        onSave(newPortfolioName.trim(), newTickers);
        setIsEditing(false);
    };

    return (
        <div className={`${compact ? 'w-full flex items-center justify-between gap-4' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'} transition-colors duration-300`}>
            <div className={`flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto disable-scrollbars ${compact ? 'flex-1' : ''}`}>
                <FolderLock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 hidden sm:block" />

                {Object.keys(portfolios).map(name => (
                    <button
                        key={name}
                        onClick={() => onSelect(name)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${activePortfolio === name
                            ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-800 dark:ring-zinc-700'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full animate-in fade-in slide-in-from-right-4 duration-300">
                        <input
                            type="text"
                            placeholder="Portfolio"
                            value={newPortfolioName}
                            onChange={(e) => setNewPortfolioName(e.target.value)}
                            className={`px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full ${compact ? 'sm:w-24' : 'sm:w-32'} transition-colors`}
                        />
                        <input
                            type="text"
                            placeholder="AAPL, MSFT, GOOGL..."
                            value={editTickersInput}
                            onChange={(e) => setEditTickersInput(e.target.value)}
                            className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1 min-w-[200px] transition-colors"
                        />
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <button onClick={handleSave} className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-md transition-colors ring-1 ring-indigo-500/20">
                                <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2 w-full justify-end">
                        <button
                            onClick={handleStartEdit}
                            className={`px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white ${compact ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800'} rounded-md transition-colors flex items-center gap-2`}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit{compact ? '' : ' Current'}</span>
                        </button>
                        <button
                            onClick={handleStartNew}
                            className={`px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white ${compact ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800'} rounded-md transition-colors flex items-center gap-2`}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">New</span>
                        </button>
                        {activePortfolio && Object.keys(portfolios).length > 1 && (
                            <button
                                onClick={() => onDelete(activePortfolio)}
                                className="p-1.5 text-rose-500/70 dark:text-rose-400/70 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10 rounded-md transition-colors"
                                title="Delete Portfolio"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
