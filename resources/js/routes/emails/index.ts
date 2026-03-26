import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import accounts from './accounts'
import rules from './rules'
import responses from './responses'
import connect from './connect'
import callback from './callback'
/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:392
 * @route '/api/emails/accounts/{accountId}/emails'
 */
export const list = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(args, options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/emails/accounts/{accountId}/emails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:392
 * @route '/api/emails/accounts/{accountId}/emails'
 */
list.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { accountId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    accountId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        accountId: args.accountId,
                }

    return list.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:392
 * @route '/api/emails/accounts/{accountId}/emails'
 */
list.get = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MailController::list
 * @see app/Http/Controllers/MailController.php:392
 * @route '/api/emails/accounts/{accountId}/emails'
 */
list.head = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::process
 * @see app/Http/Controllers/MailController.php:430
 * @route '/api/emails/{emailId}/process'
 */
export const process = (args: { emailId: string | number } | [emailId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: process.url(args, options),
    method: 'post',
})

process.definition = {
    methods: ["post"],
    url: '/api/emails/{emailId}/process',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::process
 * @see app/Http/Controllers/MailController.php:430
 * @route '/api/emails/{emailId}/process'
 */
process.url = (args: { emailId: string | number } | [emailId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { emailId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    emailId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        emailId: args.emailId,
                }

    return process.definition.url
            .replace('{emailId}', parsedArgs.emailId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::process
 * @see app/Http/Controllers/MailController.php:430
 * @route '/api/emails/{emailId}/process'
 */
process.post = (args: { emailId: string | number } | [emailId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: process.url(args, options),
    method: 'post',
})
const emails = {
    accounts: Object.assign(accounts, accounts),
list: Object.assign(list, list),
process: Object.assign(process, process),
rules: Object.assign(rules, rules),
responses: Object.assign(responses, responses),
connect: Object.assign(connect, connect),
callback: Object.assign(callback, callback),
}

export default emails