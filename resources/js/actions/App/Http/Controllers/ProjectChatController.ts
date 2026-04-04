import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
export const index = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
index.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
index.get = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
index.head = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::createConversation
 * @see app/Http/Controllers/ProjectChatController.php:99
 * @route '/projects/{project}/chat/conversations'
 */
export const createConversation = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(args, options),
    method: 'post',
})

createConversation.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::createConversation
 * @see app/Http/Controllers/ProjectChatController.php:99
 * @route '/projects/{project}/chat/conversations'
 */
createConversation.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return createConversation.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::createConversation
 * @see app/Http/Controllers/ProjectChatController.php:99
 * @route '/projects/{project}/chat/conversations'
 */
createConversation.post = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::getMessages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
export const getMessages = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMessages.url(args, options),
    method: 'get',
})

getMessages.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/chat/conversations/{conversation}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::getMessages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
getMessages.url = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
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

    return getMessages.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::getMessages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
getMessages.get = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMessages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::getMessages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
getMessages.head = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getMessages.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::updateConversation
 * @see app/Http/Controllers/ProjectChatController.php:335
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
export const updateConversation = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateConversation.url(args, options),
    method: 'put',
})

updateConversation.definition = {
    methods: ["put"],
    url: '/projects/{project}/chat/conversations/{conversation}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectChatController::updateConversation
 * @see app/Http/Controllers/ProjectChatController.php:335
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
updateConversation.url = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
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

    return updateConversation.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::updateConversation
 * @see app/Http/Controllers/ProjectChatController.php:335
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
updateConversation.put = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateConversation.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectChatController::deleteConversation
 * @see app/Http/Controllers/ProjectChatController.php:378
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
export const deleteConversation = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation.url(args, options),
    method: 'delete',
})

deleteConversation.definition = {
    methods: ["delete"],
    url: '/projects/{project}/chat/conversations/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectChatController::deleteConversation
 * @see app/Http/Controllers/ProjectChatController.php:378
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
deleteConversation.url = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
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

    return deleteConversation.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::deleteConversation
 * @see app/Http/Controllers/ProjectChatController.php:378
 * @route '/projects/{project}/chat/conversations/{conversation}'
 */
deleteConversation.delete = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectChatController::sendMessage
 * @see app/Http/Controllers/ProjectChatController.php:159
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
export const sendMessage = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(args, options),
    method: 'post',
})

sendMessage.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations/{conversation}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::sendMessage
 * @see app/Http/Controllers/ProjectChatController.php:159
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
sendMessage.url = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
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

    return sendMessage.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::sendMessage
 * @see app/Http/Controllers/ProjectChatController.php:159
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
sendMessage.post = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::streamAIResponse
 * @see app/Http/Controllers/ProjectChatController.php:255
 * @route '/projects/{project}/chat/conversations/{conversation}/stream'
 */
export const streamAIResponse = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: streamAIResponse.url(args, options),
    method: 'post',
})

streamAIResponse.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations/{conversation}/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::streamAIResponse
 * @see app/Http/Controllers/ProjectChatController.php:255
 * @route '/projects/{project}/chat/conversations/{conversation}/stream'
 */
streamAIResponse.url = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
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

    return streamAIResponse.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::streamAIResponse
 * @see app/Http/Controllers/ProjectChatController.php:255
 * @route '/projects/{project}/chat/conversations/{conversation}/stream'
 */
streamAIResponse.post = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: streamAIResponse.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::togglePinMessage
 * @see app/Http/Controllers/ProjectChatController.php:433
 * @route '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin'
 */
export const togglePinMessage = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number }, chat: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number }, chat: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: togglePinMessage.url(args, options),
    method: 'post',
})

togglePinMessage.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::togglePinMessage
 * @see app/Http/Controllers/ProjectChatController.php:433
 * @route '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin'
 */
togglePinMessage.url = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number }, chat: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number }, chat: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                    chat: args[2],
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
                                chat: typeof args.chat === 'object'
                ? args.chat.id
                : args.chat,
                }

    return togglePinMessage.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::togglePinMessage
 * @see app/Http/Controllers/ProjectChatController.php:433
 * @route '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin'
 */
