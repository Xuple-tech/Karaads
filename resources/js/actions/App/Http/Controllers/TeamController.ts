import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams'
*/
const indexfad30589d2bb00aed9e7f2aac6e0382f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexfad30589d2bb00aed9e7f2aac6e0382f.url(options),
    method: 'get',
})

indexfad30589d2bb00aed9e7f2aac6e0382f.definition = {
    methods: ["get","head"],
    url: '/api/teams',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams'
*/
indexfad30589d2bb00aed9e7f2aac6e0382f.url = (options?: RouteQueryOptions) => {
    return indexfad30589d2bb00aed9e7f2aac6e0382f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams'
*/
indexfad30589d2bb00aed9e7f2aac6e0382f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexfad30589d2bb00aed9e7f2aac6e0382f.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams'
*/
indexfad30589d2bb00aed9e7f2aac6e0382f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexfad30589d2bb00aed9e7f2aac6e0382f.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
const index4bf08c42810ffbe560db295b8342a20f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index4bf08c42810ffbe560db295b8342a20f.url(options),
    method: 'get',
})

index4bf08c42810ffbe560db295b8342a20f.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
index4bf08c42810ffbe560db295b8342a20f.url = (options?: RouteQueryOptions) => {
    return index4bf08c42810ffbe560db295b8342a20f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
index4bf08c42810ffbe560db295b8342a20f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index4bf08c42810ffbe560db295b8342a20f.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::index
* @see app/Http/Controllers/TeamController.php:27
* @route '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3'
*/
index4bf08c42810ffbe560db295b8342a20f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index4bf08c42810ffbe560db295b8342a20f.url(options),
    method: 'head',
})

export const index = {
    '/api/teams': indexfad30589d2bb00aed9e7f2aac6e0382f,
    '/api/teams/enterprise/k2j5h8g1/list/f4d7s0a3': index4bf08c42810ffbe560db295b8342a20f,
}

/**
* @see \App\Http\Controllers\TeamController::store
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams'
*/
const storefad30589d2bb00aed9e7f2aac6e0382f = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storefad30589d2bb00aed9e7f2aac6e0382f.url(options),
    method: 'post',
})

storefad30589d2bb00aed9e7f2aac6e0382f.definition = {
    methods: ["post"],
    url: '/api/teams',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::store
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams'
*/
storefad30589d2bb00aed9e7f2aac6e0382f.url = (options?: RouteQueryOptions) => {
    return storefad30589d2bb00aed9e7f2aac6e0382f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::store
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams'
*/
storefad30589d2bb00aed9e7f2aac6e0382f.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storefad30589d2bb00aed9e7f2aac6e0382f.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::store
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5'
*/
const store0a4d30f3ec5695d842f4727fbd68be88 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store0a4d30f3ec5695d842f4727fbd68be88.url(options),
    method: 'post',
})

store0a4d30f3ec5695d842f4727fbd68be88.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::store
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5'
*/
store0a4d30f3ec5695d842f4727fbd68be88.url = (options?: RouteQueryOptions) => {
    return store0a4d30f3ec5695d842f4727fbd68be88.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::store
* @see app/Http/Controllers/TeamController.php:48
* @route '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5'
*/
store0a4d30f3ec5695d842f4727fbd68be88.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store0a4d30f3ec5695d842f4727fbd68be88.url(options),
    method: 'post',
})

export const store = {
    '/api/teams': storefad30589d2bb00aed9e7f2aac6e0382f,
    '/api/teams/enterprise/k2j5h8g1/create/w6e9r2t5': store0a4d30f3ec5695d842f4727fbd68be88,
}

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/{team}'
*/
const showc5f89d94ac432ff385523f6e0b292476 = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showc5f89d94ac432ff385523f6e0b292476.url(args, options),
    method: 'get',
})

showc5f89d94ac432ff385523f6e0b292476.definition = {
    methods: ["get","head"],
    url: '/api/teams/{team}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/{team}'
*/
showc5f89d94ac432ff385523f6e0b292476.url = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { team: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
    }

    return showc5f89d94ac432ff385523f6e0b292476.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/{team}'
*/
showc5f89d94ac432ff385523f6e0b292476.get = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showc5f89d94ac432ff385523f6e0b292476.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/{team}'
*/
showc5f89d94ac432ff385523f6e0b292476.head = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showc5f89d94ac432ff385523f6e0b292476.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
*/
const showbb08d846bad61eb2ef7b9a628093444e = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showbb08d846bad61eb2ef7b9a628093444e.url(args, options),
    method: 'get',
})

