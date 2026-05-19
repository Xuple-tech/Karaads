import AuthController from './AuthController'
import SessionAuthController from './SessionAuthController'
import PresentationTemplateController from './PresentationTemplateController'
import Chat from './Chat'
import PresentationController from './PresentationController'
import DocumentController from './DocumentController'
import SpaVoiceConversationController from './SpaVoiceConversationController'
import VoiceConversationController from './VoiceConversationController'
import EmailController from './EmailController'
import ImageGenerationController from './ImageGenerationController'
import SettingsController from './SettingsController'
import ChatPreferenceController from './ChatPreferenceController'
import PersonalizationController from './PersonalizationController'

const Api = {
    AuthController: Object.assign(AuthController, AuthController),
    SessionAuthController: Object.assign(SessionAuthController, SessionAuthController),
    PresentationTemplateController: Object.assign(PresentationTemplateController, PresentationTemplateController),
    Chat: Object.assign(Chat, Chat),
    PresentationController: Object.assign(PresentationController, PresentationController),
    DocumentController: Object.assign(DocumentController, DocumentController),
    SpaVoiceConversationController: Object.assign(SpaVoiceConversationController, SpaVoiceConversationController),
    VoiceConversationController: Object.assign(VoiceConversationController, VoiceConversationController),
    EmailController: Object.assign(EmailController, EmailController),
    ImageGenerationController: Object.assign(ImageGenerationController, ImageGenerationController),
    SettingsController: Object.assign(SettingsController, SettingsController),
    ChatPreferenceController: Object.assign(ChatPreferenceController, ChatPreferenceController),
    PersonalizationController: Object.assign(PersonalizationController, PersonalizationController),
}

export default Api