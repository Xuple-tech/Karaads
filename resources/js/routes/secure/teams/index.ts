import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import workflowsC7a9dd from './workflows'
/**
* @see \App\Http\Controllers\TeamController::list
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::list
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::list
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::list
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::create
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::create
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::create
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
*/
export const show = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
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
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
*/
show.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
*/
show.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9'
*/
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9'
*/
update.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9'
*/
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\TeamController::deleteMethod
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1'
*/
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeamController::deleteMethod
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1'
*/
deleteMethod.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::deleteMethod
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1'
*/
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
export const members = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members.url(args, options),
    method: 'get',
})

members.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
members.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return members.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
members.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
members.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: members.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::invite
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5'
*/
export const invite = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(args, options),
    method: 'post',
})

invite.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::invite
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5'
*/
invite.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return invite.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::invite
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5'
*/
invite.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::remove
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7'
*/
export const remove = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

remove.definition = {
    methods: ["delete"],
    url: '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeamController::remove
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7'
*/
remove.url = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
            memberUuid: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
        memberUuid: args.memberUuid,
    }

    return remove.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{memberUuid}', parsedArgs.memberUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::remove
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7'
*/
remove.delete = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TeamController::role
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9'
*/
export const role = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: role.url(args, options),
    method: 'put',
})

role.definition = {
    methods: ["put"],
    url: '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TeamController::role
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9'
*/
role.url = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
            memberUuid: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
        memberUuid: args.memberUuid,
    }

    return role.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{memberUuid}', parsedArgs.memberUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::role
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9'
*/
role.put = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: role.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
export const invitations = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invitations.url(args, options),
    method: 'get',
})

invitations.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
invitations.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return invitations.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
invitations.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invitations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
invitations.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: invitations.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::accept
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3'
*/
export const accept = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::accept
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3'
*/
accept.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return accept.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::accept
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3'
*/
accept.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::decline
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5'
*/
export const decline = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decline.url(args, options),
    method: 'post',
})

decline.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::decline
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5'
*/
decline.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return decline.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::decline
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5'
*/
decline.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decline.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::activity
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
export const activity = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(args, options),
    method: 'get',
})

activity.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::activity
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
activity.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return activity.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::activity
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
activity.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::activity
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
activity.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activity.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WorkflowController::workflows
* @see app/Http/Controllers/WorkflowController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
*/
export const workflows = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workflows.url(args, options),
    method: 'get',
})

workflows.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::workflows
* @see app/Http/Controllers/WorkflowController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
*/
workflows.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return workflows.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::workflows
* @see app/Http/Controllers/WorkflowController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
*/
workflows.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workflows.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WorkflowController::workflows
* @see app/Http/Controllers/WorkflowController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
*/
workflows.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: workflows.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WorkflowController::executions
* @see app/Http/Controllers/WorkflowController.php:291
* @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
*/
export const executions = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executions.url(args, options),
    method: 'get',
})

executions.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::executions
* @see app/Http/Controllers/WorkflowController.php:291
* @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
*/
executions.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return executions.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::executions
* @see app/Http/Controllers/WorkflowController.php:291
* @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
*/
executions.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executions.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WorkflowController::executions
* @see app/Http/Controllers/WorkflowController.php:291
* @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
*/
executions.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executions.url(args, options),
    method: 'head',
})

const teams = {
    list: Object.assign(list, list),
    create: Object.assign(create, create),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    delete: Object.assign(deleteMethod, deleteMethod),
    members: Object.assign(members, members),
    invite: Object.assign(invite, invite),
    remove: Object.assign(remove, remove),
    role: Object.assign(role, role),
    invitations: Object.assign(invitations, invitations),
    accept: Object.assign(accept, accept),
    decline: Object.assign(decline, decline),
    activity: Object.assign(activity, activity),
    workflows: Object.assign(workflows, workflowsC7a9dd),
    executions: Object.assign(executions, executions),
}

export default teams