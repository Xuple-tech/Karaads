import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\EnhancedProjectController::store
 * @see app/Http/Controllers/EnhancedProjectController.php:72
 * @route '/projects'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/projects',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::store
 * @see app/Http/Controllers/EnhancedProjectController.php:72
 * @route '/projects'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::store
 * @see app/Http/Controllers/EnhancedProjectController.php:72
 * @route '/projects'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateCode
 * @see app/Http/Controllers/EnhancedProjectController.php:172
 * @route '/projects/{project}/generate-code'
 */
export const generateCode = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateCode.url(args, options),
    method: 'post',
})

generateCode.definition = {
    methods: ["post"],
    url: '/projects/{project}/generate-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateCode
 * @see app/Http/Controllers/EnhancedProjectController.php:172
 * @route '/projects/{project}/generate-code'
 */
generateCode.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return generateCode.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateCode
 * @see app/Http/Controllers/EnhancedProjectController.php:172
 * @route '/projects/{project}/generate-code'
 */
generateCode.post = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateAnalytics
 * @see app/Http/Controllers/EnhancedProjectController.php:214
 * @route '/projects/{project}/generate-analytics'
 */
export const generateAnalytics = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateAnalytics.url(args, options),
    method: 'post',
})

generateAnalytics.definition = {
    methods: ["post"],
    url: '/projects/{project}/generate-analytics',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateAnalytics
 * @see app/Http/Controllers/EnhancedProjectController.php:214
 * @route '/projects/{project}/generate-analytics'
 */
generateAnalytics.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return generateAnalytics.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateAnalytics
 * @see app/Http/Controllers/EnhancedProjectController.php:214
 * @route '/projects/{project}/generate-analytics'
 */
generateAnalytics.post = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateAnalytics.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::analyzeCodeQuality
 * @see app/Http/Controllers/EnhancedProjectController.php:291
 * @route '/projects/{project}/analyze-quality'
 */
export const analyzeCodeQuality = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyzeCodeQuality.url(args, options),
    method: 'post',
})

analyzeCodeQuality.definition = {
    methods: ["post"],
    url: '/projects/{project}/analyze-quality',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::analyzeCodeQuality
 * @see app/Http/Controllers/EnhancedProjectController.php:291
 * @route '/projects/{project}/analyze-quality'
 */
analyzeCodeQuality.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return analyzeCodeQuality.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::analyzeCodeQuality
 * @see app/Http/Controllers/EnhancedProjectController.php:291
 * @route '/projects/{project}/analyze-quality'
 */
analyzeCodeQuality.post = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyzeCodeQuality.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::deploy
 * @see app/Http/Controllers/EnhancedProjectController.php:336
 * @route '/projects/{project}/deploy'
 */
export const deploy = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deploy.url(args, options),
    method: 'post',
})

deploy.definition = {
    methods: ["post"],
    url: '/projects/{project}/deploy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::deploy
 * @see app/Http/Controllers/EnhancedProjectController.php:336
 * @route '/projects/{project}/deploy'
 */
deploy.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return deploy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::deploy
 * @see app/Http/Controllers/EnhancedProjectController.php:336
 * @route '/projects/{project}/deploy'
 */
deploy.post = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deploy.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::getMetrics
 * @see app/Http/Controllers/EnhancedProjectController.php:378
 * @route '/projects/{project}/metrics'
 */
export const getMetrics = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMetrics.url(args, options),
    method: 'get',
})

getMetrics.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/metrics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::getMetrics
 * @see app/Http/Controllers/EnhancedProjectController.php:378
 * @route '/projects/{project}/metrics'
 */
getMetrics.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return getMetrics.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::getMetrics
 * @see app/Http/Controllers/EnhancedProjectController.php:378
 * @route '/projects/{project}/metrics'
 */
getMetrics.get = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMetrics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EnhancedProjectController::getMetrics
 * @see app/Http/Controllers/EnhancedProjectController.php:378
 * @route '/projects/{project}/metrics'
 */
getMetrics.head = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getMetrics.url(args, options),
    method: 'head',
})
const EnhancedProjectController = { store, generateCode, generateAnalytics, analyzeCodeQuality, deploy, getMetrics }

export default EnhancedProjectController