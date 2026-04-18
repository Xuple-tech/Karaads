import AuthController from './AuthController'
import SessionAuthController from './SessionAuthController'
import Chat from './Chat'
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
    Chat: Object.assign(Chat, Chat),
    SpaVoiceConversationController: Object.assign(SpaVoiceConversationController, SpaVoiceConversationController),
    VoiceConversationController: Object.assign(VoiceConversationController, VoiceConversationController),
    EmailController: Object.assign(EmailController, EmailController),
    ImageGenerationController: Object.assign(ImageGenerationController, ImageGenerationController),
    SettingsController: Object.assign(SettingsController, SettingsController),
    ChatPreferenceController: Object.assign(ChatPreferenceController, ChatPreferenceController),
    PersonalizationController: Object.assign(PersonalizationController, PersonalizationController),
}

export default Api