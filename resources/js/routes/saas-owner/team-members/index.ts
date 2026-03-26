import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::index
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:21
 * @route '/saas-owner/team-members'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/saas-owner/team-members',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::index
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:21
 * @route '/saas-owner/team-members'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::index
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:21
 * @route '/saas-owner/team-members'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::index
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:21
 * @route '/saas-owner/team-members'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::create
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:51
 * @route '/saas-owner/team-members/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/saas-owner/team-members/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::create
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:51
 * @route '/saas-owner/team-members/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::create
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:51
 * @route '/saas-owner/team-members/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::create
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:51
 * @route '/saas-owner/team-members/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::store
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:59
 * @route '/saas-owner/team-members'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/saas-owner/team-members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::store
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:59
 * @route '/saas-owner/team-members'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::store
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:59
 * @route '/saas-owner/team-members'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::edit
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:85
 * @route '/saas-owner/team-members/{member}/edit'
 */
export const edit = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/saas-owner/team-members/{member}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::edit
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:85
 * @route '/saas-owner/team-members/{member}/edit'
 */
edit.url = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { member: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { member: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    member: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return edit.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::edit
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:85
 * @route '/saas-owner/team-members/{member}/edit'
 */
edit.get = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::edit
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:85
 * @route '/saas-owner/team-members/{member}/edit'
 */
edit.head = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::update
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:97
 * @route '/saas-owner/team-members/{member}'
 */
export const update = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/saas-owner/team-members/{member}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::update
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:97
 * @route '/saas-owner/team-members/{member}'
 */
update.url = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { member: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { member: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    member: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return update.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::update
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:97
 * @route '/saas-owner/team-members/{member}'
 */
update.put = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::deactivate
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:136
 * @route '/saas-owner/team-members/{member}/deactivate'
 */
export const deactivate = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deactivate.url(args, options),
    method: 'post',
})

deactivate.definition = {
    methods: ["post"],
    url: '/saas-owner/team-members/{member}/deactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::deactivate
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:136
 * @route '/saas-owner/team-members/{member}/deactivate'
 */
deactivate.url = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { member: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { member: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    member: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return deactivate.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::deactivate
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:136
 * @route '/saas-owner/team-members/{member}/deactivate'
 */
deactivate.post = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deactivate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::destroy
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:119
 * @route '/saas-owner/team-members/{member}'
 */
export const destroy = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/saas-owner/team-members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::destroy
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:119
 * @route '/saas-owner/team-members/{member}'
 */
destroy.url = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { member: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { member: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    member: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return destroy.definition.url
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\TeamMemberController::destroy
 * @see app/Http/Controllers/SaasOwner/TeamMemberController.php:119
 * @route '/saas-owner/team-members/{member}'
 */
destroy.delete = (args: { member: string | number | { id: string | number } } | [member: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const teamMembers = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
deactivate: Object.assign(deactivate, deactivate),
destroy: Object.assign(destroy, destroy),
}

export default teamMembers