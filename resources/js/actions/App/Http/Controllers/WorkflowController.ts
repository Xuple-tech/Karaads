import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/{team}/workflows'
 */
const index408cc9ce4ef6d6de4e65d0ce099db14a = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index408cc9ce4ef6d6de4e65d0ce099db14a.url(args, options),
    method: 'get',
})

index408cc9ce4ef6d6de4e65d0ce099db14a.definition = {
    methods: ["get","head"],
    url: '/api/teams/{team}/workflows',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/{team}/workflows'
 */
index408cc9ce4ef6d6de4e65d0ce099db14a.url = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return index408cc9ce4ef6d6de4e65d0ce099db14a.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/{team}/workflows'
 */
index408cc9ce4ef6d6de4e65d0ce099db14a.get = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index408cc9ce4ef6d6de4e65d0ce099db14a.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/{team}/workflows'
 */
index408cc9ce4ef6d6de4e65d0ce099db14a.head = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index408cc9ce4ef6d6de4e65d0ce099db14a.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
 */
const index3982e3b5a93ef5a24c75689d8ad25e33 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index3982e3b5a93ef5a24c75689d8ad25e33.url(args, options),
    method: 'get',
})

index3982e3b5a93ef5a24c75689d8ad25e33.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
 */
index3982e3b5a93ef5a24c75689d8ad25e33.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index3982e3b5a93ef5a24c75689d8ad25e33.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
 */
index3982e3b5a93ef5a24c75689d8ad25e33.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index3982e3b5a93ef5a24c75689d8ad25e33.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::index
 * @see app/Http/Controllers/WorkflowController.php:27
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9'
 */
index3982e3b5a93ef5a24c75689d8ad25e33.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index3982e3b5a93ef5a24c75689d8ad25e33.url(args, options),
    method: 'head',
})

export const index = {
    '/api/teams/{team}/workflows': index408cc9ce4ef6d6de4e65d0ce099db14a,
    '/api/teams/enterprise/k2j5h8g1/workflows/{uuid}/g0f3d6s9': index3982e3b5a93ef5a24c75689d8ad25e33,
}

/**
* @see \App\Http\Controllers\WorkflowController::store
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/{team}/workflows'
 */
const store408cc9ce4ef6d6de4e65d0ce099db14a = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store408cc9ce4ef6d6de4e65d0ce099db14a.url(args, options),
    method: 'post',
})

store408cc9ce4ef6d6de4e65d0ce099db14a.definition = {
    methods: ["post"],
    url: '/api/teams/{team}/workflows',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::store
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/{team}/workflows'
 */
store408cc9ce4ef6d6de4e65d0ce099db14a.url = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return store408cc9ce4ef6d6de4e65d0ce099db14a.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::store
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/{team}/workflows'
 */
store408cc9ce4ef6d6de4e65d0ce099db14a.post = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store408cc9ce4ef6d6de4e65d0ce099db14a.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkflowController::store
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1'
 */
const store58acf3f5bdeef3b737260509600061d0 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store58acf3f5bdeef3b737260509600061d0.url(args, options),
    method: 'post',
})

store58acf3f5bdeef3b737260509600061d0.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::store
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1'
 */
store58acf3f5bdeef3b737260509600061d0.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store58acf3f5bdeef3b737260509600061d0.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::store
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1'
 */
store58acf3f5bdeef3b737260509600061d0.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store58acf3f5bdeef3b737260509600061d0.url(args, options),
    method: 'post',
})

export const store = {
    '/api/teams/{team}/workflows': store408cc9ce4ef6d6de4e65d0ce099db14a,
    '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1': store58acf3f5bdeef3b737260509600061d0,
}

/**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/{team}/executions'
 */
const getTeamExecutionsa8186e7304330f6fd39f89587a60eb13 = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.url(args, options),
    method: 'get',
})

getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.definition = {
    methods: ["get","head"],
    url: '/api/teams/{team}/executions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/{team}/executions'
 */
getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.url = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.definition.url
            .replace('{team}', parsedArgs.team.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/{team}/executions'
 */
getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.get = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/{team}/executions'
 */
getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.head = (args: { team: string | number | { id: string | number } } | [team: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTeamExecutionsa8186e7304330f6fd39f89587a60eb13.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
 */
const getTeamExecutionsf7e3098c8a565c98486c351a548733be = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTeamExecutionsf7e3098c8a565c98486c351a548733be.url(args, options),
    method: 'get',
})

getTeamExecutionsf7e3098c8a565c98486c351a548733be.definition = {
    methods: ["get","head"],
    url: '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
 */
getTeamExecutionsf7e3098c8a565c98486c351a548733be.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getTeamExecutionsf7e3098c8a565c98486c351a548733be.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
 */
getTeamExecutionsf7e3098c8a565c98486c351a548733be.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTeamExecutionsf7e3098c8a565c98486c351a548733be.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::getTeamExecutions
 * @see app/Http/Controllers/WorkflowController.php:291
 * @route '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3'
 */
getTeamExecutionsf7e3098c8a565c98486c351a548733be.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTeamExecutionsf7e3098c8a565c98486c351a548733be.url(args, options),
    method: 'head',
})

export const getTeamExecutions = {
    '/api/teams/{team}/executions': getTeamExecutionsa8186e7304330f6fd39f89587a60eb13,
    '/api/teams/enterprise/k2j5h8g1/executions/{uuid}/t4y7u0i3': getTeamExecutionsf7e3098c8a565c98486c351a548733be,
}

/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/{workflow}'
 */
const show7df4eb07c58d220c3a8b994a750ee701 = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show7df4eb07c58d220c3a8b994a750ee701.url(args, options),
    method: 'get',
})

show7df4eb07c58d220c3a8b994a750ee701.definition = {
    methods: ["get","head"],
    url: '/api/workflows/{workflow}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/{workflow}'
 */
show7df4eb07c58d220c3a8b994a750ee701.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return show7df4eb07c58d220c3a8b994a750ee701.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/{workflow}'
 */
show7df4eb07c58d220c3a8b994a750ee701.get = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show7df4eb07c58d220c3a8b994a750ee701.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/{workflow}'
 */
show7df4eb07c58d220c3a8b994a750ee701.head = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show7df4eb07c58d220c3a8b994a750ee701.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
const showcc208615a855283770c22146479b2721 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showcc208615a855283770c22146479b2721.url(args, options),
    method: 'get',
})

showcc208615a855283770c22146479b2721.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
showcc208615a855283770c22146479b2721.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showcc208615a855283770c22146479b2721.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
showcc208615a855283770c22146479b2721.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showcc208615a855283770c22146479b2721.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
showcc208615a855283770c22146479b2721.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showcc208615a855283770c22146479b2721.url(args, options),
    method: 'head',
})

export const show = {
    '/api/workflows/{workflow}': show7df4eb07c58d220c3a8b994a750ee701,
    '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7': showcc208615a855283770c22146479b2721,
}

/**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/{workflow}'
 */
const update7df4eb07c58d220c3a8b994a750ee701 = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update7df4eb07c58d220c3a8b994a750ee701.url(args, options),
    method: 'put',
})

update7df4eb07c58d220c3a8b994a750ee701.definition = {
    methods: ["put"],
    url: '/api/workflows/{workflow}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/{workflow}'
 */
update7df4eb07c58d220c3a8b994a750ee701.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return update7df4eb07c58d220c3a8b994a750ee701.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/{workflow}'
 */
update7df4eb07c58d220c3a8b994a750ee701.put = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update7df4eb07c58d220c3a8b994a750ee701.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9'
 */
const update85a67726e09700a4673712b707a7f63c = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update85a67726e09700a4673712b707a7f63c.url(args, options),
    method: 'put',
})

