import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::add
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2'
*/
export const add = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::add
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2'
*/
add.url = (options?: RouteQueryOptions) => {
    return add.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::add
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2'
*/
add.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\EmailController::update
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4'
*/
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::update
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4'
*/
update.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return update.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::update
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4'
*/
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\EmailController::deleteMethod
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6'
*/
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\EmailController::deleteMethod
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6'
*/
deleteMethod.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::deleteMethod
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6'
*/
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

const accounts = {
    list: Object.assign(list, list),
    add: Object.assign(add, add),
    update: Object.assign(update, update),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default accounts