import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\ChatController::create
 * @see app/Http/Controllers/Api/Widget/ChatController.php:405
 * @route '/api/v1/widget/agent/messages'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/v1/widget/agent/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::create
 * @see app/Http/Controllers/Api/Widget/ChatController.php:405
 * @route '/api/v1/widget/agent/messages'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::create
 * @see app/Http/Controllers/Api/Widget/ChatController.php:405
 * @route '/api/v1/widget/agent/messages'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})
const messages = {
    create: Object.assign(create, create),
}

export default messages