import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectChatController::create
 * @see app/Http/Controllers/ProjectChatController.php:99
 * @route '/projects/{project}/chat/conversations'
 */
export const create = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::create
 * @see app/Http/Controllers/ProjectChatController.php:99
 * @route '/projects/{project}/chat/conversations'
 */
create.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::create
 * @see app/Http/Controllers/ProjectChatController.php:99
 * @route '/projects/{project}/chat/conversations'
 */
create.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::update
 * @see app/Http/Controllers/ProjectChatController.php:335
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
export const update = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/projects/{project}/chat/conversations/{conversation}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectChatController::update
 * @see app/Http/Controllers/ProjectChatController.php:335
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
update.url = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::update
 * @see app/Http/Controllers/ProjectChatController.php:335
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
update.put = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMethod
 * @see app/Http/Controllers/ProjectChatController.php:378
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
export const deleteMethod = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/projects/{project}/chat/conversations/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMethod
 * @see app/Http/Controllers/ProjectChatController.php:378
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
deleteMethod.url = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return deleteMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMethod
 * @see app/Http/Controllers/ProjectChatController.php:378
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
deleteMethod.delete = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})
const conversations = {
    create: Object.assign(create, create),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
}

export default conversations