showbb08d846bad61eb2ef7b9a628093444e.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
*/
showbb08d846bad61eb2ef7b9a628093444e.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showbb08d846bad61eb2ef7b9a628093444e.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
*/
showbb08d846bad61eb2ef7b9a628093444e.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showbb08d846bad61eb2ef7b9a628093444e.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::show
* @see app/Http/Controllers/TeamController.php:75
* @route '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7'
*/
showbb08d846bad61eb2ef7b9a628093444e.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showbb08d846bad61eb2ef7b9a628093444e.url(args, options),
    method: 'head',
})

export const show = {
    '/api/teams/{team}': showc5f89d94ac432ff385523f6e0b292476,
    '/api/teams/enterprise/k2j5h8g1/show/{uuid}/y8u1i4o7': showbb08d846bad61eb2ef7b9a628093444e,
}

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}'
*/
const updatec5f89d94ac432ff385523f6e0b292476 = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatec5f89d94ac432ff385523f6e0b292476.url(args, options),
    method: 'put',
})

updatec5f89d94ac432ff385523f6e0b292476.definition = {
    methods: ["put"],
    url: '/api/teams/{team}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}'
*/
updatec5f89d94ac432ff385523f6e0b292476.url = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: args.team,
    }

    return updatec5f89d94ac432ff385523f6e0b292476.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}'
*/
updatec5f89d94ac432ff385523f6e0b292476.put = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatec5f89d94ac432ff385523f6e0b292476.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9'
*/
const update711138fb42d8b2d88ee5a8518fcfd952 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update711138fb42d8b2d88ee5a8518fcfd952.url(args, options),
    method: 'put',
})

update711138fb42d8b2d88ee5a8518fcfd952.definition = {
    methods: ["put"],
    url: '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9'
*/
update711138fb42d8b2d88ee5a8518fcfd952.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update711138fb42d8b2d88ee5a8518fcfd952.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::update
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9'
*/
update711138fb42d8b2d88ee5a8518fcfd952.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update711138fb42d8b2d88ee5a8518fcfd952.url(args, options),
    method: 'put',
})

export const update = {
    '/api/teams/{team}': updatec5f89d94ac432ff385523f6e0b292476,
    '/api/teams/enterprise/k2j5h8g1/update/{uuid}/q0w3e6r9': update711138fb42d8b2d88ee5a8518fcfd952,
}

/**
* @see \App\Http\Controllers\TeamController::destroy
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}'
*/
const destroyc5f89d94ac432ff385523f6e0b292476 = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyc5f89d94ac432ff385523f6e0b292476.url(args, options),
    method: 'delete',
})

destroyc5f89d94ac432ff385523f6e0b292476.definition = {
    methods: ["delete"],
    url: '/api/teams/{team}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeamController::destroy
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}'
*/
destroyc5f89d94ac432ff385523f6e0b292476.url = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: args.team,
    }

    return destroyc5f89d94ac432ff385523f6e0b292476.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::destroy
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}'
*/
destroyc5f89d94ac432ff385523f6e0b292476.delete = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyc5f89d94ac432ff385523f6e0b292476.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TeamController::destroy
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1'
*/
const destroy0e0a8f22cc7f65b177fb9514cca8e996 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy0e0a8f22cc7f65b177fb9514cca8e996.url(args, options),
    method: 'delete',
})

destroy0e0a8f22cc7f65b177fb9514cca8e996.definition = {
    methods: ["delete"],
    url: '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeamController::destroy
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1'
*/
destroy0e0a8f22cc7f65b177fb9514cca8e996.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy0e0a8f22cc7f65b177fb9514cca8e996.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::destroy
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1'
*/
destroy0e0a8f22cc7f65b177fb9514cca8e996.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy0e0a8f22cc7f65b177fb9514cca8e996.url(args, options),
    method: 'delete',
})

