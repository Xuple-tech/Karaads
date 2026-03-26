import MetaAccountController from './MetaAccountController'
import MetaMessageController from './MetaMessageController'
import MetaPreferenceController from './MetaPreferenceController'
import MetaWebhookController from './MetaWebhookController'
const Meta = {
    MetaAccountController: Object.assign(MetaAccountController, MetaAccountController),
MetaMessageController: Object.assign(MetaMessageController, MetaMessageController),
MetaPreferenceController: Object.assign(MetaPreferenceController, MetaPreferenceController),
MetaWebhookController: Object.assign(MetaWebhookController, MetaWebhookController),
}

export default Meta