update85a67726e09700a4673712b707a7f63c.definition = {
    methods: ["put"],
    url: '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9'
 */
update85a67726e09700a4673712b707a7f63c.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update85a67726e09700a4673712b707a7f63c.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9'
 */
update85a67726e09700a4673712b707a7f63c.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update85a67726e09700a4673712b707a7f63c.url(args, options),
    method: 'put',
})

export const update = {
    '/api/workflows/{workflow}': update7df4eb07c58d220c3a8b994a750ee701,
    '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9': update85a67726e09700a4673712b707a7f63c,
}

/**
* @see \App\Http\Controllers\WorkflowController::destroy
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/{workflow}'
 */
const destroy7df4eb07c58d220c3a8b994a750ee701 = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy7df4eb07c58d220c3a8b994a750ee701.url(args, options),
    method: 'delete',
})

destroy7df4eb07c58d220c3a8b994a750ee701.definition = {
    methods: ["delete"],
    url: '/api/workflows/{workflow}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkflowController::destroy
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/{workflow}'
 */
destroy7df4eb07c58d220c3a8b994a750ee701.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return destroy7df4eb07c58d220c3a8b994a750ee701.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::destroy
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/{workflow}'
 */
destroy7df4eb07c58d220c3a8b994a750ee701.delete = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy7df4eb07c58d220c3a8b994a750ee701.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WorkflowController::destroy
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1'
 */
const destroybf062eac9604c74abdba8cc9ea539122 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroybf062eac9604c74abdba8cc9ea539122.url(args, options),
    method: 'delete',
})

destroybf062eac9604c74abdba8cc9ea539122.definition = {
    methods: ["delete"],
    url: '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkflowController::destroy
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1'
 */
destroybf062eac9604c74abdba8cc9ea539122.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroybf062eac9604c74abdba8cc9ea539122.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::destroy
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1'
 */
destroybf062eac9604c74abdba8cc9ea539122.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroybf062eac9604c74abdba8cc9ea539122.url(args, options),
    method: 'delete',
})

export const destroy = {
    '/api/workflows/{workflow}': destroy7df4eb07c58d220c3a8b994a750ee701,
    '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1': destroybf062eac9604c74abdba8cc9ea539122,
}

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/{workflow}/execute'
 */
const execute1ce5617b066cff3c89e6157f01063b77 = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute1ce5617b066cff3c89e6157f01063b77.url(args, options),
    method: 'post',
})

execute1ce5617b066cff3c89e6157f01063b77.definition = {
    methods: ["post"],
    url: '/api/workflows/{workflow}/execute',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/{workflow}/execute'
 */
execute1ce5617b066cff3c89e6157f01063b77.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return execute1ce5617b066cff3c89e6157f01063b77.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/{workflow}/execute'
 */
execute1ce5617b066cff3c89e6157f01063b77.post = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute1ce5617b066cff3c89e6157f01063b77.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3'
 */
const execute38e6612b26cd846abbd2679d18c6d5a2 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute38e6612b26cd846abbd2679d18c6d5a2.url(args, options),
    method: 'post',
})

execute38e6612b26cd846abbd2679d18c6d5a2.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3'
 */
execute38e6612b26cd846abbd2679d18c6d5a2.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return execute38e6612b26cd846abbd2679d18c6d5a2.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3'
 */
execute38e6612b26cd846abbd2679d18c6d5a2.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute38e6612b26cd846abbd2679d18c6d5a2.url(args, options),
    method: 'post',
})

export const execute = {
    '/api/workflows/{workflow}/execute': execute1ce5617b066cff3c89e6157f01063b77,
    '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3': execute38e6612b26cd846abbd2679d18c6d5a2,
}

/**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/{workflow}/executions'
 */
const executionHistory60c19d6ec5c257eaef194f424931d7cd = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionHistory60c19d6ec5c257eaef194f424931d7cd.url(args, options),
    method: 'get',
})

