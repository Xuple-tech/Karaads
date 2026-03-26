import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/accounts'
*/
const listAccountscf87ae050231dacf0d116ae92ff46eff = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listAccountscf87ae050231dacf0d116ae92ff46eff.url(options),
    method: 'get',
})

listAccountscf87ae050231dacf0d116ae92ff46eff.definition = {
    methods: ["get","head"],
    url: '/api/email/accounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/accounts'
*/
listAccountscf87ae050231dacf0d116ae92ff46eff.url = (options?: RouteQueryOptions) => {
    return listAccountscf87ae050231dacf0d116ae92ff46eff.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/accounts'
*/
listAccountscf87ae050231dacf0d116ae92ff46eff.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listAccountscf87ae050231dacf0d116ae92ff46eff.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/accounts'
*/
listAccountscf87ae050231dacf0d116ae92ff46eff.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listAccountscf87ae050231dacf0d116ae92ff46eff.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
const listAccounts24053069b6966e5b7cb08517ed01ff35 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listAccounts24053069b6966e5b7cb08517ed01ff35.url(options),
    method: 'get',
})

listAccounts24053069b6966e5b7cb08517ed01ff35.definition = {
    methods: ["get","head"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
listAccounts24053069b6966e5b7cb08517ed01ff35.url = (options?: RouteQueryOptions) => {
    return listAccounts24053069b6966e5b7cb08517ed01ff35.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
listAccounts24053069b6966e5b7cb08517ed01ff35.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listAccounts24053069b6966e5b7cb08517ed01ff35.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::listAccounts
* @see app/Http/Controllers/Api/EmailController.php:22
* @route '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7'
*/
listAccounts24053069b6966e5b7cb08517ed01ff35.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listAccounts24053069b6966e5b7cb08517ed01ff35.url(options),
    method: 'head',
})

export const listAccounts = {
    '/api/email/accounts': listAccountscf87ae050231dacf0d116ae92ff46eff,
    '/api/email/mgmt/b6n9m2k5/accounts/list/v8c1x4z7': listAccounts24053069b6966e5b7cb08517ed01ff35,
}

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/accounts'
*/
const addAccountcf87ae050231dacf0d116ae92ff46eff = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addAccountcf87ae050231dacf0d116ae92ff46eff.url(options),
    method: 'post',
})

addAccountcf87ae050231dacf0d116ae92ff46eff.definition = {
    methods: ["post"],
    url: '/api/email/accounts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/accounts'
*/
addAccountcf87ae050231dacf0d116ae92ff46eff.url = (options?: RouteQueryOptions) => {
    return addAccountcf87ae050231dacf0d116ae92ff46eff.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/accounts'
*/
addAccountcf87ae050231dacf0d116ae92ff46eff.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addAccountcf87ae050231dacf0d116ae92ff46eff.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2'
*/
const addAccountd7763015bcb0f9a953fbfaf6b8bd388d = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addAccountd7763015bcb0f9a953fbfaf6b8bd388d.url(options),
    method: 'post',
})

addAccountd7763015bcb0f9a953fbfaf6b8bd388d.definition = {
    methods: ["post"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2'
*/
addAccountd7763015bcb0f9a953fbfaf6b8bd388d.url = (options?: RouteQueryOptions) => {
    return addAccountd7763015bcb0f9a953fbfaf6b8bd388d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::addAccount
* @see app/Http/Controllers/Api/EmailController.php:51
* @route '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2'
*/
addAccountd7763015bcb0f9a953fbfaf6b8bd388d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addAccountd7763015bcb0f9a953fbfaf6b8bd388d.url(options),
    method: 'post',
})

export const addAccount = {
    '/api/email/accounts': addAccountcf87ae050231dacf0d116ae92ff46eff,
    '/api/email/mgmt/b6n9m2k5/accounts/add/q3w6e9r2': addAccountd7763015bcb0f9a953fbfaf6b8bd388d,
}

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/accounts/{id}'
*/
const updateAccount96e2910cbbb67e98b7e070534f1df0a3 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAccount96e2910cbbb67e98b7e070534f1df0a3.url(args, options),
    method: 'put',
})

