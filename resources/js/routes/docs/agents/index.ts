import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
 * @see routes/docs.php:26
 * @route '/docs/agents'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/docs/agents',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:26
 * @route '/docs/agents'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:26
 * @route '/docs/agents'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:26
 * @route '/docs/agents'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:27
 * @route '/docs/agents/widget'
 */
export const widget = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: widget.url(options),
    method: 'get',
})

widget.definition = {
    methods: ["get","head"],
    url: '/docs/agents/widget',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:27
 * @route '/docs/agents/widget'
 */
widget.url = (options?: RouteQueryOptions) => {
    return widget.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:27
 * @route '/docs/agents/widget'
 */
widget.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: widget.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:27
 * @route '/docs/agents/widget'
 */
widget.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: widget.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:28
 * @route '/docs/agents/configuration'
 */
export const configuration = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: configuration.url(options),
    method: 'get',
})

configuration.definition = {
    methods: ["get","head"],
    url: '/docs/agents/configuration',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:28
 * @route '/docs/agents/configuration'
 */
configuration.url = (options?: RouteQueryOptions) => {
    return configuration.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:28
 * @route '/docs/agents/configuration'
 */
configuration.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: configuration.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:28
 * @route '/docs/agents/configuration'
 */
configuration.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: configuration.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:29
 * @route '/docs/agents/templates'
 */
export const templates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})

templates.definition = {
    methods: ["get","head"],
    url: '/docs/agents/templates',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:29
 * @route '/docs/agents/templates'
 */
templates.url = (options?: RouteQueryOptions) => {
    return templates.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:29
 * @route '/docs/agents/templates'
 */
templates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:29
 * @route '/docs/agents/templates'
 */
templates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: templates.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:30
 * @route '/docs/agents/knowledge-base'
 */
export const knowledgeBase = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: knowledgeBase.url(options),
    method: 'get',
})

knowledgeBase.definition = {
    methods: ["get","head"],
    url: '/docs/agents/knowledge-base',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:30
 * @route '/docs/agents/knowledge-base'
 */
knowledgeBase.url = (options?: RouteQueryOptions) => {
    return knowledgeBase.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:30
 * @route '/docs/agents/knowledge-base'
 */
knowledgeBase.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: knowledgeBase.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:30
 * @route '/docs/agents/knowledge-base'
 */
knowledgeBase.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: knowledgeBase.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:31
 * @route '/docs/agents/tools'
 */
export const tools = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})

tools.definition = {
    methods: ["get","head"],
    url: '/docs/agents/tools',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:31
 * @route '/docs/agents/tools'
 */
tools.url = (options?: RouteQueryOptions) => {
    return tools.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:31
 * @route '/docs/agents/tools'
 */
tools.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:31
 * @route '/docs/agents/tools'
 */
tools.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tools.url(options),
    method: 'head',
})
const agents = {
    index: Object.assign(index, index),
widget: Object.assign(widget, widget),
configuration: Object.assign(configuration, configuration),
templates: Object.assign(templates, templates),
knowledgeBase: Object.assign(knowledgeBase, knowledgeBase),
tools: Object.assign(tools, tools),
}

export default agents