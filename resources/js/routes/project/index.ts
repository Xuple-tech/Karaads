import conversations from './conversations'
import conversation from './conversation'
import message from './message'
import agents from './agents'
import agent from './agent'

const project = {
    conversations: Object.assign(conversations, conversations),
    conversation: Object.assign(conversation, conversation),
    message: Object.assign(message, message),
    agents: Object.assign(agents, agents),
    agent: Object.assign(agent, agent),
}

export default project