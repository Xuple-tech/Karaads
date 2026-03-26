import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown } from 'lucide-react';
import axios from 'axios';

interface Tool {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon_url?: string;
  parameters?: Record<string, any>;
}

interface ToolSelectorProps {
  projectId: string;
  onToolSelected?: (tool: Tool) => void;
  disabled?: boolean;
}

export default function ToolSelector({
  projectId,
  onToolSelected,
  disabled = false,
}: ToolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTools();
    }
  }, [open, projectId]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${projectId}/tools`);
      setTools(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(tools.map(t => t.category))];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTool = (tool: Tool) => {
    onToolSelected?.(tool);
    setOpen(false);
    setSearchQuery('');
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      search: '🔍',
      file: '📁',
      api: '🔌',
      code: '💻',
      utility: '⚙️',
    };
    return icons[category] || '🔧';
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            <span className="truncate">Browse available tools...</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search tools..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />

            <div className="flex gap-2 px-3 py-2 border-b flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-2 py-1 rounded text-sm transition ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 rounded text-sm transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {getCategoryIcon(category)} {category}
                </button>
              ))}
            </div>

            <CommandEmpty>No tools found.</CommandEmpty>

            {categories.map(category => {
              const categoryTools = filteredTools.filter(t => t.category === category);
              if (categoryTools.length === 0) return null;

              return (
                <CommandGroup key={category} heading={`${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}>
                  {categoryTools.map(tool => (
                    <CommandItem
                      key={tool.id}
                      value={tool.id}
                      onSelect={() => handleSelectTool(tool)}
                      className="cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{tool.display_name}</div>
                        <div className="text-sm text-gray-600 truncate">{tool.description}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
