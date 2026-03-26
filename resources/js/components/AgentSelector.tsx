import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronDown, Bot, User, Zap, Brain, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from 'axios';

interface Agent {
    id: string;
    name: string;
    description: string;
    avatar_url?: string;
    type: 'automation' | 'tool' | 'responder';
    capabilities: string[];
    available_tools: string[];
    is_system_agent: boolean;
    badge: string;
}

interface AgentSelectorProps {
    selectedAgent?: Agent | null;
    onAgentSelect: (agent: Agent | null) => void;
    className?: string;
    placeholder?: string;
    autoSelectCapability?: string;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
    selectedAgent,
    onAgentSelect,
    className,
    placeholder = "Select an agent...",
    autoSelectCapability
}) => {
    const [open, setOpen] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        if (autoSelectCapability && agents.length > 0) {
            autoSelectAgent(autoSelectCapability);
        }
    }, [autoSelectCapability, agents]);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/agents');
            setAgents(response.data.agents || []);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const autoSelectAgent = async (capability: string) => {
        try {
            const response = await axios.get(`/agents/capability/${capability}`);
            const recommendedAgent = response.data.recommended;
            if (recommendedAgent) {
                onAgentSelect(recommendedAgent);
            }
        } catch (error) {
            console.error('Failed to auto-select agent:', error);
        }
    };

    const getAgentIcon = (agent: Agent) => {
        if (agent.is_system_agent) {
            return <Bot className="h-4 w-4" />;
        }
        return <User className="h-4 w-4" />;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'automation':
                return <Zap className="h-3 w-3" />;
            case 'tool':
                return <Settings className="h-3 w-3" />;
            case 'responder':
                return <Brain className="h-3 w-3" />;
            default:
                return <Sparkles className="h-3 w-3" />;
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchValue.toLowerCase()))
    );

    const systemAgents = filteredAgents.filter(agent => agent.is_system_agent);
    const customAgents = filteredAgents.filter(agent => !agent.is_system_agent);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("justify-between min-w-[200px]", className)}
                >
                    {selectedAgent ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={selectedAgent.avatar_url} />
                                <AvatarFallback className="text-xs">
                                    {getAgentIcon(selectedAgent)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{selectedAgent.name}</span>
                            <Badge variant={selectedAgent.is_system_agent ? "default" : "secondary"} className="text-xs">
                                {selectedAgent.badge}
                            </Badge>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search agents..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {loading ? "Loading agents..." : "No agents found."}
                        </CommandEmpty>

                        {/* Clear Selection Option */}
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    onAgentSelect(null);
                                    setOpen(false);
                                }}
                                className="cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground">×</span>
                                    </div>
                                    <span className="text-muted-foreground">No agent (default AI)</span>
                                </div>
                                {!selectedAgent && <Check className="ml-auto h-4 w-4" />}
                            </CommandItem>
                        </CommandGroup>

                        <Separator />

                        {/* System Agents */}
                        {systemAgents.length > 0 && (
                            <CommandGroup heading="System Agents">
                                <ScrollArea className="max-h-[200px]">
                                    {systemAgents.map((agent) => (
                                        <CommandItem
                                            key={agent.id}
                                            onSelect={() => {
                                                onAgentSelect(agent);
                                                setOpen(false);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3 w-full">
                                                <Avatar className="h-8 w-8 mt-0.5">
                                                    <AvatarImage src={agent.avatar_url} />
                                                    <AvatarFallback className="text-xs">
                                                        {getAgentIcon(agent)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium truncate">{agent.name}</span>
                                                        <div className="flex items-center gap-1">
                                                            {getTypeIcon(agent.type)}
                                                            <Badge variant="default" className="text-xs">
                                                                {agent.badge}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {agent.description}
                                                    </p>
                                                    {agent.capabilities.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {agent.capabilities.slice(0, 3).map((capability) => (
                                                                <Badge key={capability} variant="outline" className="text-xs">
                                                                    {capability.replace('_', ' ')}
                                                                </Badge>
                                                            ))}
                                                            {agent.capabilities.length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{agent.capabilities.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedAgent?.id === agent.id && (
                                                <Check className="ml-2 h-4 w-4 shrink-0" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </ScrollArea>
                            </CommandGroup>
                        )}

                        {/* Custom Agents */}
                        {customAgents.length > 0 && (
                            <>
                                <Separator />
                                <CommandGroup heading="Custom Agents">
                                    <ScrollArea className="max-h-[200px]">
                                        {customAgents.map((agent) => (
                                            <CommandItem
                                                key={agent.id}
                                                onSelect={() => {
                                                    onAgentSelect(agent);
                                                    setOpen(false);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-start gap-3 w-full">
                                                    <Avatar className="h-8 w-8 mt-0.5">
                                                        <AvatarImage src={agent.avatar_url} />
                                                        <AvatarFallback className="text-xs">
                                                            {getAgentIcon(agent)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium truncate">{agent.name}</span>
                                                            <div className="flex items-center gap-1">
                                                                {getTypeIcon(agent.type)}
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {agent.badge}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {agent.description}
                                                        </p>
                                                        {agent.capabilities.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {agent.capabilities.slice(0, 3).map((capability) => (
                                                                    <Badge key={capability} variant="outline" className="text-xs">
                                                                        {capability.replace('_', ' ')}
                                                                    </Badge>
                                                                ))}
                                                                {agent.capabilities.length > 3 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{agent.capabilities.length - 3} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedAgent?.id === agent.id && (
                                                    <Check className="ml-2 h-4 w-4 shrink-0" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </ScrollArea>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default AgentSelector;
