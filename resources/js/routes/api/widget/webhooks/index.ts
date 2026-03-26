import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::conversation
* @see app/Http/Controllers/Api/Widget/WebhookController.php:15
* @route '/api/v1/widget/webhooks/conversation-updated'
*/
export const conversation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: conversation.url(options),
    method: 'post',
})

conversation.definition = {
    methods: ["post"],
    url: '/api/v1/widget/webhooks/conversation-updated',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::conversation
* @see app/Http/Controllers/Api/Widget/WebhookController.php:15
* @route '/api/v1/widget/webhooks/conversation-updated'
*/
conversation.url = (options?: RouteQueryOptions) => {
    return conversation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::conversation
* @see app/Http/Controllers/Api/Widget/WebhookController.php:15
* @route '/api/v1/widget/webhooks/conversation-updated'
*/
conversation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: conversation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::message
* @see app/Http/Controllers/Api/Widget/WebhookController.php:57
* @route '/api/v1/widget/webhooks/message-received'
*/
export const message = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: message.url(options),
    method: 'post',
})

message.definition = {
    methods: ["post"],
    url: '/api/v1/widget/webhooks/message-received',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::message
* @see app/Http/Controllers/Api/Widget/WebhookController.php:57
* @route '/api/v1/widget/webhooks/message-received'
*/
message.url = (options?: RouteQueryOptions) => {
    return message.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::message
* @see app/Http/Controllers/Api/Widget/WebhookController.php:57
* @route '/api/v1/widget/webhooks/message-received'
*/
message.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: message.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::status
* @see app/Http/Controllers/Api/Widget/WebhookController.php:99
* @route '/api/v1/widget/webhooks/widget-status'
*/
export const status = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/api/v1/widget/webhooks/widget-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::status
* @see app/Http/Controllers/Api/Widget/WebhookController.php:99
* @route '/api/v1/widget/webhooks/widget-status'
*/
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::status
* @see app/Http/Controllers/Api/Widget/WebhookController.php:99
* @route '/api/v1/widget/webhooks/widget-status'
*/
status.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

const webhooks = {
    conversation: Object.assign(conversation, conversation),
    message: Object.assign(message, message),
    status: Object.assign(status, status),
}

export default webhooks