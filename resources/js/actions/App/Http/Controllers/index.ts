import Api from './Api'
import Admin from './Admin'
import ChatController from './ChatController'
import MailController from './MailController'
import User from './User'
import ConversationShareController from './ConversationShareController'
import VoiceConversationController from './VoiceConversationController'
import Meta from './Meta'
import ImageController from './ImageController'
import PageController from './PageController'
import Auth from './Auth'
import SaasOwner from './SaasOwner'
import Staff from './Staff'
import Settings from './Settings'
import SubscriptionController from './SubscriptionController'
import StripeWebhookController from './StripeWebhookController'
import StripePaymentController from './StripePaymentController'
import PaystackWebhookController from './PaystackWebhookController'
import CurrencyController from './CurrencyController'
import StudioController from './StudioController'
import PodcastController from './PodcastController'
const Controllers = {
    Api: Object.assign(Api, Api),
Admin: Object.assign(Admin, Admin),
ChatController: Object.assign(ChatController, ChatController),
MailController: Object.assign(MailController, MailController),
User: Object.assign(User, User),
ConversationShareController: Object.assign(ConversationShareController, ConversationShareController),
VoiceConversationController: Object.assign(VoiceConversationController, VoiceConversationController),
Meta: Object.assign(Meta, Meta),
ImageController: Object.assign(ImageController, ImageController),
PageController: Object.assign(PageController, PageController),
Auth: Object.assign(Auth, Auth),
SaasOwner: Object.assign(SaasOwner, SaasOwner),
Staff: Object.assign(Staff, Staff),
Settings: Object.assign(Settings, Settings),
SubscriptionController: Object.assign(SubscriptionController, SubscriptionController),
StripeWebhookController: Object.assign(StripeWebhookController, StripeWebhookController),
StripePaymentController: Object.assign(StripePaymentController, StripePaymentController),
PaystackWebhookController: Object.assign(PaystackWebhookController, PaystackWebhookController),
CurrencyController: Object.assign(CurrencyController, CurrencyController),
StudioController: Object.assign(StudioController, StudioController),
PodcastController: Object.assign(PodcastController, PodcastController),
}

export default Controllers