import widget from './widget'
import conversations from './conversations'
import shares from './shares'

const api = {
    widget: Object.assign(widget, widget),
    conversations: Object.assign(conversations, conversations),
    shares: Object.assign(shares, shares),
}

export default api