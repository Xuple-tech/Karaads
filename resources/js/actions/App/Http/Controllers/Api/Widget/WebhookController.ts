import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::conversationUpdated
* @see app/Http/Controllers/Api/Widget/WebhookController.php:15
* @route '/api/v1/widget/webhooks/conversation-updated'
*/
export const conversationUpdated = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: conversationUpdated.url(options),
    method: 'post',
})

conversationUpdated.definition = {
    methods: ["post"],
    url: '/api/v1/widget/webhooks/conversation-updated',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::conversationUpdated
* @see app/Http/Controllers/Api/Widget/WebhookController.php:15
* @route '/api/v1/widget/webhooks/conversation-updated'
*/
conversationUpdated.url = (options?: RouteQueryOptions) => {
    return conversationUpdated.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::conversationUpdated
* @see app/Http/Controllers/Api/Widget/WebhookController.php:15
* @route '/api/v1/widget/webhooks/conversation-updated'
*/
conversationUpdated.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: conversationUpdated.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::messageReceived
* @see app/Http/Controllers/Api/Widget/WebhookController.php:57
* @route '/api/v1/widget/webhooks/message-received'
*/
export const messageReceived = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: messageReceived.url(options),
    method: 'post',
})

messageReceived.definition = {
    methods: ["post"],
    url: '/api/v1/widget/webhooks/message-received',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::messageReceived
* @see app/Http/Controllers/Api/Widget/WebhookController.php:57
* @route '/api/v1/widget/webhooks/message-received'
*/
messageReceived.url = (options?: RouteQueryOptions) => {
    return messageReceived.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::messageReceived
* @see app/Http/Controllers/Api/Widget/WebhookController.php:57
* @route '/api/v1/widget/webhooks/message-received'
*/
messageReceived.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: messageReceived.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::widgetStatus
* @see app/Http/Controllers/Api/Widget/WebhookController.php:99
* @route '/api/v1/widget/webhooks/widget-status'
*/
export const widgetStatus = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: widgetStatus.url(options),
    method: 'post',
})

widgetStatus.definition = {
    methods: ["post"],
    url: '/api/v1/widget/webhooks/widget-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::widgetStatus
* @see app/Http/Controllers/Api/Widget/WebhookController.php:99
* @route '/api/v1/widget/webhooks/widget-status'
*/
widgetStatus.url = (options?: RouteQueryOptions) => {
    return widgetStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\WebhookController::widgetStatus
* @see app/Http/Controllers/Api/Widget/WebhookController.php:99
* @route '/api/v1/widget/webhooks/widget-status'
*/
widgetStatus.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: widgetStatus.url(options),
    method: 'post',
})

const WebhookController = { conversationUpdated, messageReceived, widgetStatus }

export default WebhookController