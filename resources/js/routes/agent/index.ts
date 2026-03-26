import conversations from './conversations'
import messages from './messages'
import intelligence from './intelligence'
import memory from './memory'
import workflows from './workflows'
import schedules from './schedules'
const agent = {
    conversations: Object.assign(conversations, conversations),
messages: Object.assign(messages, messages),
intelligence: Object.assign(intelligence, intelligence),
memory: Object.assign(memory, memory),
workflows: Object.assign(workflows, workflows),
schedules: Object.assign(schedules, schedules),
}

export default agent