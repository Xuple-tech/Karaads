import AuthController from './AuthController'
import ChatController from './ChatController'
import VoiceConversationController from './VoiceConversationController'
import EmailController from './EmailController'
import ImageGenerationController from './ImageGenerationController'
import SettingsController from './SettingsController'
import ChatPreferenceController from './ChatPreferenceController'
import PersonalizationController from './PersonalizationController'
const Api = {
    AuthController: Object.assign(AuthController, AuthController),
ChatController: Object.assign(ChatController, ChatController),
VoiceConversationController: Object.assign(VoiceConversationController, VoiceConversationController),
EmailController: Object.assign(EmailController, EmailController),
ImageGenerationController: Object.assign(ImageGenerationController, ImageGenerationController),
SettingsController: Object.assign(SettingsController, SettingsController),
ChatPreferenceController: Object.assign(ChatPreferenceController, ChatPreferenceController),
PersonalizationController: Object.assign(PersonalizationController, PersonalizationController),
}

export default Api