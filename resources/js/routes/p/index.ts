import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\EnhancedProjectController::i
* @see app/Http/Controllers/EnhancedProjectController.php:38
* @route '/projects'
*/
export const i = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: i.url(options),
    method: 'get',
})

i.definition = {
    methods: ["get","head"],
    url: '/projects',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::i
* @see app/Http/Controllers/EnhancedProjectController.php:38
* @route '/projects'
*/
i.url = (options?: RouteQueryOptions) => {
    return i.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::i
* @see app/Http/Controllers/EnhancedProjectController.php:38
* @route '/projects'
*/
i.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: i.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::i
* @see app/Http/Controllers/EnhancedProjectController.php:38
* @route '/projects'
*/
i.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: i.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::c
* @see app/Http/Controllers/EnhancedProjectController.php:59
* @route '/projects/create'
*/
export const c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: c.url(options),
    method: 'get',
})

c.definition = {
    methods: ["get","head"],
    url: '/projects/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::c
* @see app/Http/Controllers/EnhancedProjectController.php:59
* @route '/projects/create'
*/
c.url = (options?: RouteQueryOptions) => {
    return c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::c
* @see app/Http/Controllers/EnhancedProjectController.php:59
* @route '/projects/create'
*/
c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::c
* @see app/Http/Controllers/EnhancedProjectController.php:59
* @route '/projects/create'
*/
c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: c.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\EnhancedProjectController::s
* @see app/Http/Controllers/EnhancedProjectController.php:72
* @route '/projects'
*/
export const s = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: s.url(options),
    method: 'post',
})

s.definition = {
    methods: ["post"],
    url: '/projects',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EnhancedProjectController::s
* @see app/Http/Controllers/EnhancedProjectController.php:72
* @route '/projects'
*/
s.url = (options?: RouteQueryOptions) => {
    return s.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EnhancedProjectController::s
* @see app/Http/Controllers/EnhancedProjectController.php:72
* @route '/projects'
*/
s.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: s.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::sh
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
export const sh = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sh.url(args, options),
    method: 'get',
})

sh.definition = {
    methods: ["get","head"],
    url: '/projects/{project}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::sh
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
sh.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return sh.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::sh
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
sh.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sh.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::sh
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
sh.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sh.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::e
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
export const e = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: e.url(args, options),
    method: 'get',
})

e.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::e
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
e.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return e.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::e
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
e.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: e.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::e
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
e.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: e.url(args, options),
    method: 'head',
})

const p = {
    i: Object.assign(i, i),
    c: Object.assign(c, c),
    s: Object.assign(s, s),
    sh: Object.assign(sh, sh),
    e: Object.assign(e, e),
}

export default p