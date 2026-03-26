import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MailController::connectImap
* @see app/Http/Controllers/MailController.php:335
* @route '/api/emails/accounts/imap'
*/
export const connectImap = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connectImap.url(options),
    method: 'post',
})

connectImap.definition = {
    methods: ["post"],
    url: '/api/emails/accounts/imap',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::connectImap
* @see app/Http/Controllers/MailController.php:335
* @route '/api/emails/accounts/imap'
*/
connectImap.url = (options?: RouteQueryOptions) => {
    return connectImap.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::connectImap
* @see app/Http/Controllers/MailController.php:335
* @route '/api/emails/accounts/imap'
*/
connectImap.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connectImap.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::disconnectAccount
* @see app/Http/Controllers/MailController.php:380
* @route '/api/emails/accounts/{accountId}'
*/
export const disconnectAccount = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnectAccount.url(args, options),
    method: 'delete',
})

disconnectAccount.definition = {
    methods: ["delete"],
    url: '/api/emails/accounts/{accountId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MailController::disconnectAccount
* @see app/Http/Controllers/MailController.php:380
* @route '/api/emails/accounts/{accountId}'
*/
disconnectAccount.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return disconnectAccount.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::disconnectAccount
* @see app/Http/Controllers/MailController.php:380
* @route '/api/emails/accounts/{accountId}'
*/
disconnectAccount.delete = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnectAccount.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MailController::syncEmails
* @see app/Http/Controllers/MailController.php:406
* @route '/api/emails/accounts/{accountId}/sync'
*/
export const syncEmails = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails.url(args, options),
    method: 'post',
})

syncEmails.definition = {
    methods: ["post"],
    url: '/api/emails/accounts/{accountId}/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::syncEmails
* @see app/Http/Controllers/MailController.php:406
* @route '/api/emails/accounts/{accountId}/sync'
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
* @see \App\Http\Controllers\MailController::syncEmails
* @see app/Http/Controllers/MailController.php:406
* @route '/api/emails/accounts/{accountId}/sync'
*/
syncEmails.post = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::getEmails
* @see app/Http/Controllers/MailController.php:392
* @route '/api/emails/accounts/{accountId}/emails'
*/
export const getEmails = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getEmails.url(args, options),
    method: 'get',
})