updateAccount96e2910cbbb67e98b7e070534f1df0a3.definition = {
    methods: ["put"],
    url: '/api/email/accounts/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/accounts/{id}'
*/
updateAccount96e2910cbbb67e98b7e070534f1df0a3.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateAccount96e2910cbbb67e98b7e070534f1df0a3.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/accounts/{id}'
*/
updateAccount96e2910cbbb67e98b7e070534f1df0a3.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAccount96e2910cbbb67e98b7e070534f1df0a3.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4'
*/
const updateAccount5ac1e47112ed667af85434cda0862a98 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAccount5ac1e47112ed667af85434cda0862a98.url(args, options),
    method: 'put',
})

updateAccount5ac1e47112ed667af85434cda0862a98.definition = {
    methods: ["put"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4'
*/
updateAccount5ac1e47112ed667af85434cda0862a98.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateAccount5ac1e47112ed667af85434cda0862a98.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::updateAccount
* @see app/Http/Controllers/Api/EmailController.php:96
* @route '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4'
*/
updateAccount5ac1e47112ed667af85434cda0862a98.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAccount5ac1e47112ed667af85434cda0862a98.url(args, options),
    method: 'put',
})

export const updateAccount = {
    '/api/email/accounts/{id}': updateAccount96e2910cbbb67e98b7e070534f1df0a3,
    '/api/email/mgmt/b6n9m2k5/accounts/update/{uuid}/t5y8u1i4': updateAccount5ac1e47112ed667af85434cda0862a98,
}

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/accounts/{id}'
*/
const deleteAccount96e2910cbbb67e98b7e070534f1df0a3 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccount96e2910cbbb67e98b7e070534f1df0a3.url(args, options),
    method: 'delete',
})

deleteAccount96e2910cbbb67e98b7e070534f1df0a3.definition = {
    methods: ["delete"],
    url: '/api/email/accounts/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/accounts/{id}'
*/
deleteAccount96e2910cbbb67e98b7e070534f1df0a3.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteAccount96e2910cbbb67e98b7e070534f1df0a3.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/accounts/{id}'
*/
deleteAccount96e2910cbbb67e98b7e070534f1df0a3.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccount96e2910cbbb67e98b7e070534f1df0a3.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6'
*/
const deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db.url(args, options),
    method: 'delete',
})

deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db.definition = {
    methods: ["delete"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6'
*/
deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::deleteAccount
* @see app/Http/Controllers/Api/EmailController.php:155
* @route '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6'
*/
deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db.url(args, options),
    method: 'delete',
})

export const deleteAccount = {
    '/api/email/accounts/{id}': deleteAccount96e2910cbbb67e98b7e070534f1df0a3,
    '/api/email/mgmt/b6n9m2k5/accounts/delete/{uuid}/o7p0a3s6': deleteAccountc7f7dc6e29a9c5e526afda9a01faf8db,
}

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/emails'
*/
const listEmails8241db442ab9ef2404fb396663a34250 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listEmails8241db442ab9ef2404fb396663a34250.url(options),
    method: 'get',
})

listEmails8241db442ab9ef2404fb396663a34250.definition = {
    methods: ["get","head"],
    url: '/api/email/emails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/emails'
*/
listEmails8241db442ab9ef2404fb396663a34250.url = (options?: RouteQueryOptions) => {
    return listEmails8241db442ab9ef2404fb396663a34250.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/emails'
*/
listEmails8241db442ab9ef2404fb396663a34250.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listEmails8241db442ab9ef2404fb396663a34250.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/emails'
*/
listEmails8241db442ab9ef2404fb396663a34250.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listEmails8241db442ab9ef2404fb396663a34250.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
const listEmails5e8e10d25bfee516acdd733a5ea69ee3 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listEmails5e8e10d25bfee516acdd733a5ea69ee3.url(options),
    method: 'get',
})

