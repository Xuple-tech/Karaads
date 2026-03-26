// components/chat/SearchBar.tsx
import { useState, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export default function SearchBar({ query, onSearch, onClear, isLoading }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    }
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(localQuery);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
            setShowResults(e.target.value.length > 0);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setLocalQuery('');
              onClear();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50">
          <ScrollArea className="max-h-60">
            {/* Recent Searches */}
            {localQuery === '' && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">Recent Searches</div>
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => {
                      setLocalQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <Clock className="h-3 w-3 mr-2" />
                    <span className="text-sm">{search}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {localQuery && (
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={() => handleSearch(localQuery)}
                disabled={isLoading}
              >
                <Search className="h-3 w-3 mr-2" />
                <span className="text-sm">
                  Search for "{localQuery}"
                  {isLoading && '...'}
                </span>
              </Button>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
