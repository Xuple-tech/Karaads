import UserConversationController from './UserConversationController'
import UserSettingsController from './UserSettingsController'
const User = {
    UserConversationController: Object.assign(UserConversationController, UserConversationController),
UserSettingsController: Object.assign(UserSettingsController, UserSettingsController),
}

export default User