listEmails5e8e10d25bfee516acdd733a5ea69ee3.definition = {
    methods: ["get","head"],
    url: '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
listEmails5e8e10d25bfee516acdd733a5ea69ee3.url = (options?: RouteQueryOptions) => {
    return listEmails5e8e10d25bfee516acdd733a5ea69ee3.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
listEmails5e8e10d25bfee516acdd733a5ea69ee3.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listEmails5e8e10d25bfee516acdd733a5ea69ee3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::listEmails
* @see app/Http/Controllers/Api/EmailController.php:174
* @route '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8'
*/
listEmails5e8e10d25bfee516acdd733a5ea69ee3.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listEmails5e8e10d25bfee516acdd733a5ea69ee3.url(options),
    method: 'head',
})

export const listEmails = {
    '/api/email/emails': listEmails8241db442ab9ef2404fb396663a34250,
    '/api/email/mgmt/b6n9m2k5/emails/list/d9f2g5h8': listEmails5e8e10d25bfee516acdd733a5ea69ee3,
}

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/emails/{id}'
*/
const showEmail758a4684b2cf04d7239aa007ce42e074 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmail758a4684b2cf04d7239aa007ce42e074.url(args, options),
    method: 'get',
})

showEmail758a4684b2cf04d7239aa007ce42e074.definition = {
    methods: ["get","head"],
    url: '/api/email/emails/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/emails/{id}'
*/
showEmail758a4684b2cf04d7239aa007ce42e074.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showEmail758a4684b2cf04d7239aa007ce42e074.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/emails/{id}'
*/
showEmail758a4684b2cf04d7239aa007ce42e074.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmail758a4684b2cf04d7239aa007ce42e074.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/emails/{id}'
*/
showEmail758a4684b2cf04d7239aa007ce42e074.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showEmail758a4684b2cf04d7239aa007ce42e074.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
const showEmail3730fb2b37d0b5d16452ebeaf8ddb861 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmail3730fb2b37d0b5d16452ebeaf8ddb861.url(args, options),
    method: 'get',
})

showEmail3730fb2b37d0b5d16452ebeaf8ddb861.definition = {
    methods: ["get","head"],
    url: '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
showEmail3730fb2b37d0b5d16452ebeaf8ddb861.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showEmail3730fb2b37d0b5d16452ebeaf8ddb861.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
showEmail3730fb2b37d0b5d16452ebeaf8ddb861.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showEmail3730fb2b37d0b5d16452ebeaf8ddb861.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\EmailController::showEmail
* @see app/Http/Controllers/Api/EmailController.php:214
* @route '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0'
*/
showEmail3730fb2b37d0b5d16452ebeaf8ddb861.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showEmail3730fb2b37d0b5d16452ebeaf8ddb861.url(args, options),
    method: 'head',
})

export const showEmail = {
    '/api/email/emails/{id}': showEmail758a4684b2cf04d7239aa007ce42e074,
    '/api/email/mgmt/b6n9m2k5/emails/show/{uuid}/j1k4l7z0': showEmail3730fb2b37d0b5d16452ebeaf8ddb861,
}

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/send'
*/
const sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0.url(options),
    method: 'post',
})

sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0.definition = {
    methods: ["post"],
    url: '/api/email/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/send'
*/
sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0.url = (options?: RouteQueryOptions) => {
    return sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/send'
*/
sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2'
*/
const sendEmailefd3c6678ac2eb4786c45be1ba5f1846 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendEmailefd3c6678ac2eb4786c45be1ba5f1846.url(options),
    method: 'post',
})

sendEmailefd3c6678ac2eb4786c45be1ba5f1846.definition = {
    methods: ["post"],
    url: '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2'
*/
sendEmailefd3c6678ac2eb4786c45be1ba5f1846.url = (options?: RouteQueryOptions) => {
    return sendEmailefd3c6678ac2eb4786c45be1ba5f1846.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::sendEmail
* @see app/Http/Controllers/Api/EmailController.php:234
* @route '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2'
*/
sendEmailefd3c6678ac2eb4786c45be1ba5f1846.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendEmailefd3c6678ac2eb4786c45be1ba5f1846.url(options),
    method: 'post',
})