executionHistory60c19d6ec5c257eaef194f424931d7cd.definition = {
    methods: ["get","head"],
    url: '/api/workflows/{workflow}/executions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/{workflow}/executions'
 */
executionHistory60c19d6ec5c257eaef194f424931d7cd.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return executionHistory60c19d6ec5c257eaef194f424931d7cd.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/{workflow}/executions'
 */
executionHistory60c19d6ec5c257eaef194f424931d7cd.get = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionHistory60c19d6ec5c257eaef194f424931d7cd.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/{workflow}/executions'
 */
executionHistory60c19d6ec5c257eaef194f424931d7cd.head = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executionHistory60c19d6ec5c257eaef194f424931d7cd.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
const executionHistory98c9cf81848f11313406c0f239f31d2a = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionHistory98c9cf81848f11313406c0f239f31d2a.url(args, options),
    method: 'get',
})

executionHistory98c9cf81848f11313406c0f239f31d2a.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
executionHistory98c9cf81848f11313406c0f239f31d2a.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return executionHistory98c9cf81848f11313406c0f239f31d2a.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
executionHistory98c9cf81848f11313406c0f239f31d2a.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionHistory98c9cf81848f11313406c0f239f31d2a.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::executionHistory
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
executionHistory98c9cf81848f11313406c0f239f31d2a.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executionHistory98c9cf81848f11313406c0f239f31d2a.url(args, options),
    method: 'head',
})

export const executionHistory = {
    '/api/workflows/{workflow}/executions': executionHistory60c19d6ec5c257eaef194f424931d7cd,
    '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5': executionHistory98c9cf81848f11313406c0f239f31d2a,
}

/**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/{workflow}/executions/{execution}'
 */
const getExecutionfd45aab98c5f5ea3c493435ec5b067d5 = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getExecutionfd45aab98c5f5ea3c493435ec5b067d5.url(args, options),
    method: 'get',
})

getExecutionfd45aab98c5f5ea3c493435ec5b067d5.definition = {
    methods: ["get","head"],
    url: '/api/workflows/{workflow}/executions/{execution}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/{workflow}/executions/{execution}'
 */
getExecutionfd45aab98c5f5ea3c493435ec5b067d5.url = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                    execution: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                                execution: typeof args.execution === 'object'
                ? args.execution.id
                : args.execution,
                }

    return getExecutionfd45aab98c5f5ea3c493435ec5b067d5.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace('{execution}', parsedArgs.execution.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/{workflow}/executions/{execution}'
 */
getExecutionfd45aab98c5f5ea3c493435ec5b067d5.get = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getExecutionfd45aab98c5f5ea3c493435ec5b067d5.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/{workflow}/executions/{execution}'
 */
getExecutionfd45aab98c5f5ea3c493435ec5b067d5.head = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getExecutionfd45aab98c5f5ea3c493435ec5b067d5.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
const getExecution275e1117aa1afcd4bfa92821224bd845 = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getExecution275e1117aa1afcd4bfa92821224bd845.url(args, options),
    method: 'get',
})

getExecution275e1117aa1afcd4bfa92821224bd845.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
getExecution275e1117aa1afcd4bfa92821224bd845.url = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    uuid: args[0],
                    execUuid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        uuid: args.uuid,
                                execUuid: args.execUuid,
                }

    return getExecution275e1117aa1afcd4bfa92821224bd845.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{execUuid}', parsedArgs.execUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
getExecution275e1117aa1afcd4bfa92821224bd845.get = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getExecution275e1117aa1afcd4bfa92821224bd845.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::getExecution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
getExecution275e1117aa1afcd4bfa92821224bd845.head = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getExecution275e1117aa1afcd4bfa92821224bd845.url(args, options),
    method: 'head',
})

export const getExecution = {
    '/api/workflows/{workflow}/executions/{execution}': getExecutionfd45aab98c5f5ea3c493435ec5b067d5,
    '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7': getExecution275e1117aa1afcd4bfa92821224bd845,
}

/**
* @see \App\Http\Controllers\WorkflowController::cancelExecution
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/{workflow}/executions/{execution}/cancel'
 */
