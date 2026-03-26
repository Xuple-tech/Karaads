import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectChatController::update
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
*/
export const update = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectChatController::update
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
*/
update.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            conversation: args[1],
            chat: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: args.project,
        conversation: args.conversation,
        chat: args.chat,
    }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::update
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
*/
update.put = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMethod
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
*/
export const deleteMethod = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMethod
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
*/
deleteMethod.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            conversation: args[1],
            chat: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: args.project,
        conversation: args.conversation,
        chat: args.chat,
    }

    return deleteMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMethod
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
*/
deleteMethod.delete = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectChatController::pin
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin'
*/
export const pin = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})

pin.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::pin
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin'
*/
pin.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            conversation: args[1],
            chat: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: args.project,
        conversation: args.conversation,
        chat: args.chat,
    }

    return pin.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::pin
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin'
*/
pin.post = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::tag
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag'
*/
export const tag = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tag.url(args, options),
    method: 'post',
})

tag.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::tag
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag'
*/
tag.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            conversation: args[1],
            chat: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: args.project,
        conversation: args.conversation,
        chat: args.chat,
    }

    return tag.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::tag
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag'
*/
tag.post = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tag.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::mention
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention'
*/
export const mention = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mention.url(args, options),
    method: 'post',
})

mention.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::mention
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention'
*/
mention.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            conversation: args[1],
            chat: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: args.project,
        conversation: args.conversation,
        chat: args.chat,
    }

    return mention.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::mention
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention'
*/
mention.post = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mention.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::thread
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
*/
export const thread = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: thread.url(args, options),
    method: 'get',
})

thread.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::thread
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
*/
thread.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            conversation: args[1],
            chat: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: args.project,
        conversation: args.conversation,
        chat: args.chat,
    }

    return thread.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::thread
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
*/
thread.get = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: thread.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectChatController::thread
* @see app/Http/Controllers/ProjectChatController.php:0
* @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
*/
thread.head = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: thread.url(args, options),
    method: 'head',
})

const message = {
    update: Object.assign(update, update),
    delete: Object.assign(deleteMethod, deleteMethod),
    pin: Object.assign(pin, pin),
    tag: Object.assign(tag, tag),
    mention: Object.assign(mention, mention),
    thread: Object.assign(thread, thread),
}

export default message