togglePinMessage.post = (args: { project: string | number | { id: string | number }, conversation: string | number | { id: string | number }, chat: string | number | { id: string | number } } | [project: string | number | { id: string | number }, conversation: string | number | { id: string | number }, chat: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: togglePinMessage.url(args, options),
    method: 'post',
})

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
* @see \App\Http\Controllers\ProjectChatController::exportConversation
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
export const exportConversation = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportConversation.url(args, options),
    method: 'get',
})

exportConversation.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::exportConversation
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
exportConversation.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
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

    return exportConversation.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::exportConversation
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
exportConversation.get = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportConversation.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::exportConversation
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/export'
 */
exportConversation.head = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportConversation.url(args, options),
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
* @see \App\Http\Controllers\ProjectChatController::pinnedMessages
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
export const pinnedMessages = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pinnedMessages.url(args, options),
    method: 'get',
})

pinnedMessages.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/pinned',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::pinnedMessages
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
pinnedMessages.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
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

    return pinnedMessages.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::pinnedMessages
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
pinnedMessages.get = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pinnedMessages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::pinnedMessages
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/pinned'
 */
pinnedMessages.head = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pinnedMessages.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::searchMessages
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/search'
 */
export const searchMessages = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: searchMessages.url(args, options),
    method: 'post',
})

searchMessages.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/search',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::searchMessages
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/search'
 */
searchMessages.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
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

    return searchMessages.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::searchMessages
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/search'
 */
searchMessages.post = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: searchMessages.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::messagesByTag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
export const messagesByTag = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesByTag.url(args, options),
    method: 'get',
})

messagesByTag.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/tags/{tag}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::messagesByTag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
messagesByTag.url = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions) => {
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

    return messagesByTag.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{tag}', parsedArgs.tag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::messagesByTag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
messagesByTag.get = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messagesByTag.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::messagesByTag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/tags/{tag}'
 */
messagesByTag.head = (args: { project: string | number, conversation: string | number, tag: string | number } | [project: string | number, conversation: string | number, tag: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messagesByTag.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::updateMessage
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
 */
export const updateMessage = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMessage.url(args, options),
    method: 'put',
})

updateMessage.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectChatController::updateMessage
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
 */
updateMessage.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
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

    return updateMessage.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::updateMessage
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
 */
updateMessage.put = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMessage.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMessage
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
 */
export const deleteMessage = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMessage.url(args, options),
    method: 'delete',
})

deleteMessage.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMessage
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
 */
deleteMessage.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
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

    return deleteMessage.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::deleteMessage
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}'
 */
deleteMessage.delete = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMessage.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectChatController::togglePin
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin'
 */
export const togglePin = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: togglePin.url(args, options),
    method: 'post',
})

togglePin.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::togglePin
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin'
 */
togglePin.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
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

    return togglePin.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::togglePin
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/pin'
 */
togglePin.post = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: togglePin.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::addTag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag'
 */
export const addTag = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addTag.url(args, options),
    method: 'post',
})

addTag.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::addTag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag'
 */
addTag.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
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

    return addTag.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::addTag
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/tag'
 */
addTag.post = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addTag.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::addMention
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention'
 */
export const addMention = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addMention.url(args, options),
    method: 'post',
})

addMention.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::addMention
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention'
 */
addMention.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
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

    return addMention.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::addMention
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/mention'
 */
addMention.post = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addMention.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::threadedReplies
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
 */
export const threadedReplies = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threadedReplies.url(args, options),
    method: 'get',
})

threadedReplies.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::threadedReplies
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
 */
threadedReplies.url = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions) => {
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

    return threadedReplies.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::threadedReplies
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
 */
threadedReplies.get = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threadedReplies.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::threadedReplies
 * @see app/Http/Controllers/ProjectChatController.php:0
 * @route '/api/projects/{project}/conversations/{conversation}/messages/{chat}/thread'
 */
threadedReplies.head = (args: { project: string | number, conversation: string | number, chat: string | number } | [project: string | number, conversation: string | number, chat: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: threadedReplies.url(args, options),
    method: 'head',
})
const ProjectChatController = { index, createConversation, getMessages, updateConversation, deleteConversation, sendMessage, streamAIResponse, togglePinMessage, show, exportConversation, statistics, pinnedMessages, searchMessages, messagesByTag, updateMessage, deleteMessage, togglePin, addTag, addMention, threadedReplies }

export default ProjectChatController