const cancelExecution468c1978631fac11cafd9dadc74f8a19 = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelExecution468c1978631fac11cafd9dadc74f8a19.url(args, options),
    method: 'post',
})

cancelExecution468c1978631fac11cafd9dadc74f8a19.definition = {
    methods: ["post"],
    url: '/api/workflows/{workflow}/executions/{execution}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::cancelExecution
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/{workflow}/executions/{execution}/cancel'
 */
cancelExecution468c1978631fac11cafd9dadc74f8a19.url = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                    execution: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                                execution: typeof args.execution === 'object'
                ? args.execution.id
                : args.execution,
                }

    return cancelExecution468c1978631fac11cafd9dadc74f8a19.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace('{execution}', parsedArgs.execution.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::cancelExecution
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/{workflow}/executions/{execution}/cancel'
 */
cancelExecution468c1978631fac11cafd9dadc74f8a19.post = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelExecution468c1978631fac11cafd9dadc74f8a19.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkflowController::cancelExecution
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9'
 */
const cancelExecution611783ea81617e831933438b61518f46 = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelExecution611783ea81617e831933438b61518f46.url(args, options),
    method: 'post',
})

cancelExecution611783ea81617e831933438b61518f46.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::cancelExecution
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9'
 */
cancelExecution611783ea81617e831933438b61518f46.url = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    uuid: args[0],
                    execUuid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        uuid: args.uuid,
                                execUuid: args.execUuid,
                }

    return cancelExecution611783ea81617e831933438b61518f46.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{execUuid}', parsedArgs.execUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::cancelExecution
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9'
 */
cancelExecution611783ea81617e831933438b61518f46.post = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelExecution611783ea81617e831933438b61518f46.url(args, options),
    method: 'post',
})

export const cancelExecution = {
    '/api/workflows/{workflow}/executions/{execution}/cancel': cancelExecution468c1978631fac11cafd9dadc74f8a19,
    '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9': cancelExecution611783ea81617e831933438b61518f46,
}

/**
* @see \App\Http\Controllers\WorkflowController::deleteExecution
 * @see app/Http/Controllers/WorkflowController.php:350
 * @route '/api/workflows/{workflow}/executions/{execution}'
 */
const deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5 = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5.url(args, options),
    method: 'delete',
})

deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5.definition = {
    methods: ["delete"],
    url: '/api/workflows/{workflow}/executions/{execution}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkflowController::deleteExecution
 * @see app/Http/Controllers/WorkflowController.php:350
 * @route '/api/workflows/{workflow}/executions/{execution}'
 */
deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5.url = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                    execution: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                                execution: typeof args.execution === 'object'
                ? args.execution.id
                : args.execution,
                }

    return deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace('{execution}', parsedArgs.execution.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::deleteExecution
 * @see app/Http/Controllers/WorkflowController.php:350
 * @route '/api/workflows/{workflow}/executions/{execution}'
 */
deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5.delete = (args: { workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } } | [workflow: string | number | { id: string | number }, execution: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WorkflowController::deleteExecution
 * @see app/Http/Controllers/WorkflowController.php:350
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1'
 */
const deleteExecution80a299ab6c44b9de00e27eebe5b78f65 = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteExecution80a299ab6c44b9de00e27eebe5b78f65.url(args, options),
    method: 'delete',
})

deleteExecution80a299ab6c44b9de00e27eebe5b78f65.definition = {
    methods: ["delete"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkflowController::deleteExecution
 * @see app/Http/Controllers/WorkflowController.php:350
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1'
 */
deleteExecution80a299ab6c44b9de00e27eebe5b78f65.url = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    uuid: args[0],
                    execUuid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        uuid: args.uuid,
                                execUuid: args.execUuid,
                }

    return deleteExecution80a299ab6c44b9de00e27eebe5b78f65.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{execUuid}', parsedArgs.execUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::deleteExecution
 * @see app/Http/Controllers/WorkflowController.php:350
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1'
 */
deleteExecution80a299ab6c44b9de00e27eebe5b78f65.delete = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteExecution80a299ab6c44b9de00e27eebe5b78f65.url(args, options),
    method: 'delete',
})

