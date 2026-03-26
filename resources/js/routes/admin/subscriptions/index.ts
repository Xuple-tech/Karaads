import plans from './plans'
import features from './features'
import tools from './tools'
import agentLimits from './agent-limits'
import toolLimits from './tool-limits'

const subscriptions = {
    plans: Object.assign(plans, plans),
    features: Object.assign(features, features),
    tools: Object.assign(tools, tools),
    agentLimits: Object.assign(agentLimits, agentLimits),
    toolLimits: Object.assign(toolLimits, toolLimits),
}

export default subscriptions