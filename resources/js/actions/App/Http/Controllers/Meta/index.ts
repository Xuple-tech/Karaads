import MetaAccountController from './MetaAccountController'
import MetaPreferenceController from './MetaPreferenceController'
import MetaMessageController from './MetaMessageController'
import MetaReplyTemplateController from './MetaReplyTemplateController'
import MetaBroadcastController from './MetaBroadcastController'
import MetaWebhookController from './MetaWebhookController'
const Meta = {
    MetaAccountController: Object.assign(MetaAccountController, MetaAccountController),
MetaPreferenceController: Object.assign(MetaPreferenceController, MetaPreferenceController),
MetaMessageController: Object.assign(MetaMessageController, MetaMessageController),
MetaReplyTemplateController: Object.assign(MetaReplyTemplateController, MetaReplyTemplateController),
MetaBroadcastController: Object.assign(MetaBroadcastController, MetaBroadcastController),
MetaWebhookController: Object.assign(MetaWebhookController, MetaWebhookController),
}

export default Meta