import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
export const gmail = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: gmail.url(options),
    method: 'get',
})

gmail.definition = {
    methods: ["get","head"],
    url: '/emails/connect/gmail',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
gmail.url = (options?: RouteQueryOptions) => {
    return gmail.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
gmail.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: gmail.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
gmail.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: gmail.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
export const outlook = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outlook.url(options),
    method: 'get',
})

outlook.definition = {
    methods: ["get","head"],
    url: '/emails/connect/outlook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
outlook.url = (options?: RouteQueryOptions) => {
    return outlook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
outlook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outlook.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
outlook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: outlook.url(options),
    method: 'head',
})

const connect = {
    gmail: Object.assign(gmail, gmail),
    outlook: Object.assign(outlook, outlook),
}

export default connect