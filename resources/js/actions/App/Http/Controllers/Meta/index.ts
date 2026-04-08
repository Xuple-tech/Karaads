import MetaAccountController from './MetaAccountController'
import MetaPreferenceController from './MetaPreferenceController'
import MetaMessageController from './MetaMessageController'
import MetaWebhookController from './MetaWebhookController'
const Meta = {
    MetaAccountController: Object.assign(MetaAccountController, MetaAccountController),
MetaPreferenceController: Object.assign(MetaPreferenceController, MetaPreferenceController),
MetaMessageController: Object.assign(MetaMessageController, MetaMessageController),
MetaWebhookController: Object.assign(MetaWebhookController, MetaWebhookController),
}

export default Meta