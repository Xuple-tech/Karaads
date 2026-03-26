import React, { useState } from 'react';
import { useToolStatus } from '@/hooks/useToolStatus';
import ToolStatusDisplay from '@/components/chat/ToolStatusDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ToolStatusTest = () => {
    const { activeTools, updateToolStatus, clearAllTools } = useToolStatus();
    const [testCounter, setTestCounter] = useState(0);

    const simulateWebSearch = () => {
        const toolName = 'web_search';

        // Start execution
        updateToolStatus({
            tool_name: toolName,
            tool_status: 'executing_tool',
            tool_executing_message: 'Searching for relevant information...',
            progress: 0
        });

        // Simulate progress updates
        setTimeout(() => {
            updateToolStatus({
                tool_name: toolName,
                tool_status: 'executing_tool',
                tool_executing_message: 'Processing search results...',
                progress: 75
            });
        }, 1000);

        // Complete
        setTimeout(() => {
            updateToolStatus({
                tool_name: toolName,
                tool_status: 'tool_completed',
                metadata: { results_count: 5 }
            });
        }, 2500);
    };

    const simulateImageGeneration = () => {
        const toolName = 'generate_image';

        // Start execution
        updateToolStatus({
            tool_name: toolName,
            tool_status: 'executing_tool',
            tool_executing_message: 'Preparing image generation...',
            progress: 10
        });

        // Progress updates
        setTimeout(() => {
            updateToolStatus({
                tool_name: toolName,
                tool_status: 'executing_tool',
                tool_executing_message: 'Creating high-quality images...',
                progress: 50
            });
        }, 1500);

        setTimeout(() => {
            updateToolStatus({
                tool_name: toolName,
                tool_status: 'executing_tool',
                tool_executing_message: 'Finalizing images...',
                progress: 90
            });
        }, 3000);

        // Complete
        setTimeout(() => {
            updateToolStatus({
                tool_name: toolName,
                tool_status: 'tool_completed',
                metadata: { images_generated: 2 }
            });
        }, 4000);
    };

    const simulateFailure = () => {
        const toolName = 'web_fetch';

        // Start execution
        updateToolStatus({
            tool_name: toolName,
            tool_status: 'executing_tool',
            tool_executing_message: 'Fetching webpage content...',
            progress: 30
        });

        // Fail after delay
        setTimeout(() => {
            updateToolStatus({
                tool_name: toolName,
                tool_status: 'tool_failed',
                tool_executing_message: 'Failed to connect to the website',
                metadata: { error: 'Connection timeout' }
            });
        }, 2000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tool Status System Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={simulateWebSearch}>
                            Test Web Search
                        </Button>
                        <Button onClick={simulateImageGeneration}>
                            Test Image Generation
                        </Button>
                        <Button onClick={simulateFailure} variant="destructive">
                            Test Failure
                        </Button>
                        <Button onClick={clearAllTools} variant="outline">
                            Clear All
                        </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Active tools: {activeTools.length}
                    </div>
                </CardContent>
            </Card>

            {/* Tool Status Display */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Tool Status (Compact View)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ToolStatusDisplay tools={activeTools} compact={true} />
                    {activeTools.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No active tools. Click a test button above to simulate tool execution.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tool Status Display - Full View */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Tool Status (Full View)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ToolStatusDisplay tools={activeTools} compact={false} />
                    {activeTools.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No active tools. Click a test button above to simulate tool execution.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ToolStatusTest;
