import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
 * @see app/Http/Controllers/Api/EmailController.php:22
 * @route '/api/email/accounts'
 */
export const listAccounts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listAccounts.url(options),
    method: 'get',
})

listAccounts.definition = {
    methods: ["get","head"],
    url: '/api/email/accounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
 * @see app/Http/Controllers/Api/EmailController.php:22
 * @route '/api/email/accounts'
 */
listAccounts.url = (options?: RouteQueryOptions) => {
    return listAccounts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
 * @see app/Http/Controllers/Api/EmailController.php:22
 * @route '/api/email/accounts'
 */
listAccounts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listAccounts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
 * @see app/Http/Controllers/Api/EmailController.php:22
 * @route '/api/email/accounts'
 */
listAccounts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listAccounts.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
 * @see app/Http/Controllers/Api/EmailController.php:51
 * @route '/api/email/accounts'
 */
export const addAccount = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addAccount.url(options),
    method: 'post',
})

addAccount.definition = {
    methods: ["post"],
    url: '/api/email/accounts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
 * @see app/Http/Controllers/Api/EmailController.php:51
 * @route '/api/email/accounts'
 */
addAccount.url = (options?: RouteQueryOptions) => {
    return addAccount.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
 * @see app/Http/Controllers/Api/EmailController.php:51
 * @route '/api/email/accounts'
 */
addAccount.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addAccount.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
 * @see app/Http/Controllers/Api/EmailController.php:96
 * @route '/api/email/accounts/{id}'
 */
export const updateAccount = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAccount.url(args, options),
    method: 'put',
})

updateAccount.definition = {
    methods: ["put"],
    url: '/api/email/accounts/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
 * @see app/Http/Controllers/Api/EmailController.php:96
 * @route '/api/email/accounts/{id}'
 */
updateAccount.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return updateAccount.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
 * @see app/Http/Controllers/Api/EmailController.php:96
 * @route '/api/email/accounts/{id}'
 */
updateAccount.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAccount.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
 * @see app/Http/Controllers/Api/EmailController.php:155
 * @route '/api/email/accounts/{id}'
 */
export const deleteAccount = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccount.url(args, options),
    method: 'delete',
})

deleteAccount.definition = {
    methods: ["delete"],
    url: '/api/email/accounts/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
 * @see app/Http/Controllers/Api/EmailController.php:155
 * @route '/api/email/accounts/{id}'
 */
deleteAccount.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return deleteAccount.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
 * @see app/Http/Controllers/Api/EmailController.php:155
 * @route '/api/email/accounts/{id}'
 */
deleteAccount.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccount.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
 * @see app/Http/Controllers/Api/EmailController.php:174
 * @route '/api/email/emails'
 */
export const listEmails = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listEmails.url(options),
    method: 'get',
})

listEmails.definition = {
    methods: ["get","head"],
    url: '/api/email/emails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
 * @see app/Http/Controllers/Api/EmailController.php:174
 * @route '/api/email/emails'
 */
listEmails.url = (options?: RouteQueryOptions) => {
    return listEmails.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
 * @see app/Http/Controllers/Api/EmailController.php:174
 * @route '/api/email/emails'
 */
listEmails.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listEmails.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
 * @see app/Http/Controllers/Api/EmailController.php:174
 * @route '/api/email/emails'
 */
listEmails.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listEmails.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
 * @see app/Http/Controllers/Api/EmailController.php:214
 * @route '/api/email/emails/{id}'
 */
export const showEmail = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmail.url(args, options),
    method: 'get',
})

showEmail.definition = {
    methods: ["get","head"],
    url: '/api/email/emails/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
 * @see app/Http/Controllers/Api/EmailController.php:214
 * @route '/api/email/emails/{id}'
 */
showEmail.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return showEmail.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
 * @see app/Http/Controllers/Api/EmailController.php:214
 * @route '/api/email/emails/{id}'
 */
showEmail.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmail.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
 * @see app/Http/Controllers/Api/EmailController.php:214
 * @route '/api/email/emails/{id}'
 */
showEmail.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showEmail.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
 * @see app/Http/Controllers/Api/EmailController.php:234
 * @route '/api/email/send'
 */
export const sendEmail = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendEmail.url(options),
    method: 'post',
})

sendEmail.definition = {
    methods: ["post"],
    url: '/api/email/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
 * @see app/Http/Controllers/Api/EmailController.php:234
 * @route '/api/email/send'
 */
sendEmail.url = (options?: RouteQueryOptions) => {
    return sendEmail.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
 * @see app/Http/Controllers/Api/EmailController.php:234
 * @route '/api/email/send'
 */
sendEmail.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendEmail.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
 * @see app/Http/Controllers/Api/EmailController.php:282
 * @route '/api/email/emails/{id}/read'
 */
export const markAsRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: markAsRead.url(args, options),
    method: 'put',
})

markAsRead.definition = {
    methods: ["put"],
    url: '/api/email/emails/{id}/read',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
 * @see app/Http/Controllers/Api/EmailController.php:282
 * @route '/api/email/emails/{id}/read'
 */
markAsRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return markAsRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
 * @see app/Http/Controllers/Api/EmailController.php:282
 * @route '/api/email/emails/{id}/read'
 */
markAsRead.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: markAsRead.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
 * @see app/Http/Controllers/Api/EmailController.php:307
 * @route '/api/email/accounts/{accountId}/sync'
 */
export const syncEmails = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails.url(args, options),
    method: 'post',
})

syncEmails.definition = {
    methods: ["post"],
    url: '/api/email/accounts/{accountId}/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
 * @see app/Http/Controllers/Api/EmailController.php:307
 * @route '/api/email/accounts/{accountId}/sync'
 */
syncEmails.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return syncEmails.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
 * @see app/Http/Controllers/Api/EmailController.php:307
 * @route '/api/email/accounts/{accountId}/sync'
 */
syncEmails.post = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails.url(args, options),
    method: 'post',
})
const EmailController = { listAccounts, addAccount, updateAccount, deleteAccount, listEmails, showEmail, sendEmail, markAsRead, syncEmails }

export default EmailController