export const deleteExecution = {
    '/api/workflows/{workflow}/executions/{execution}': deleteExecutionfd45aab98c5f5ea3c493435ec5b067d5,
    '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1': deleteExecution80a299ab6c44b9de00e27eebe5b78f65,
}

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/{workflow}/stats'
 */
const stats435ca806ef68d9de825fbb1073857b9e = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats435ca806ef68d9de825fbb1073857b9e.url(args, options),
    method: 'get',
})

stats435ca806ef68d9de825fbb1073857b9e.definition = {
    methods: ["get","head"],
    url: '/api/workflows/{workflow}/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/{workflow}/stats'
 */
stats435ca806ef68d9de825fbb1073857b9e.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return stats435ca806ef68d9de825fbb1073857b9e.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/{workflow}/stats'
 */
stats435ca806ef68d9de825fbb1073857b9e.get = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats435ca806ef68d9de825fbb1073857b9e.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/{workflow}/stats'
 */
stats435ca806ef68d9de825fbb1073857b9e.head = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats435ca806ef68d9de825fbb1073857b9e.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
const statsdac1eb61d78d694d01ae59cb178c7e7d = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statsdac1eb61d78d694d01ae59cb178c7e7d.url(args, options),
    method: 'get',
})

statsdac1eb61d78d694d01ae59cb178c7e7d.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
statsdac1eb61d78d694d01ae59cb178c7e7d.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return statsdac1eb61d78d694d01ae59cb178c7e7d.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
statsdac1eb61d78d694d01ae59cb178c7e7d.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statsdac1eb61d78d694d01ae59cb178c7e7d.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
statsdac1eb61d78d694d01ae59cb178c7e7d.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statsdac1eb61d78d694d01ae59cb178c7e7d.url(args, options),
    method: 'head',
})

export const stats = {
    '/api/workflows/{workflow}/stats': stats435ca806ef68d9de825fbb1073857b9e,
    '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3': statsdac1eb61d78d694d01ae59cb178c7e7d,
}

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/{workflow}/publish'
 */
const publishcc18967c769e6ac3bab7081eca60fc4d = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publishcc18967c769e6ac3bab7081eca60fc4d.url(args, options),
    method: 'post',
})

publishcc18967c769e6ac3bab7081eca60fc4d.definition = {
    methods: ["post"],
    url: '/api/workflows/{workflow}/publish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/{workflow}/publish'
 */
publishcc18967c769e6ac3bab7081eca60fc4d.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return publishcc18967c769e6ac3bab7081eca60fc4d.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/{workflow}/publish'
 */
publishcc18967c769e6ac3bab7081eca60fc4d.post = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publishcc18967c769e6ac3bab7081eca60fc4d.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5'
 */
const publishf5731ebe179f09d2b7f8b55e09542077 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publishf5731ebe179f09d2b7f8b55e09542077.url(args, options),
    method: 'post',
})

publishf5731ebe179f09d2b7f8b55e09542077.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5'
 */
publishf5731ebe179f09d2b7f8b55e09542077.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return publishf5731ebe179f09d2b7f8b55e09542077.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5'
 */
publishf5731ebe179f09d2b7f8b55e09542077.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publishf5731ebe179f09d2b7f8b55e09542077.url(args, options),
    method: 'post',
})

export const publish = {
    '/api/workflows/{workflow}/publish': publishcc18967c769e6ac3bab7081eca60fc4d,
    '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5': publishf5731ebe179f09d2b7f8b55e09542077,
}

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/{workflow}/revert'
 */
const revert8c6e6412b35611b173350cde748fe1aa = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revert8c6e6412b35611b173350cde748fe1aa.url(args, options),
    method: 'post',
})