export const destroy = {
    '/api/teams/{team}': destroyc5f89d94ac432ff385523f6e0b292476,
    '/api/teams/enterprise/k2j5h8g1/delete/{uuid}/z2x5c8v1': destroy0e0a8f22cc7f65b177fb9514cca8e996,
}

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/members'
*/
const members488604cc9ec6898ad9fe1ea49511a5d1 = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members488604cc9ec6898ad9fe1ea49511a5d1.url(args, options),
    method: 'get',
})

members488604cc9ec6898ad9fe1ea49511a5d1.definition = {
    methods: ["get","head"],
    url: '/api/teams/{team}/members',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/members'
*/
members488604cc9ec6898ad9fe1ea49511a5d1.url = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: args.team,
    }

    return members488604cc9ec6898ad9fe1ea49511a5d1.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/members'
*/
members488604cc9ec6898ad9fe1ea49511a5d1.get = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members488604cc9ec6898ad9fe1ea49511a5d1.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/members'
*/
members488604cc9ec6898ad9fe1ea49511a5d1.head = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: members488604cc9ec6898ad9fe1ea49511a5d1.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
const members04cad7d45bf3bbb9d2952862befc9752 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members04cad7d45bf3bbb9d2952862befc9752.url(args, options),
    method: 'get',
})

members04cad7d45bf3bbb9d2952862befc9752.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
members04cad7d45bf3bbb9d2952862befc9752.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return members04cad7d45bf3bbb9d2952862befc9752.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
members04cad7d45bf3bbb9d2952862befc9752.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members04cad7d45bf3bbb9d2952862befc9752.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::members
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3'
*/
members04cad7d45bf3bbb9d2952862befc9752.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: members04cad7d45bf3bbb9d2952862befc9752.url(args, options),
    method: 'head',
})

export const members = {
    '/api/teams/{team}/members': members488604cc9ec6898ad9fe1ea49511a5d1,
    '/api/teams/enterprise/k2j5h8g1/members/{uuid}/b4n7m0k3': members04cad7d45bf3bbb9d2952862befc9752,
}

/**
* @see \App\Http\Controllers\TeamController::inviteMember
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/{team}/members/invite'
*/
const inviteMember86493ac9fe3e6993db4a617d5748f555 = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inviteMember86493ac9fe3e6993db4a617d5748f555.url(args, options),
    method: 'post',
})

inviteMember86493ac9fe3e6993db4a617d5748f555.definition = {
    methods: ["post"],
    url: '/api/teams/{team}/members/invite',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::inviteMember
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/{team}/members/invite'
*/
inviteMember86493ac9fe3e6993db4a617d5748f555.url = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { team: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: typeof args.team === 'object'
        ? args.team.id
        : args.team,
    }

    return inviteMember86493ac9fe3e6993db4a617d5748f555.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::inviteMember
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/{team}/members/invite'
*/
inviteMember86493ac9fe3e6993db4a617d5748f555.post = (args: { team: number | { id: number } } | [team: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inviteMember86493ac9fe3e6993db4a617d5748f555.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::inviteMember
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5'
*/
const inviteMemberdb6bec298986bf0829f5e7f9f52b6623 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inviteMemberdb6bec298986bf0829f5e7f9f52b6623.url(args, options),
    method: 'post',
})

inviteMemberdb6bec298986bf0829f5e7f9f52b6623.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::inviteMember
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5'
*/
inviteMemberdb6bec298986bf0829f5e7f9f52b6623.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return inviteMemberdb6bec298986bf0829f5e7f9f52b6623.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::inviteMember
* @see app/Http/Controllers/TeamController.php:87
* @route '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5'
*/
inviteMemberdb6bec298986bf0829f5e7f9f52b6623.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inviteMemberdb6bec298986bf0829f5e7f9f52b6623.url(args, options),
    method: 'post',
})

export const inviteMember = {
    '/api/teams/{team}/members/invite': inviteMember86493ac9fe3e6993db4a617d5748f555,
    '/api/teams/enterprise/k2j5h8g1/members/invite/{uuid}/h6g9f2d5': inviteMemberdb6bec298986bf0829f5e7f9f52b6623,
}

