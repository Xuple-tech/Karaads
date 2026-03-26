import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
export const gmail = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: gmail.url(options),
    method: 'get',
})

gmail.definition = {
    methods: ["get","head"],
    url: '/emails/callback/gmail',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
gmail.url = (options?: RouteQueryOptions) => {
    return gmail.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
gmail.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: gmail.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::gmail
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
gmail.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: gmail.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
export const outlook = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outlook.url(options),
    method: 'get',
})

outlook.definition = {
    methods: ["get","head"],
    url: '/emails/callback/outlook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
outlook.url = (options?: RouteQueryOptions) => {
    return outlook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
outlook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outlook.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::outlook
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
outlook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: outlook.url(options),
    method: 'head',
})

const callback = {
    gmail: Object.assign(gmail, gmail),
    outlook: Object.assign(outlook, outlook),
}

export default callback