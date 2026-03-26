/**
 * Agent Intelligence Utilities
 * Helper functions for memory, workflows, and scheduling
 */

/**
 * Parse cron expression into human-readable format
 */
export function parseCronExpression(cron: string): string {
    const parts = cron.split(' ');
    if (parts.length < 5) return cron;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Build readable description
    let description = '';

    // Hour
    if (hour === '*') {
        description = 'Every hour';
    } else if (hour === '0') {
        description = 'At midnight';
    } else if (hour === '12') {
        description = 'At noon';
    } else {
        description = `At ${parseInt(hour)}:${minute === '0' ? '00' : minute}`;
    }

    // Day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayOfWeek !== '*') {
        const day = dayNames[parseInt(dayOfWeek)];
        description += ` on ${day}`;
    }

    // Day of month
    if (dayOfMonth !== '*' && dayOfMonth !== '1') {
        description += ` on day ${dayOfMonth}`;
    }

    return description;
}

/**
 * Validate cron expression format
 */
export function isValidCronExpression(cron: string): boolean {
    const parts = cron.split(' ');
    if (parts.length !== 5) return false;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts.map(p => p.trim());

    // Check if each part is either * or a valid number/range
    const isValidPart = (part: string, max: number): boolean => {
        if (part === '*') return true;
        if (/^\d+$/.test(part)) {
            const num = parseInt(part);
            return num >= 0 && num <= max;
        }
        if (/^\*\/\d+$/.test(part)) return true; // */n format
        if (/^\d+-\d+$/.test(part)) return true; // range format
        return false;
    };

    return (
        isValidPart(minute, 59) &&
        isValidPart(hour, 23) &&
        isValidPart(dayOfMonth, 31) &&
        isValidPart(month, 12) &&
        isValidPart(dayOfWeek, 6)
    );
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Calculate relevance score decay based on age
 */
export function calculateRelevanceDecay(createdAt: string, maxAge: number = 30): number {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

    if (ageInDays > maxAge) return 0;
    return Math.max(0, 1 - (ageInDays / maxAge));
}

/**
 * Generate workflow execution plan summary
 */
export function generateExecutionPlan(
    steps: any[],
    mode: 'sequential' | 'parallel' | 'conditional'
): string {
    if (mode === 'sequential') {
        return steps.map((s, i) => `${i + 1}. ${s.tool_name}`).join(' → ');
    } else if (mode === 'parallel') {
        return `All at once:\n${steps.map((s, i) => `  ${i + 1}. ${s.tool_name}`).join('\n')}`;
    } else {
        return `Conditional:\n${steps.map((s, i) => `  ${i + 1}. ${s.tool_name}`).join(' → ')}`;
    }
}

/**
 * Validate JSON parameters
 */
export function validateJsonParameters(json: string): { valid: boolean; error?: string; data?: any } {
    try {
        const data = JSON.parse(json);
        return { valid: true, data };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid JSON'
        };
    }
}

/**
 * Generate webhook token
 */
export function generateWebhookToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Memory search ranking algorithm
 */
export function rankMemoriesByRelevance(
    memories: any[],
    query: string
): any[] {
    return memories.sort((a, b) => {
        // Search term matches
        const aMatches = (a.context.match(new RegExp(query, 'gi')) || []).length;
        const bMatches = (b.context.match(new RegExp(query, 'gi')) || []).length;

        // Calculate score
        const aScore = aMatches + a.relevance_score + (a.used_count * 0.1);
        const bScore = bMatches + b.relevance_score + (b.used_count * 0.1);

        return bScore - aScore;
    });
}

/**
 * Extract template variables from string
 */
export function extractTemplateVariables(text: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]);
    }

    return [...new Set(matches)];
}

/**
 * Resolve template variables
 */
export function resolveTemplateVariables(
    text: string,
    context: Record<string, any>
): string {
    let result = text;
    const variables = extractTemplateVariables(text);

    for (const variable of variables) {
        const value = context[variable];
        if (value !== undefined) {
            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
            result = result.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), jsonValue);
        }
    }

    return result;
}

/**
 * Export data to markdown format
 */
export function exportToMarkdown(
    title: string,
    data: Record<string, any>
): string {
    let md = `# ${title}\n\nGenerated: ${new Date().toISOString()}\n\n`;

    for (const [key, value] of Object.entries(data)) {
        md += `## ${key}\n\n`;

        if (Array.isArray(value)) {
            value.forEach((item, i) => {
                md += `### ${key} #${i + 1}\n`;
                if (typeof item === 'object') {
                    md += '```json\n' + JSON.stringify(item, null, 2) + '\n```\n\n';
                } else {
                    md += `${item}\n\n`;
                }
            });
        } else if (typeof value === 'object') {
            md += '```json\n' + JSON.stringify(value, null, 2) + '\n```\n\n';
        } else {
            md += `${value}\n\n`;
        }
    }

    return md;
}

/**
 * Color coding for status
 */
export function getStatusColor(
    status: string
): { bg: string; text: string; border: string } {
    switch (status) {
        case 'completed':
        case 'active':
        case 'success':
            return {
                bg: 'bg-green-50 dark:bg-green-900',
                text: 'text-green-700 dark:text-green-200',
                border: 'border-green-200 dark:border-green-700'
            };
        case 'pending':
        case 'scheduled':
            return {
                bg: 'bg-yellow-50 dark:bg-yellow-900',
                text: 'text-yellow-700 dark:text-yellow-200',
                border: 'border-yellow-200 dark:border-yellow-700'
            };
        case 'running':
        case 'in_progress':
            return {
                bg: 'bg-blue-50 dark:bg-blue-900',
                text: 'text-blue-700 dark:text-blue-200',
                border: 'border-blue-200 dark:border-blue-700'
            };
        case 'failed':
        case 'error':
        case 'inactive':
            return {
                bg: 'bg-red-50 dark:bg-red-900',
                text: 'text-red-700 dark:text-red-200',
                border: 'border-red-200 dark:border-red-700'
            };
        default:
            return {
                bg: 'bg-gray-50 dark:bg-gray-800',
                text: 'text-gray-700 dark:text-gray-200',
                border: 'border-gray-200 dark:border-gray-700'
            };
    }
}
