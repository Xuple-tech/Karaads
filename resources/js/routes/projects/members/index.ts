import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectController::add
 * @see app/Http/Controllers/ProjectController.php:270
 * @route '/projects/{project}/members'
 */
export const add = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/projects/{project}/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::add
 * @see app/Http/Controllers/ProjectController.php:270
 * @route '/projects/{project}/members'
 */
add.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return add.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::add
 * @see app/Http/Controllers/ProjectController.php:270
 * @route '/projects/{project}/members'
 */
add.post = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::update
 * @see app/Http/Controllers/ProjectController.php:298
 * @route '/projects/{project}/members/{member}'
 */
export const update = (args: { project: string | number | { id: string | number }, member: string | number | { id: string | number } } | [project: string | number | { id: string | number }, member: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/projects/{project}/members/{member}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectController::update
 * @see app/Http/Controllers/ProjectController.php:298
 * @route '/projects/{project}/members/{member}'
 */
update.url = (args: { project: string | number | { id: string | number }, member: string | number | { id: string | number } } | [project: string | number | { id: string | number }, member: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    member: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::update
 * @see app/Http/Controllers/ProjectController.php:298
 * @route '/projects/{project}/members/{member}'
 */
update.put = (args: { project: string | number | { id: string | number }, member: string | number | { id: string | number } } | [project: string | number | { id: string | number }, member: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectController::remove
 * @see app/Http/Controllers/ProjectController.php:329
 * @route '/projects/{project}/members/{member}'
 */
export const remove = (args: { project: string | number | { id: string | number }, member: string | number | { id: string | number } } | [project: string | number | { id: string | number }, member: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

remove.definition = {
    methods: ["delete"],
    url: '/projects/{project}/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectController::remove
 * @see app/Http/Controllers/ProjectController.php:329
 * @route '/projects/{project}/members/{member}'
 */
remove.url = (args: { project: string | number | { id: string | number }, member: string | number | { id: string | number } } | [project: string | number | { id: string | number }, member: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    member: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                member: typeof args.member === 'object'
                ? args.member.id
                : args.member,
                }

    return remove.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::remove
 * @see app/Http/Controllers/ProjectController.php:329
 * @route '/projects/{project}/members/{member}'
 */
remove.delete = (args: { project: string | number | { id: string | number }, member: string | number | { id: string | number } } | [project: string | number | { id: string | number }, member: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})
const members = {
    add: Object.assign(add, add),
update: Object.assign(update, update),
remove: Object.assign(remove, remove),
}

export default members