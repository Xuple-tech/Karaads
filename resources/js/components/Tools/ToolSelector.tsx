import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ToolOption {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  status: string;
  parameters: Record<string, any>;
  outputSchema: Record<string, any>;
  raw: Record<string, any>;
}

interface ToolSelectorProps {
  projectId: string;
  onToolSelected?: (tool: ToolOption) => void;
  disabled?: boolean;
}

const categoryIcons: Record<string, string> = {
  search: 'Search',
  file: 'File',
  api: 'API',
  code: 'Code',
  utility: 'Util',
  internal: 'Core',
};

function normalizeTool(tool: Record<string, any>): ToolOption {
  return {
    id: String(tool.id),
    name: tool.slug ?? tool.name ?? String(tool.id),
    displayName: tool.display_name ?? tool.name ?? tool.slug ?? 'Untitled tool',
    description: tool.description ?? '',
    category: tool.category ?? tool.type ?? 'internal',
    status: tool.status ?? (tool.is_active ? 'active' : 'inactive'),
    parameters: tool.parameters ?? tool.input_schema?.properties ?? {},
    outputSchema: tool.return_schema ?? tool.output_schema ?? {},
    raw: tool,
  };
}

export default function ToolSelector({
  projectId,
  onToolSelected,
  disabled = false,
}: ToolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<ToolOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchTools = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/workspace/projects/${projectId}/tools`);
        const nextTools = (response.data.data ?? []).map(normalizeTool);
        setTools(nextTools);
      } catch (error) {
        console.error('Failed to fetch workspace tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [open, projectId]);

  const categories = useMemo(
    () => [...new Set(tools.map((tool) => tool.category))],
    [tools]
  );

  const filteredTools = useMemo(
    () =>
      tools.filter((tool) => {
        const matchesSearch =
          tool.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || tool.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }),
    [searchQuery, selectedCategory, tools]
  );

  const selectTool = (tool: ToolOption) => {
    onToolSelected?.(tool);
    setOpen(false);
    setSearchQuery('');
  };

  const labelForCategory = (category: string) =>
    categoryIcons[category] ?? category.charAt(0).toUpperCase() + category.slice(1);

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

            <div className="flex flex-wrap gap-2 border-b px-3 py-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded px-2 py-1 text-sm transition ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded px-2 py-1 text-sm transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {labelForCategory(category)}
                </button>
              ))}
            </div>

            <CommandEmpty>{loading ? 'Loading tools...' : 'No tools found.'}</CommandEmpty>

            {categories.map((category) => {
              const categoryTools = filteredTools.filter((tool) => tool.category === category);
              if (categoryTools.length === 0) {
                return null;
              }

              return (
                <CommandGroup
                  key={category}
                  heading={labelForCategory(category)}
                >
                  {categoryTools.map((tool) => (
                    <CommandItem
                      key={tool.id}
                      value={`${tool.displayName} ${tool.description} ${tool.name}`}
                      onSelect={() => selectTool(tool)}
                      className="cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{tool.displayName}</div>
                        <div className="truncate text-sm text-gray-600">{tool.description}</div>
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
