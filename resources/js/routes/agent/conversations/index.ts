import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\ChatController::create
* @see app/Http/Controllers/Api/Widget/ChatController.php:368
* @route '/api/v1/widget/agent/conversations'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/v1/widget/agent/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::create
* @see app/Http/Controllers/Api/Widget/ChatController.php:368
* @route '/api/v1/widget/agent/conversations'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::create
* @see app/Http/Controllers/Api/Widget/ChatController.php:368
* @route '/api/v1/widget/agent/conversations'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

const conversations = {
    create: Object.assign(create, create),
}

export default conversations