revert8c6e6412b35611b173350cde748fe1aa.definition = {
    methods: ["post"],
    url: '/api/workflows/{workflow}/revert',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/{workflow}/revert'
 */
revert8c6e6412b35611b173350cde748fe1aa.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return revert8c6e6412b35611b173350cde748fe1aa.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/{workflow}/revert'
 */
revert8c6e6412b35611b173350cde748fe1aa.post = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revert8c6e6412b35611b173350cde748fe1aa.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7'
 */
const revert646ae6d5814f7f1a58795263d9b52c2e = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revert646ae6d5814f7f1a58795263d9b52c2e.url(args, options),
    method: 'post',
})

revert646ae6d5814f7f1a58795263d9b52c2e.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7'
 */
revert646ae6d5814f7f1a58795263d9b52c2e.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return revert646ae6d5814f7f1a58795263d9b52c2e.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7'
 */
revert646ae6d5814f7f1a58795263d9b52c2e.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revert646ae6d5814f7f1a58795263d9b52c2e.url(args, options),
    method: 'post',
})

export const revert = {
    '/api/workflows/{workflow}/revert': revert8c6e6412b35611b173350cde748fe1aa,
    '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7': revert646ae6d5814f7f1a58795263d9b52c2e,
}

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/{workflow}/versions'
 */
const versions22c144ee36920878292fd2089a8f2958 = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions22c144ee36920878292fd2089a8f2958.url(args, options),
    method: 'get',
})

versions22c144ee36920878292fd2089a8f2958.definition = {
    methods: ["get","head"],
    url: '/api/workflows/{workflow}/versions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/{workflow}/versions'
 */
versions22c144ee36920878292fd2089a8f2958.url = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workflow: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workflow: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workflow: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workflow: typeof args.workflow === 'object'
                ? args.workflow.id
                : args.workflow,
                }

    return versions22c144ee36920878292fd2089a8f2958.definition.url
            .replace('{workflow}', parsedArgs.workflow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/{workflow}/versions'
 */
versions22c144ee36920878292fd2089a8f2958.get = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions22c144ee36920878292fd2089a8f2958.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/{workflow}/versions'
 */
versions22c144ee36920878292fd2089a8f2958.head = (args: { workflow: string | number | { id: string | number } } | [workflow: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: versions22c144ee36920878292fd2089a8f2958.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
const versions74e8010a79a4825fe2253bc6264a581b = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions74e8010a79a4825fe2253bc6264a581b.url(args, options),
    method: 'get',
})

versions74e8010a79a4825fe2253bc6264a581b.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
versions74e8010a79a4825fe2253bc6264a581b.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return versions74e8010a79a4825fe2253bc6264a581b.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
versions74e8010a79a4825fe2253bc6264a581b.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions74e8010a79a4825fe2253bc6264a581b.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
versions74e8010a79a4825fe2253bc6264a581b.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: versions74e8010a79a4825fe2253bc6264a581b.url(args, options),
    method: 'head',
})

export const versions = {
    '/api/workflows/{workflow}/versions': versions22c144ee36920878292fd2089a8f2958,
    '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9': versions74e8010a79a4825fe2253bc6264a581b,
}

/**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow-executions/{execution}'
 */
const executionDetailsfe96484e96a05bd61845b48e5759b134 = (args: { execution: string | number | { id: string | number } } | [execution: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionDetailsfe96484e96a05bd61845b48e5759b134.url(args, options),
    method: 'get',
})

