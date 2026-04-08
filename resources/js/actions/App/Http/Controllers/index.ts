import Api from './Api'
import Admin from './Admin'
import SpaController from './SpaController'
import MailController from './MailController'
import User from './User'
import ConversationShareController from './ConversationShareController'
import ImageController from './ImageController'
import Meta from './Meta'
import Auth from './Auth'
import SaasOwner from './SaasOwner'
import Staff from './Staff'
import Settings from './Settings'
import SubscriptionController from './SubscriptionController'
import StripeWebhookController from './StripeWebhookController'
import StripePaymentController from './StripePaymentController'
import PaystackWebhookController from './PaystackWebhookController'
import VoiceConversationController from './VoiceConversationController'
import Developer from './Developer'
import CurrencyController from './CurrencyController'
import PodcastController from './PodcastController'
import DeveloperApiDocsController from './DeveloperApiDocsController'
import DeveloperApi from './DeveloperApi'
const Controllers = {
    Api: Object.assign(Api, Api),
Admin: Object.assign(Admin, Admin),
SpaController: Object.assign(SpaController, SpaController),
MailController: Object.assign(MailController, MailController),
User: Object.assign(User, User),
ConversationShareController: Object.assign(ConversationShareController, ConversationShareController),
ImageController: Object.assign(ImageController, ImageController),
Meta: Object.assign(Meta, Meta),
Auth: Object.assign(Auth, Auth),
SaasOwner: Object.assign(SaasOwner, SaasOwner),
Staff: Object.assign(Staff, Staff),
Settings: Object.assign(Settings, Settings),
SubscriptionController: Object.assign(SubscriptionController, SubscriptionController),
StripeWebhookController: Object.assign(StripeWebhookController, StripeWebhookController),
StripePaymentController: Object.assign(StripePaymentController, StripePaymentController),
PaystackWebhookController: Object.assign(PaystackWebhookController, PaystackWebhookController),
VoiceConversationController: Object.assign(VoiceConversationController, VoiceConversationController),
Developer: Object.assign(Developer, Developer),
CurrencyController: Object.assign(CurrencyController, CurrencyController),
PodcastController: Object.assign(PodcastController, PodcastController),
DeveloperApiDocsController: Object.assign(DeveloperApiDocsController, DeveloperApiDocsController),
DeveloperApi: Object.assign(DeveloperApi, DeveloperApi),
}

export default Controllers