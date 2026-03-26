import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import accounts from './accounts'
/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::list
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::show
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
export const show = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::show
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
show.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::show
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
show.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::show
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
show.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::send
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::send
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::send
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\EmailController::read
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4'
*/
export const read = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: read.url(args, options),
    method: 'put',
})

read.definition = {
    methods: ["put"],
    url: '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::read
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4'
*/
read.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return read.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::read
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4'
*/
read.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: read.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\EmailController::sync
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6'
*/
export const sync = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(args, options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::sync
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6'
*/
sync.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return sync.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::sync
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6'
*/
sync.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(args, options),
    method: 'post',
})

const email = {
    accounts: Object.assign(accounts, accounts),
    list: Object.assign(list, list),
    show: Object.assign(show, show),
    send: Object.assign(send, send),
    read: Object.assign(read, read),
    sync: Object.assign(sync, sync),
}

export default email