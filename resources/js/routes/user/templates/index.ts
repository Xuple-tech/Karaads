import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentTemplateController::index
* @see app/Http/Controllers/User/AgentTemplateController.php:14
* @route '/ai-agents/templates'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentTemplateController::index
* @see app/Http/Controllers/User/AgentTemplateController.php:14
* @route '/ai-agents/templates'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentTemplateController::index
* @see app/Http/Controllers/User/AgentTemplateController.php:14
* @route '/ai-agents/templates'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\User\AgentTemplateController::index
* @see app/Http/Controllers/User/AgentTemplateController.php:14
* @route '/ai-agents/templates'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentTemplateController::show
* @see app/Http/Controllers/User/AgentTemplateController.php:31
* @route '/ai-agents/templates/{template}'
*/
export const show = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ai-agents/templates/{template}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentTemplateController::show
* @see app/Http/Controllers/User/AgentTemplateController.php:31
* @route '/ai-agents/templates/{template}'
*/
show.url = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return show.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentTemplateController::show
* @see app/Http/Controllers/User/AgentTemplateController.php:31
* @route '/ai-agents/templates/{template}'
*/
show.get = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\User\AgentTemplateController::show
* @see app/Http/Controllers/User/AgentTemplateController.php:31
* @route '/ai-agents/templates/{template}'
*/
show.head = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentTemplateController::apply
* @see app/Http/Controllers/User/AgentTemplateController.php:50
* @route '/ai-agents/templates/{template}/apply'
*/
export const apply = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

apply.definition = {
    methods: ["post"],
    url: '/ai-agents/templates/{template}/apply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentTemplateController::apply
* @see app/Http/Controllers/User/AgentTemplateController.php:50
* @route '/ai-agents/templates/{template}/apply'
*/
apply.url = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return apply.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentTemplateController::apply
* @see app/Http/Controllers/User/AgentTemplateController.php:50
* @route '/ai-agents/templates/{template}/apply'
*/
apply.post = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

const templates = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    apply: Object.assign(apply, apply),
}

export default templates