/**
* @see \App\Http\Controllers\TeamController::removeMember
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/{team}/members/{member}'
*/
const removeMember28d3d6ea8599c16e42d9df5e7bab58a0 = (args: { team: string | number, member: number | { id: number } } | [team: string | number, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember28d3d6ea8599c16e42d9df5e7bab58a0.url(args, options),
    method: 'delete',
})

removeMember28d3d6ea8599c16e42d9df5e7bab58a0.definition = {
    methods: ["delete"],
    url: '/api/teams/{team}/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeamController::removeMember
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/{team}/members/{member}'
*/
removeMember28d3d6ea8599c16e42d9df5e7bab58a0.url = (args: { team: string | number, member: number | { id: number } } | [team: string | number, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            team: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: args.team,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return removeMember28d3d6ea8599c16e42d9df5e7bab58a0.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::removeMember
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/{team}/members/{member}'
*/
removeMember28d3d6ea8599c16e42d9df5e7bab58a0.delete = (args: { team: string | number, member: number | { id: number } } | [team: string | number, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember28d3d6ea8599c16e42d9df5e7bab58a0.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TeamController::removeMember
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7'
*/
const removeMember702e933eb883a95edd693098b06187c5 = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember702e933eb883a95edd693098b06187c5.url(args, options),
    method: 'delete',
})

removeMember702e933eb883a95edd693098b06187c5.definition = {
    methods: ["delete"],
    url: '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeamController::removeMember
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7'
*/
removeMember702e933eb883a95edd693098b06187c5.url = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions) => {
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

    return removeMember702e933eb883a95edd693098b06187c5.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{memberUuid}', parsedArgs.memberUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::removeMember
* @see app/Http/Controllers/TeamController.php:152
* @route '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7'
*/
removeMember702e933eb883a95edd693098b06187c5.delete = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember702e933eb883a95edd693098b06187c5.url(args, options),
    method: 'delete',
})

export const removeMember = {
    '/api/teams/{team}/members/{member}': removeMember28d3d6ea8599c16e42d9df5e7bab58a0,
    '/api/teams/enterprise/k2j5h8g1/members/remove/{uuid}/{memberUuid}/j8k1l4z7': removeMember702e933eb883a95edd693098b06187c5,
}

/**
* @see \App\Http\Controllers\TeamController::updateMemberRole
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/{team}/members/{member}/role'
*/
const updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463 = (args: { team: string | number, member: number | { id: number } } | [team: string | number, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463.url(args, options),
    method: 'put',
})

updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463.definition = {
    methods: ["put"],
    url: '/api/teams/{team}/members/{member}/role',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TeamController::updateMemberRole
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/{team}/members/{member}/role'
*/
updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463.url = (args: { team: string | number, member: number | { id: number } } | [team: string | number, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            team: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: args.team,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::updateMemberRole
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/{team}/members/{member}/role'
*/
updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463.put = (args: { team: string | number, member: number | { id: number } } | [team: string | number, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\TeamController::updateMemberRole
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9'
*/
const updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40 = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40.url(args, options),
    method: 'put',
})

updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40.definition = {
    methods: ["put"],
    url: '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TeamController::updateMemberRole
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9'
*/
updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40.url = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions) => {
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

    return updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{memberUuid}', parsedArgs.memberUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::updateMemberRole
* @see app/Http/Controllers/TeamController.php:133
* @route '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9'
*/
updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40.put = (args: { uuid: string | number, memberUuid: string | number } | [uuid: string | number, memberUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40.url(args, options),
    method: 'put',
})

export const updateMemberRole = {
    '/api/teams/{team}/members/{member}/role': updateMemberRole6773bb5bb5f2e9d1e79c32b7faf87463,
    '/api/teams/enterprise/k2j5h8g1/members/role/{uuid}/{memberUuid}/s0a3d6f9': updateMemberRoled9fad05dc078c7a47fa35d6ad7218b40,
}

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/invitations'
*/
const invitations87cfd8fa4763a2505d1c7f58814301e6 = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invitations87cfd8fa4763a2505d1c7f58814301e6.url(args, options),
    method: 'get',
})

invitations87cfd8fa4763a2505d1c7f58814301e6.definition = {
    methods: ["get","head"],
    url: '/api/teams/{team}/invitations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/invitations'
*/
invitations87cfd8fa4763a2505d1c7f58814301e6.url = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: args.team,
    }

    return invitations87cfd8fa4763a2505d1c7f58814301e6.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/invitations'
*/
invitations87cfd8fa4763a2505d1c7f58814301e6.get = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invitations87cfd8fa4763a2505d1c7f58814301e6.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/invitations'
*/
invitations87cfd8fa4763a2505d1c7f58814301e6.head = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: invitations87cfd8fa4763a2505d1c7f58814301e6.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
const invitationsc772614e745f70339d13d81b1cce4bea = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invitationsc772614e745f70339d13d81b1cce4bea.url(args, options),
    method: 'get',
})

invitationsc772614e745f70339d13d81b1cce4bea.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
invitationsc772614e745f70339d13d81b1cce4bea.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return invitationsc772614e745f70339d13d81b1cce4bea.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
invitationsc772614e745f70339d13d81b1cce4bea.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invitationsc772614e745f70339d13d81b1cce4bea.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::invitations
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1'
*/
invitationsc772614e745f70339d13d81b1cce4bea.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: invitationsc772614e745f70339d13d81b1cce4bea.url(args, options),
    method: 'head',
})