executionDetailsfe96484e96a05bd61845b48e5759b134.definition = {
    methods: ["get","head"],
    url: '/api/workflow-executions/{execution}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow-executions/{execution}'
 */
executionDetailsfe96484e96a05bd61845b48e5759b134.url = (args: { execution: string | number | { id: string | number } } | [execution: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { execution: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { execution: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    execution: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        execution: typeof args.execution === 'object'
                ? args.execution.id
                : args.execution,
                }

    return executionDetailsfe96484e96a05bd61845b48e5759b134.definition.url
            .replace('{execution}', parsedArgs.execution.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow-executions/{execution}'
 */
executionDetailsfe96484e96a05bd61845b48e5759b134.get = (args: { execution: string | number | { id: string | number } } | [execution: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionDetailsfe96484e96a05bd61845b48e5759b134.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow-executions/{execution}'
 */
executionDetailsfe96484e96a05bd61845b48e5759b134.head = (args: { execution: string | number | { id: string | number } } | [execution: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executionDetailsfe96484e96a05bd61845b48e5759b134.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
 */
const executionDetailsa6048ee4278e8b5d456cc00682fe13a0 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionDetailsa6048ee4278e8b5d456cc00682fe13a0.url(args, options),
    method: 'get',
})

executionDetailsa6048ee4278e8b5d456cc00682fe13a0.definition = {
    methods: ["get","head"],
    url: '/api/workflow/executions/details/{uuid}/p2o5i8u1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
 */
executionDetailsa6048ee4278e8b5d456cc00682fe13a0.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return executionDetailsa6048ee4278e8b5d456cc00682fe13a0.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
 */
executionDetailsa6048ee4278e8b5d456cc00682fe13a0.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionDetailsa6048ee4278e8b5d456cc00682fe13a0.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::executionDetails
 * @see app/Http/Controllers/WorkflowController.php:178
 * @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
 */
executionDetailsa6048ee4278e8b5d456cc00682fe13a0.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executionDetailsa6048ee4278e8b5d456cc00682fe13a0.url(args, options),
    method: 'head',
})

export const executionDetails = {
    '/api/workflow-executions/{execution}': executionDetailsfe96484e96a05bd61845b48e5759b134,
    '/api/workflow/executions/details/{uuid}/p2o5i8u1': executionDetailsa6048ee4278e8b5d456cc00682fe13a0,
}

/**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available'
 */
const availableTools1eb2cec024548fd4d9e5998f1cc52294 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableTools1eb2cec024548fd4d9e5998f1cc52294.url(options),
    method: 'get',
})

availableTools1eb2cec024548fd4d9e5998f1cc52294.definition = {
    methods: ["get","head"],
    url: '/api/tools/available',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available'
 */
availableTools1eb2cec024548fd4d9e5998f1cc52294.url = (options?: RouteQueryOptions) => {
    return availableTools1eb2cec024548fd4d9e5998f1cc52294.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available'
 */
availableTools1eb2cec024548fd4d9e5998f1cc52294.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableTools1eb2cec024548fd4d9e5998f1cc52294.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available'
 */
availableTools1eb2cec024548fd4d9e5998f1cc52294.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: availableTools1eb2cec024548fd4d9e5998f1cc52294.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
const availableToolse9705be6d4a46e0d2d9b7377a7119d72 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableToolse9705be6d4a46e0d2d9b7377a7119d72.url(options),
    method: 'get',
})

availableToolse9705be6d4a46e0d2d9b7377a7119d72.definition = {
    methods: ["get","head"],
    url: '/api/tools/available/workflow/c4v7b0n3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
availableToolse9705be6d4a46e0d2d9b7377a7119d72.url = (options?: RouteQueryOptions) => {
    return availableToolse9705be6d4a46e0d2d9b7377a7119d72.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
availableToolse9705be6d4a46e0d2d9b7377a7119d72.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableToolse9705be6d4a46e0d2d9b7377a7119d72.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::availableTools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
availableToolse9705be6d4a46e0d2d9b7377a7119d72.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: availableToolse9705be6d4a46e0d2d9b7377a7119d72.url(options),
    method: 'head',
})

export const availableTools = {
    '/api/tools/available': availableTools1eb2cec024548fd4d9e5998f1cc52294,
    '/api/tools/available/workflow/c4v7b0n3': availableToolse9705be6d4a46e0d2d9b7377a7119d72,
}

const WorkflowController = { index, store, getTeamExecutions, show, update, destroy, execute, executionHistory, getExecution, cancelExecution, deleteExecution, stats, publish, revert, versions, executionDetails, availableTools }

export default WorkflowController