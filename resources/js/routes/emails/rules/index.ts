import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:449
 * @route '/api/emails/rules'
 */
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/emails/rules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:449
 * @route '/api/emails/rules'
 */
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:449
 * @route '/api/emails/rules'
 */
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:449
 * @route '/api/emails/rules'
 */
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::create
 * @see app/Http/Controllers/MailController.php:459
 * @route '/api/emails/rules'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/emails/rules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::create
 * @see app/Http/Controllers/MailController.php:459
 * @route '/api/emails/rules'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::create
 * @see app/Http/Controllers/MailController.php:459
 * @route '/api/emails/rules'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::update
 * @see app/Http/Controllers/MailController.php:487
 * @route '/api/emails/rules/{ruleId}'
 */
export const update = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/emails/rules/{ruleId}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\MailController::update
 * @see app/Http/Controllers/MailController.php:487
 * @route '/api/emails/rules/{ruleId}'
 */
update.url = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ruleId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    ruleId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        ruleId: args.ruleId,
                }

    return update.definition.url
            .replace('{ruleId}', parsedArgs.ruleId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::update
 * @see app/Http/Controllers/MailController.php:487
 * @route '/api/emails/rules/{ruleId}'
 */
update.put = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\MailController::deleteMethod
 * @see app/Http/Controllers/MailController.php:516
 * @route '/api/emails/rules/{ruleId}'
 */
export const deleteMethod = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/emails/rules/{ruleId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MailController::deleteMethod
 * @see app/Http/Controllers/MailController.php:516
 * @route '/api/emails/rules/{ruleId}'
 */
deleteMethod.url = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ruleId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    ruleId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        ruleId: args.ruleId,
                }

    return deleteMethod.definition.url
            .replace('{ruleId}', parsedArgs.ruleId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::deleteMethod
 * @see app/Http/Controllers/MailController.php:516
 * @route '/api/emails/rules/{ruleId}'
 */
deleteMethod.delete = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MailController::index
 * @see app/Http/Controllers/MailController.php:65
 * @route '/emails/rules'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/emails/rules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::index
 * @see app/Http/Controllers/MailController.php:65
 * @route '/emails/rules'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::index
 * @see app/Http/Controllers/MailController.php:65
 * @route '/emails/rules'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MailController::index
 * @see app/Http/Controllers/MailController.php:65
 * @route '/emails/rules'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const rules = {
    list: Object.assign(list, list),
create: Object.assign(create, create),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
index: Object.assign(index, index),
}

export default rules