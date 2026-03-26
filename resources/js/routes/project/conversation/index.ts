import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import message from './message'
/**
* @see \App\Http\Controllers\ProjectChatController::show
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
export const show = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::show
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
show.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                conversation: args.conversation,
                }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::show
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
show.get = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::show
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
show.head = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::exportMethod
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
export const exportMethod = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::exportMethod
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
exportMethod.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                conversation: args.conversation,
                }

    return exportMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::exportMethod
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
exportMethod.get = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::exportMethod
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
exportMethod.head = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::statistics
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/statistics'
 */
export const statistics = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::statistics
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/statistics'
 */
statistics.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                conversation: args.conversation,
                }

    return statistics.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::statistics
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/statistics'
 */
statistics.get = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::statistics
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/statistics'
 */
statistics.head = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::pinned
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
export const pinned = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pinned.url(args, options),
    method: 'get',
})

pinned.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/pinned',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::pinned
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
pinned.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                conversation: args.conversation,
                }

    return pinned.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::pinned
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
pinned.get = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pinned.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::pinned
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
pinned.head = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pinned.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::search
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/search'
 */
export const search = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: search.url(args, options),
    method: 'post',
})

search.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/search',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::search
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/search'
 */
search.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                conversation: args.conversation,
                }

    return search.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::search
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/search'
 */
search.post = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: search.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::tag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
export const tag = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tag.url(args, options),
    method: 'get',
})

tag.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/tags/{tag}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::tag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
tag.url = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                    tag: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                conversation: args.conversation,
                                tag: args.tag,
                }

    return tag.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{tag}', parsedArgs.tag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::tag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
tag.get = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tag.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::tag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
tag.head = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tag.url(args, options),
    method: 'head',
})
const conversation = {
    show: Object.assign(show, show),
message: Object.assign(message, message),
export: Object.assign(exportMethod, exportMethod),
statistics: Object.assign(statistics, statistics),
pinned: Object.assign(pinned, pinned),
search: Object.assign(search, search),
tag: Object.assign(tag, tag),
}

export default conversation