export const invitations = {
    '/api/teams/{team}/invitations': invitations87cfd8fa4763a2505d1c7f58814301e6,
    '/api/teams/enterprise/k2j5h8g1/invitations/{uuid}/p2o5i8u1': invitationsc772614e745f70339d13d81b1cce4bea,
}

/**
* @see \App\Http\Controllers\TeamController::acceptInvitation
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/invitations/{invitation}/accept'
*/
const acceptInvitation70a9f3c3ccf47a13e114887c3a925aec = (args: { invitation: string | number } | [invitation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptInvitation70a9f3c3ccf47a13e114887c3a925aec.url(args, options),
    method: 'post',
})

acceptInvitation70a9f3c3ccf47a13e114887c3a925aec.definition = {
    methods: ["post"],
    url: '/api/teams/invitations/{invitation}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::acceptInvitation
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/invitations/{invitation}/accept'
*/
acceptInvitation70a9f3c3ccf47a13e114887c3a925aec.url = (args: { invitation: string | number } | [invitation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invitation: args }
    }

    if (Array.isArray(args)) {
        args = {
            invitation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        invitation: args.invitation,
    }

    return acceptInvitation70a9f3c3ccf47a13e114887c3a925aec.definition.url
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::acceptInvitation
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/invitations/{invitation}/accept'
*/
acceptInvitation70a9f3c3ccf47a13e114887c3a925aec.post = (args: { invitation: string | number } | [invitation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptInvitation70a9f3c3ccf47a13e114887c3a925aec.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::acceptInvitation
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3'
*/
const acceptInvitationa2b3668411fe1fda256ec10f5799cd63 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptInvitationa2b3668411fe1fda256ec10f5799cd63.url(args, options),
    method: 'post',
})

acceptInvitationa2b3668411fe1fda256ec10f5799cd63.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::acceptInvitation
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3'
*/
acceptInvitationa2b3668411fe1fda256ec10f5799cd63.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return acceptInvitationa2b3668411fe1fda256ec10f5799cd63.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::acceptInvitation
* @see app/Http/Controllers/TeamController.php:167
* @route '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3'
*/
acceptInvitationa2b3668411fe1fda256ec10f5799cd63.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptInvitationa2b3668411fe1fda256ec10f5799cd63.url(args, options),
    method: 'post',
})

export const acceptInvitation = {
    '/api/teams/invitations/{invitation}/accept': acceptInvitation70a9f3c3ccf47a13e114887c3a925aec,
    '/api/teams/enterprise/k2j5h8g1/invitations/accept/{uuid}/c4v7b0n3': acceptInvitationa2b3668411fe1fda256ec10f5799cd63,
}

/**
* @see \App\Http\Controllers\TeamController::declineInvitation
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/invitations/{invitation}/decline'
*/
const declineInvitation8ea4116e07f8eeb42b9c14764c0ac233 = (args: { invitation: string | number } | [invitation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: declineInvitation8ea4116e07f8eeb42b9c14764c0ac233.url(args, options),
    method: 'post',
})

