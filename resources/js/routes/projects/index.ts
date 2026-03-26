import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import chat from './chat'
import filesDccab9 from './files'
import members from './members'
import versions7d9d1c from './versions'
/**
* @see \App\Http\Controllers\ProjectController::update
* @see app/Http/Controllers/ProjectController.php:148
* @route '/projects/{project}'
*/
export const update = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/projects/{project}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectController::update
* @see app/Http/Controllers/ProjectController.php:148
* @route '/projects/{project}'
*/
update.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::update
* @see app/Http/Controllers/ProjectController.php:148
* @route '/projects/{project}'
*/
update.put = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectController::destroy
* @see app/Http/Controllers/ProjectController.php:175
* @route '/projects/{project}'
*/
export const destroy = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/projects/{project}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectController::destroy
* @see app/Http/Controllers/ProjectController.php:175
* @route '/projects/{project}'
*/
destroy.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::destroy
* @see app/Http/Controllers/ProjectController.php:175
* @route '/projects/{project}'
*/
destroy.delete = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
export const dashboard = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
dashboard.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return dashboard.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
dashboard.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
dashboard.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateCode
* @see app/Http/Controllers/EnhancedProjectController.php:172
* @route '/projects/{project}/generate-code'
*/
export const generateCode = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
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
generateCode.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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
generateCode.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::generateAnalytics
* @see app/Http/Controllers/EnhancedProjectController.php:214
* @route '/projects/{project}/generate-analytics'
*/
export const generateAnalytics = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
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
generateAnalytics.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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
generateAnalytics.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateAnalytics.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::analyzeQuality
* @see app/Http/Controllers/EnhancedProjectController.php:291
* @route '/projects/{project}/analyze-quality'
*/
export const analyzeQuality = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyzeQuality.url(args, options),
    method: 'post',
})

analyzeQuality.definition = {
    methods: ["post"],
    url: '/projects/{project}/analyze-quality',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::analyzeQuality
* @see app/Http/Controllers/EnhancedProjectController.php:291
* @route '/projects/{project}/analyze-quality'
*/
analyzeQuality.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return analyzeQuality.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::analyzeQuality
* @see app/Http/Controllers/EnhancedProjectController.php:291
* @route '/projects/{project}/analyze-quality'
*/
analyzeQuality.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyzeQuality.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::deploy
* @see app/Http/Controllers/EnhancedProjectController.php:336
* @route '/projects/{project}/deploy'
*/
export const deploy = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
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
deploy.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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
deploy.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deploy.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::metrics
* @see app/Http/Controllers/EnhancedProjectController.php:378
* @route '/projects/{project}/metrics'
*/
export const metrics = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metrics.url(args, options),
    method: 'get',
})

metrics.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/metrics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::metrics
* @see app/Http/Controllers/EnhancedProjectController.php:378
* @route '/projects/{project}/metrics'
*/
metrics.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return metrics.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::metrics
* @see app/Http/Controllers/EnhancedProjectController.php:378
* @route '/projects/{project}/metrics'
*/
metrics.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metrics.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::metrics
* @see app/Http/Controllers/EnhancedProjectController.php:378
* @route '/projects/{project}/metrics'
*/
metrics.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: metrics.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
export const files = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: files.url(args, options),
    method: 'get',
})

files.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/files',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
files.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return files.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
files.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: files.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
files.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: files.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
export const settings = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(args, options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
settings.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return settings.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
settings.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
settings.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
export const collaboration = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: collaboration.url(args, options),
    method: 'get',
})

collaboration.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/collaboration',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
collaboration.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return collaboration.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
collaboration.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: collaboration.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
collaboration.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: collaboration.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
export const analytics = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(args, options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
analytics.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return analytics.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
analytics.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
analytics.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
export const activity = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(args, options),
    method: 'get',
})

activity.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
activity.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return activity.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
activity.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
activity.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activity.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
export const versions = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})

versions.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/versions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
versions.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return versions.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
versions.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
versions.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: versions.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
export const templates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})

templates.definition = {
    methods: ["get","head"],
    url: '/projects/templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
templates.url = (options?: RouteQueryOptions) => {
    return templates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
templates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
templates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: templates.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::createFromTemplate
* @see app/Http/Controllers/ProjectController.php:458
* @route '/projects/from-template'
*/
export const createFromTemplate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createFromTemplate.url(options),
    method: 'post',
})

createFromTemplate.definition = {
    methods: ["post"],
    url: '/projects/from-template',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::createFromTemplate
* @see app/Http/Controllers/ProjectController.php:458
* @route '/projects/from-template'
*/
createFromTemplate.url = (options?: RouteQueryOptions) => {
    return createFromTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::createFromTemplate
* @see app/Http/Controllers/ProjectController.php:458
* @route '/projects/from-template'
*/
createFromTemplate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createFromTemplate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::saveAsTemplate
* @see app/Http/Controllers/ProjectController.php:482
* @route '/projects/{project}/save-as-template'
*/
export const saveAsTemplate = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAsTemplate.url(args, options),
    method: 'post',
})

saveAsTemplate.definition = {
    methods: ["post"],
    url: '/projects/{project}/save-as-template',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::saveAsTemplate
* @see app/Http/Controllers/ProjectController.php:482
* @route '/projects/{project}/save-as-template'
*/
saveAsTemplate.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return saveAsTemplate.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::saveAsTemplate
* @see app/Http/Controllers/ProjectController.php:482
* @route '/projects/{project}/save-as-template'
*/
saveAsTemplate.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAsTemplate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::archive
* @see app/Http/Controllers/ProjectController.php:531
* @route '/projects/{project}/archive'
*/
export const archive = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/projects/{project}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::archive
* @see app/Http/Controllers/ProjectController.php:531
* @route '/projects/{project}/archive'
*/
archive.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return archive.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::archive
* @see app/Http/Controllers/ProjectController.php:531
* @route '/projects/{project}/archive'
*/
archive.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::restore
* @see app/Http/Controllers/ProjectController.php:554
* @route '/projects/{project}/restore'
*/
export const restore = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/projects/{project}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::restore
* @see app/Http/Controllers/ProjectController.php:554
* @route '/projects/{project}/restore'
*/
restore.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return restore.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::restore
* @see app/Http/Controllers/ProjectController.php:554
* @route '/projects/{project}/restore'
*/
restore.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

const projects = {
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    dashboard: Object.assign(dashboard, dashboard),
    settings: Object.assign(settings, settings),
    generateCode: Object.assign(generateCode, generateCode),
    generateAnalytics: Object.assign(generateAnalytics, generateAnalytics),
    analyzeQuality: Object.assign(analyzeQuality, analyzeQuality),
    deploy: Object.assign(deploy, deploy),
    metrics: Object.assign(metrics, metrics),
    chat: Object.assign(chat, chat),
    files: Object.assign(files, filesDccab9),
    collaboration: Object.assign(collaboration, collaboration),
    members: Object.assign(members, members),
    analytics: Object.assign(analytics, analytics),
    activity: Object.assign(activity, activity),
    versions: Object.assign(versions, versions7d9d1c),
    templates: Object.assign(templates, templates),
    createFromTemplate: Object.assign(createFromTemplate, createFromTemplate),
    saveAsTemplate: Object.assign(saveAsTemplate, saveAsTemplate),
    archive: Object.assign(archive, archive),
    restore: Object.assign(restore, restore),
}

export default projects