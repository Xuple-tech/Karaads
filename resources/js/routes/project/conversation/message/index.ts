import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectChatController::create
* @see app/Http/Controllers/ProjectChatController.php:159
* @route '/api/projects/{project}/conversations/{conversation}/messages'
*/
export const create = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::create
* @see app/Http/Controllers/ProjectChatController.php:159
* @route '/api/projects/{project}/conversations/{conversation}/messages'
*/
create.url = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::create
* @see app/Http/Controllers/ProjectChatController.php:159
* @route '/api/projects/{project}/conversations/{conversation}/messages'
*/
create.post = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

const message = {
    create: Object.assign(create, create),
}

export default message