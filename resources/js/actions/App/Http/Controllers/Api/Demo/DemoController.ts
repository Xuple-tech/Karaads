import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getAgents
* @see app/Http/Controllers/Api/Demo/DemoController.php:16
* @route '/demo/api/agents'
*/
export const getAgents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAgents.url(options),
    method: 'get',
})

getAgents.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getAgents
* @see app/Http/Controllers/Api/Demo/DemoController.php:16
* @route '/demo/api/agents'
*/
getAgents.url = (options?: RouteQueryOptions) => {
    return getAgents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getAgents
* @see app/Http/Controllers/Api/Demo/DemoController.php:16
* @route '/demo/api/agents'
*/
getAgents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAgents.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getAgents
* @see app/Http/Controllers/Api/Demo/DemoController.php:16
* @route '/demo/api/agents'
*/
getAgents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAgents.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/demo/api/agents/{agent}/widget-settings'
*/
const getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.url(args, options),
    method: 'get',
})

getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents/{agent}/widget-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/demo/api/agents/{agent}/widget-settings'
*/
getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/demo/api/agents/{agent}/widget-settings'
*/
getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/demo/api/agents/{agent}/widget-settings'
*/
getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/widget/config/{agent}'
*/
const getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.url(args, options),
    method: 'get',
})

getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.definition = {
    methods: ["get","head"],
    url: '/widget/config/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/widget/config/{agent}'
*/
getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/widget/config/{agent}'
*/
getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetSettings
* @see app/Http/Controllers/Api/Demo/DemoController.php:35
* @route '/widget/config/{agent}'
*/
getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd.url(args, options),
    method: 'head',
})

export const getWidgetSettings = {
    '/demo/api/agents/{agent}/widget-settings': getWidgetSettingsf3a2dbcd3dcbf810a7be10248389f8ab,
    '/widget/config/{agent}': getWidgetSettingsf2b5e13eacacbf001f68d47b720bf6cd,
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/demo/api/agents/{agent}/script'
*/
const generateScriptba1b23ce43ec60d5f0724e82b1e70c33 = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateScriptba1b23ce43ec60d5f0724e82b1e70c33.url(args, options),
    method: 'get',
})

generateScriptba1b23ce43ec60d5f0724e82b1e70c33.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents/{agent}/script',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/demo/api/agents/{agent}/script'
*/
generateScriptba1b23ce43ec60d5f0724e82b1e70c33.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return generateScriptba1b23ce43ec60d5f0724e82b1e70c33.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/demo/api/agents/{agent}/script'
*/
generateScriptba1b23ce43ec60d5f0724e82b1e70c33.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateScriptba1b23ce43ec60d5f0724e82b1e70c33.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/demo/api/agents/{agent}/script'
*/
generateScriptba1b23ce43ec60d5f0724e82b1e70c33.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generateScriptba1b23ce43ec60d5f0724e82b1e70c33.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/widget/script/{agent}'
*/
const generateScriptda2ba5b8ac0f04e2714ea84914946e61 = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateScriptda2ba5b8ac0f04e2714ea84914946e61.url(args, options),
    method: 'get',
})

generateScriptda2ba5b8ac0f04e2714ea84914946e61.definition = {
    methods: ["get","head"],
    url: '/widget/script/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/widget/script/{agent}'
*/
generateScriptda2ba5b8ac0f04e2714ea84914946e61.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return generateScriptda2ba5b8ac0f04e2714ea84914946e61.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/widget/script/{agent}'
*/
generateScriptda2ba5b8ac0f04e2714ea84914946e61.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generateScriptda2ba5b8ac0f04e2714ea84914946e61.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::generateScript
* @see app/Http/Controllers/Api/Demo/DemoController.php:68
* @route '/widget/script/{agent}'
*/
generateScriptda2ba5b8ac0f04e2714ea84914946e61.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generateScriptda2ba5b8ac0f04e2714ea84914946e61.url(args, options),
    method: 'head',
})

export const generateScript = {
    '/demo/api/agents/{agent}/script': generateScriptba1b23ce43ec60d5f0724e82b1e70c33,
    '/widget/script/{agent}': generateScriptda2ba5b8ac0f04e2714ea84914946e61,
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetStats
* @see app/Http/Controllers/Api/Demo/DemoController.php:149
* @route '/demo/api/agents/{agent}/stats'
*/
export const getWidgetStats = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getWidgetStats.url(args, options),
    method: 'get',
})

getWidgetStats.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents/{agent}/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetStats
* @see app/Http/Controllers/Api/Demo/DemoController.php:149
* @route '/demo/api/agents/{agent}/stats'
*/
getWidgetStats.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return getWidgetStats.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetStats
* @see app/Http/Controllers/Api/Demo/DemoController.php:149
* @route '/demo/api/agents/{agent}/stats'
*/
getWidgetStats.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getWidgetStats.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getWidgetStats
* @see app/Http/Controllers/Api/Demo/DemoController.php:149
* @route '/demo/api/agents/{agent}/stats'
*/
getWidgetStats.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getWidgetStats.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getDemoData
* @see app/Http/Controllers/Api/Demo/DemoController.php:219
* @route '/demo/api/data'
*/
export const getDemoData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDemoData.url(options),
    method: 'get',
})

getDemoData.definition = {
    methods: ["get","head"],
    url: '/demo/api/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getDemoData
* @see app/Http/Controllers/Api/Demo/DemoController.php:219
* @route '/demo/api/data'
*/
getDemoData.url = (options?: RouteQueryOptions) => {
    return getDemoData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getDemoData
* @see app/Http/Controllers/Api/Demo/DemoController.php:219
* @route '/demo/api/data'
*/
getDemoData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDemoData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::getDemoData
* @see app/Http/Controllers/Api/Demo/DemoController.php:219
* @route '/demo/api/data'
*/
getDemoData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getDemoData.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::testConversation
* @see app/Http/Controllers/Api/Demo/DemoController.php:107
* @route '/demo/api/agents/{agent}/conversation'
*/
export const testConversation = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testConversation.url(args, options),
    method: 'post',
})

testConversation.definition = {
    methods: ["post"],
    url: '/demo/api/agents/{agent}/conversation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::testConversation
* @see app/Http/Controllers/Api/Demo/DemoController.php:107
* @route '/demo/api/agents/{agent}/conversation'
*/
testConversation.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return testConversation.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::testConversation
* @see app/Http/Controllers/Api/Demo/DemoController.php:107
* @route '/demo/api/agents/{agent}/conversation'
*/
testConversation.post = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testConversation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::validateConfig
* @see app/Http/Controllers/Api/Demo/DemoController.php:175
* @route '/demo/api/validate-config'
*/
export const validateConfig = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validateConfig.url(options),
    method: 'post',
})

validateConfig.definition = {
    methods: ["post"],
    url: '/demo/api/validate-config',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::validateConfig
* @see app/Http/Controllers/Api/Demo/DemoController.php:175
* @route '/demo/api/validate-config'
*/
validateConfig.url = (options?: RouteQueryOptions) => {
    return validateConfig.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::validateConfig
* @see app/Http/Controllers/Api/Demo/DemoController.php:175
* @route '/demo/api/validate-config'
*/
validateConfig.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validateConfig.url(options),
    method: 'post',
})

const DemoController = { getAgents, getWidgetSettings, generateScript, getWidgetStats, getDemoData, testConversation, validateConfig }

export default DemoController