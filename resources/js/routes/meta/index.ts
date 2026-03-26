import accounts from './accounts'
import oauth from './oauth'
import conversations from './conversations'
import messages from './messages'
import drafts from './drafts'
import preferences from './preferences'
import webhook from './webhook'

const meta = {
    accounts: Object.assign(accounts, accounts),
    oauth: Object.assign(oauth, oauth),
    conversations: Object.assign(conversations, conversations),
    messages: Object.assign(messages, messages),
    drafts: Object.assign(drafts, drafts),
    preferences: Object.assign(preferences, preferences),
    webhook: Object.assign(webhook, webhook),
}

export default meta