getEmails.definition = {
    methods: ["get","head"],
    url: '/api/emails/accounts/{accountId}/emails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::getEmails
* @see app/Http/Controllers/MailController.php:392
* @route '/api/emails/accounts/{accountId}/emails'
*/
getEmails.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getEmails.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::getEmails
* @see app/Http/Controllers/MailController.php:392
* @route '/api/emails/accounts/{accountId}/emails'
*/
getEmails.get = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getEmails.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::getEmails
* @see app/Http/Controllers/MailController.php:392
* @route '/api/emails/accounts/{accountId}/emails'
*/
getEmails.head = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getEmails.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::processEmail
* @see app/Http/Controllers/MailController.php:430
* @route '/api/emails/{emailId}/process'
*/
export const processEmail = (args: { emailId: string | number } | [emailId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processEmail.url(args, options),
    method: 'post',
})

processEmail.definition = {
    methods: ["post"],
    url: '/api/emails/{emailId}/process',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::processEmail
* @see app/Http/Controllers/MailController.php:430
* @route '/api/emails/{emailId}/process'
*/
processEmail.url = (args: { emailId: string | number } | [emailId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return processEmail.definition.url
            .replace('{emailId}', parsedArgs.emailId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::processEmail
* @see app/Http/Controllers/MailController.php:430
* @route '/api/emails/{emailId}/process'
*/
processEmail.post = (args: { emailId: string | number } | [emailId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processEmail.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::getRules
* @see app/Http/Controllers/MailController.php:449
* @route '/api/emails/rules'
*/
export const getRules = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getRules.url(options),
    method: 'get',
})

getRules.definition = {
    methods: ["get","head"],
    url: '/api/emails/rules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::getRules
* @see app/Http/Controllers/MailController.php:449
* @route '/api/emails/rules'
*/
getRules.url = (options?: RouteQueryOptions) => {
    return getRules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::getRules
* @see app/Http/Controllers/MailController.php:449
* @route '/api/emails/rules'
*/
getRules.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getRules.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::getRules
* @see app/Http/Controllers/MailController.php:449
* @route '/api/emails/rules'
*/
getRules.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getRules.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::createRule
* @see app/Http/Controllers/MailController.php:459
* @route '/api/emails/rules'
*/
export const createRule = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createRule.url(options),
    method: 'post',
})

createRule.definition = {
    methods: ["post"],
    url: '/api/emails/rules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::createRule
* @see app/Http/Controllers/MailController.php:459
* @route '/api/emails/rules'
*/
createRule.url = (options?: RouteQueryOptions) => {
    return createRule.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::createRule
* @see app/Http/Controllers/MailController.php:459
* @route '/api/emails/rules'
*/
createRule.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createRule.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::updateRule
* @see app/Http/Controllers/MailController.php:487
* @route '/api/emails/rules/{ruleId}'
*/
export const updateRule = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRule.url(args, options),
    method: 'put',
})

updateRule.definition = {
    methods: ["put"],
    url: '/api/emails/rules/{ruleId}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\MailController::updateRule
* @see app/Http/Controllers/MailController.php:487
* @route '/api/emails/rules/{ruleId}'
*/
updateRule.url = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateRule.definition.url
            .replace('{ruleId}', parsedArgs.ruleId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::updateRule
* @see app/Http/Controllers/MailController.php:487
* @route '/api/emails/rules/{ruleId}'
*/
updateRule.put = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRule.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\MailController::deleteRule
* @see app/Http/Controllers/MailController.php:516
* @route '/api/emails/rules/{ruleId}'
*/
export const deleteRule = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteRule.url(args, options),
    method: 'delete',
})

deleteRule.definition = {
    methods: ["delete"],
    url: '/api/emails/rules/{ruleId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MailController::deleteRule
* @see app/Http/Controllers/MailController.php:516
* @route '/api/emails/rules/{ruleId}'
*/
deleteRule.url = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteRule.definition.url
            .replace('{ruleId}', parsedArgs.ruleId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::deleteRule
* @see app/Http/Controllers/MailController.php:516
* @route '/api/emails/rules/{ruleId}'
*/
deleteRule.delete = (args: { ruleId: string | number } | [ruleId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteRule.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MailController::sendResponse
* @see app/Http/Controllers/MailController.php:528
* @route '/api/emails/responses/{responseId}/send'
*/
export const sendResponse = (args: { responseId: string | number } | [responseId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendResponse.url(args, options),
    method: 'post',
})

sendResponse.definition = {
    methods: ["post"],
    url: '/api/emails/responses/{responseId}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::sendResponse
* @see app/Http/Controllers/MailController.php:528
* @route '/api/emails/responses/{responseId}/send'
*/
sendResponse.url = (args: { responseId: string | number } | [responseId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { responseId: args }
    }

    if (Array.isArray(args)) {
        args = {
            responseId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        responseId: args.responseId,
    }

    return sendResponse.definition.url
            .replace('{responseId}', parsedArgs.responseId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::sendResponse
* @see app/Http/Controllers/MailController.php:528
* @route '/api/emails/responses/{responseId}/send'
*/
sendResponse.post = (args: { responseId: string | number } | [responseId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendResponse.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::mails
* @see app/Http/Controllers/MailController.php:33
* @route '/mails'
*/
export const mails = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mails.url(options),
    method: 'get',
})

mails.definition = {
    methods: ["get","head"],
    url: '/mails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::mails
* @see app/Http/Controllers/MailController.php:33
* @route '/mails'
*/
mails.url = (options?: RouteQueryOptions) => {
    return mails.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::mails
* @see app/Http/Controllers/MailController.php:33
* @route '/mails'
*/
mails.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mails.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::mails
* @see app/Http/Controllers/MailController.php:33
* @route '/mails'
*/
mails.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mails.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::showEmails
* @see app/Http/Controllers/MailController.php:48
* @route '/emails/accounts/{accountId}/emails'
*/
export const showEmails = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmails.url(args, options),
    method: 'get',
})

showEmails.definition = {
    methods: ["get","head"],
    url: '/emails/accounts/{accountId}/emails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::showEmails
* @see app/Http/Controllers/MailController.php:48
* @route '/emails/accounts/{accountId}/emails'
*/
showEmails.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showEmails.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::showEmails
* @see app/Http/Controllers/MailController.php:48
* @route '/emails/accounts/{accountId}/emails'
*/
showEmails.get = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmails.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::showEmails
* @see app/Http/Controllers/MailController.php:48
* @route '/emails/accounts/{accountId}/emails'
*/
showEmails.head = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showEmails.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::rules
* @see app/Http/Controllers/MailController.php:65
* @route '/emails/rules'
*/
export const rules = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rules.url(options),
    method: 'get',
})

rules.definition = {
    methods: ["get","head"],
    url: '/emails/rules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::rules
* @see app/Http/Controllers/MailController.php:65
* @route '/emails/rules'
*/
rules.url = (options?: RouteQueryOptions) => {
    return rules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::rules
* @see app/Http/Controllers/MailController.php:65
* @route '/emails/rules'
*/
rules.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rules.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::rules
* @see app/Http/Controllers/MailController.php:65
* @route '/emails/rules'
*/
rules.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: rules.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::connectGmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
export const connectGmail = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: connectGmail.url(options),
    method: 'get',
})

connectGmail.definition = {
    methods: ["get","head"],
    url: '/emails/connect/gmail',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::connectGmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
connectGmail.url = (options?: RouteQueryOptions) => {
    return connectGmail.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::connectGmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
connectGmail.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: connectGmail.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::connectGmail
* @see app/Http/Controllers/MailController.php:104
* @route '/emails/connect/gmail'
*/
connectGmail.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: connectGmail.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::gmailCallback
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
export const gmailCallback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: gmailCallback.url(options),
    method: 'get',
})

gmailCallback.definition = {
    methods: ["get","head"],
    url: '/emails/callback/gmail',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::gmailCallback
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
gmailCallback.url = (options?: RouteQueryOptions) => {
    return gmailCallback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::gmailCallback
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
gmailCallback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: gmailCallback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::gmailCallback
* @see app/Http/Controllers/MailController.php:125
* @route '/emails/callback/gmail'
*/
gmailCallback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: gmailCallback.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::connectOutlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
export const connectOutlook = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: connectOutlook.url(options),
    method: 'get',
})

connectOutlook.definition = {
    methods: ["get","head"],
    url: '/emails/connect/outlook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::connectOutlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
connectOutlook.url = (options?: RouteQueryOptions) => {
    return connectOutlook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::connectOutlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
connectOutlook.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: connectOutlook.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::connectOutlook
* @see app/Http/Controllers/MailController.php:202
* @route '/emails/connect/outlook'
*/
connectOutlook.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: connectOutlook.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MailController::outlookCallback
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
export const outlookCallback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outlookCallback.url(options),
    method: 'get',
})

outlookCallback.definition = {
    methods: ["get","head"],
    url: '/emails/callback/outlook',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::outlookCallback
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
outlookCallback.url = (options?: RouteQueryOptions) => {
    return outlookCallback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::outlookCallback
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
outlookCallback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outlookCallback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::outlookCallback
* @see app/Http/Controllers/MailController.php:231
* @route '/emails/callback/outlook'
*/
outlookCallback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: outlookCallback.url(options),
    method: 'head',
})

const MailController = { connectImap, disconnectAccount, syncEmails, getEmails, processEmail, getRules, createRule, updateRule, deleteRule, sendResponse, mails, showEmails, rules, connectGmail, gmailCallback, connectOutlook, outlookCallback }

export default MailController