export const sendEmail = {
    '/api/email/send': sendEmailcfa8a3bacc5f4b2d91acf67c1eab0dd0,
    '/api/email/mgmt/b6n9m2k5/send/msg/x3c6v9b2': sendEmailefd3c6678ac2eb4786c45be1ba5f1846,
}

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/emails/{id}/read'
*/
const markAsReadc3eba7bd809dc309a61845a738f03235 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: markAsReadc3eba7bd809dc309a61845a738f03235.url(args, options),
    method: 'put',
})

markAsReadc3eba7bd809dc309a61845a738f03235.definition = {
    methods: ["put"],
    url: '/api/email/emails/{id}/read',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/emails/{id}/read'
*/
markAsReadc3eba7bd809dc309a61845a738f03235.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markAsReadc3eba7bd809dc309a61845a738f03235.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/emails/{id}/read'
*/
markAsReadc3eba7bd809dc309a61845a738f03235.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: markAsReadc3eba7bd809dc309a61845a738f03235.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4'
*/
const markAsRead8a7cfd33ccde49a42d34330e39557d02 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: markAsRead8a7cfd33ccde49a42d34330e39557d02.url(args, options),
    method: 'put',
})

markAsRead8a7cfd33ccde49a42d34330e39557d02.definition = {
    methods: ["put"],
    url: '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4'
*/
markAsRead8a7cfd33ccde49a42d34330e39557d02.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markAsRead8a7cfd33ccde49a42d34330e39557d02.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::markAsRead
* @see app/Http/Controllers/Api/EmailController.php:282
* @route '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4'
*/
markAsRead8a7cfd33ccde49a42d34330e39557d02.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: markAsRead8a7cfd33ccde49a42d34330e39557d02.url(args, options),
    method: 'put',
})

export const markAsRead = {
    '/api/email/emails/{id}/read': markAsReadc3eba7bd809dc309a61845a738f03235,
    '/api/email/mgmt/b6n9m2k5/emails/read/{uuid}/n5m8k1j4': markAsRead8a7cfd33ccde49a42d34330e39557d02,
}

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/accounts/{accountId}/sync'
*/
const syncEmails079104696772ef8a5f26eda3bf7a0553 = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails079104696772ef8a5f26eda3bf7a0553.url(args, options),
    method: 'post',
})

syncEmails079104696772ef8a5f26eda3bf7a0553.definition = {
    methods: ["post"],
    url: '/api/email/accounts/{accountId}/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/accounts/{accountId}/sync'
*/
syncEmails079104696772ef8a5f26eda3bf7a0553.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return syncEmails079104696772ef8a5f26eda3bf7a0553.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/accounts/{accountId}/sync'
*/
syncEmails079104696772ef8a5f26eda3bf7a0553.post = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails079104696772ef8a5f26eda3bf7a0553.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6'
*/
const syncEmails4fefcb19324c4e73a99545da7be5e1db = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails4fefcb19324c4e73a99545da7be5e1db.url(args, options),
    method: 'post',
})

syncEmails4fefcb19324c4e73a99545da7be5e1db.definition = {
    methods: ["post"],
    url: '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6'
*/
syncEmails4fefcb19324c4e73a99545da7be5e1db.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return syncEmails4fefcb19324c4e73a99545da7be5e1db.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\EmailController::syncEmails
* @see app/Http/Controllers/Api/EmailController.php:307
* @route '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6'
*/
syncEmails4fefcb19324c4e73a99545da7be5e1db.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncEmails4fefcb19324c4e73a99545da7be5e1db.url(args, options),
    method: 'post',
})

export const syncEmails = {
    '/api/email/accounts/{accountId}/sync': syncEmails079104696772ef8a5f26eda3bf7a0553,
    '/api/email/mgmt/b6n9m2k5/accounts/sync/{uuid}/w7e0r3t6': syncEmails4fefcb19324c4e73a99545da7be5e1db,
}

const EmailController = { listAccounts, addAccount, updateAccount, deleteAccount, listEmails, showEmail, sendEmail, markAsRead, syncEmails }

export default EmailController