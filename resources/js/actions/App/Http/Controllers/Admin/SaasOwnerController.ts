import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::index
* @see app/Http/Controllers/Admin/SaasOwnerController.php:13
* @route '/admin/saas-owners'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/saas-owners',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::index
* @see app/Http/Controllers/Admin/SaasOwnerController.php:13
* @route '/admin/saas-owners'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::index
* @see app/Http/Controllers/Admin/SaasOwnerController.php:13
* @route '/admin/saas-owners'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::index
* @see app/Http/Controllers/Admin/SaasOwnerController.php:13
* @route '/admin/saas-owners'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::create
* @see app/Http/Controllers/Admin/SaasOwnerController.php:22
* @route '/admin/saas-owners/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/saas-owners/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::create
* @see app/Http/Controllers/Admin/SaasOwnerController.php:22
* @route '/admin/saas-owners/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::create
* @see app/Http/Controllers/Admin/SaasOwnerController.php:22
* @route '/admin/saas-owners/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::create
* @see app/Http/Controllers/Admin/SaasOwnerController.php:22
* @route '/admin/saas-owners/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::store
* @see app/Http/Controllers/Admin/SaasOwnerController.php:30
* @route '/admin/saas-owners'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/saas-owners',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::store
* @see app/Http/Controllers/Admin/SaasOwnerController.php:30
* @route '/admin/saas-owners'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::store
* @see app/Http/Controllers/Admin/SaasOwnerController.php:30
* @route '/admin/saas-owners'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::show
* @see app/Http/Controllers/Admin/SaasOwnerController.php:54
* @route '/admin/saas-owners/{saas_owner}'
*/
export const show = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/saas-owners/{saas_owner}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::show
* @see app/Http/Controllers/Admin/SaasOwnerController.php:54
* @route '/admin/saas-owners/{saas_owner}'
*/
show.url = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { saas_owner: args }
    }

    if (Array.isArray(args)) {
        args = {
            saas_owner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        saas_owner: args.saas_owner,
    }

    return show.definition.url
            .replace('{saas_owner}', parsedArgs.saas_owner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::show
* @see app/Http/Controllers/Admin/SaasOwnerController.php:54
* @route '/admin/saas-owners/{saas_owner}'
*/
show.get = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::show
* @see app/Http/Controllers/Admin/SaasOwnerController.php:54
* @route '/admin/saas-owners/{saas_owner}'
*/
show.head = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::edit
* @see app/Http/Controllers/Admin/SaasOwnerController.php:62
* @route '/admin/saas-owners/{saas_owner}/edit'
*/
export const edit = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/saas-owners/{saas_owner}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::edit
* @see app/Http/Controllers/Admin/SaasOwnerController.php:62
* @route '/admin/saas-owners/{saas_owner}/edit'
*/
edit.url = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { saas_owner: args }
    }

    if (Array.isArray(args)) {
        args = {
            saas_owner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        saas_owner: args.saas_owner,
    }

    return edit.definition.url
            .replace('{saas_owner}', parsedArgs.saas_owner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::edit
* @see app/Http/Controllers/Admin/SaasOwnerController.php:62
* @route '/admin/saas-owners/{saas_owner}/edit'
*/
edit.get = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::edit
* @see app/Http/Controllers/Admin/SaasOwnerController.php:62
* @route '/admin/saas-owners/{saas_owner}/edit'
*/
edit.head = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::update
* @see app/Http/Controllers/Admin/SaasOwnerController.php:70
* @route '/admin/saas-owners/{saas_owner}'
*/
export const update = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/saas-owners/{saas_owner}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::update
* @see app/Http/Controllers/Admin/SaasOwnerController.php:70
* @route '/admin/saas-owners/{saas_owner}'
*/
update.url = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { saas_owner: args }
    }

    if (Array.isArray(args)) {
        args = {
            saas_owner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        saas_owner: args.saas_owner,
    }

    return update.definition.url
            .replace('{saas_owner}', parsedArgs.saas_owner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::update
* @see app/Http/Controllers/Admin/SaasOwnerController.php:70
* @route '/admin/saas-owners/{saas_owner}'
*/
update.put = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::update
* @see app/Http/Controllers/Admin/SaasOwnerController.php:70
* @route '/admin/saas-owners/{saas_owner}'
*/
update.patch = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::destroy
* @see app/Http/Controllers/Admin/SaasOwnerController.php:93
* @route '/admin/saas-owners/{saas_owner}'
*/
export const destroy = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/saas-owners/{saas_owner}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::destroy
* @see app/Http/Controllers/Admin/SaasOwnerController.php:93
* @route '/admin/saas-owners/{saas_owner}'
*/
destroy.url = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { saas_owner: args }
    }

    if (Array.isArray(args)) {
        args = {
            saas_owner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        saas_owner: args.saas_owner,
    }

    return destroy.definition.url
            .replace('{saas_owner}', parsedArgs.saas_owner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SaasOwnerController::destroy
* @see app/Http/Controllers/Admin/SaasOwnerController.php:93
* @route '/admin/saas-owners/{saas_owner}'
*/
destroy.delete = (args: { saas_owner: string | number } | [saas_owner: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const SaasOwnerController = { index, create, store, show, edit, update, destroy }

export default SaasOwnerController