declineInvitation8ea4116e07f8eeb42b9c14764c0ac233.definition = {
    methods: ["post"],
    url: '/api/teams/invitations/{invitation}/decline',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::declineInvitation
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/invitations/{invitation}/decline'
*/
declineInvitation8ea4116e07f8eeb42b9c14764c0ac233.url = (args: { invitation: string | number } | [invitation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invitation: args }
    }

    if (Array.isArray(args)) {
        args = {
            invitation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        invitation: args.invitation,
    }

    return declineInvitation8ea4116e07f8eeb42b9c14764c0ac233.definition.url
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::declineInvitation
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/invitations/{invitation}/decline'
*/
declineInvitation8ea4116e07f8eeb42b9c14764c0ac233.post = (args: { invitation: string | number } | [invitation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: declineInvitation8ea4116e07f8eeb42b9c14764c0ac233.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TeamController::declineInvitation
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5'
*/
const declineInvitation68b20cc2441d127efbdef3f8c05cae46 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: declineInvitation68b20cc2441d127efbdef3f8c05cae46.url(args, options),
    method: 'post',
})

declineInvitation68b20cc2441d127efbdef3f8c05cae46.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeamController::declineInvitation
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5'
*/
declineInvitation68b20cc2441d127efbdef3f8c05cae46.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return declineInvitation68b20cc2441d127efbdef3f8c05cae46.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::declineInvitation
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5'
*/
declineInvitation68b20cc2441d127efbdef3f8c05cae46.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: declineInvitation68b20cc2441d127efbdef3f8c05cae46.url(args, options),
    method: 'post',
})

export const declineInvitation = {
    '/api/teams/invitations/{invitation}/decline': declineInvitation8ea4116e07f8eeb42b9c14764c0ac233,
    '/api/teams/enterprise/k2j5h8g1/invitations/decline/{uuid}/x6z9a2s5': declineInvitation68b20cc2441d127efbdef3f8c05cae46,
}

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/activity'
*/
const activityLoge0d6429e4dd4bc68806c06a8712657d9 = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activityLoge0d6429e4dd4bc68806c06a8712657d9.url(args, options),
    method: 'get',
})

activityLoge0d6429e4dd4bc68806c06a8712657d9.definition = {
    methods: ["get","head"],
    url: '/api/teams/{team}/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/activity'
*/
activityLoge0d6429e4dd4bc68806c06a8712657d9.url = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

    if (Array.isArray(args)) {
        args = {
            team: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        team: args.team,
    }

    return activityLoge0d6429e4dd4bc68806c06a8712657d9.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/activity'
*/
activityLoge0d6429e4dd4bc68806c06a8712657d9.get = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activityLoge0d6429e4dd4bc68806c06a8712657d9.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/{team}/activity'
*/
activityLoge0d6429e4dd4bc68806c06a8712657d9.head = (args: { team: string | number } | [team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activityLoge0d6429e4dd4bc68806c06a8712657d9.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
const activityLog2baf4b65e60f292f1abdadce18eeebbb = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activityLog2baf4b65e60f292f1abdadce18eeebbb.url(args, options),
    method: 'get',
})

activityLog2baf4b65e60f292f1abdadce18eeebbb.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
activityLog2baf4b65e60f292f1abdadce18eeebbb.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return activityLog2baf4b65e60f292f1abdadce18eeebbb.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
activityLog2baf4b65e60f292f1abdadce18eeebbb.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activityLog2baf4b65e60f292f1abdadce18eeebbb.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TeamController::activityLog
* @see app/Http/Controllers/TeamController.php:0
* @route '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7'
*/
activityLog2baf4b65e60f292f1abdadce18eeebbb.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activityLog2baf4b65e60f292f1abdadce18eeebbb.url(args, options),
    method: 'head',
})

export const activityLog = {
    '/api/teams/{team}/activity': activityLoge0d6429e4dd4bc68806c06a8712657d9,
    '/api/teams/enterprise/k2j5h8g1/activity/{uuid}/m8k1j4h7': activityLog2baf4b65e60f292f1abdadce18eeebbb,
}

const TeamController = { index, store, show, update, destroy, members, inviteMember, removeMember, updateMemberRole, invitations, acceptInvitation, declineInvitation, activityLog }

export default TeamController