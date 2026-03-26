import UserConversationController from './UserConversationController'
import UserSettingsController from './UserSettingsController'
import DashboardController from './DashboardController'
import SiteController from './SiteController'
import AIAgentController from './AIAgentController'
import AgentConversationController from './AgentConversationController'
import AgentMessageController from './AgentMessageController'
import AgentKnowledgeBaseController from './AgentKnowledgeBaseController'
import AgentToolController from './AgentToolController'
import AgentWidgetSettingsController from './AgentWidgetSettingsController'
import AgentApiKeyController from './AgentApiKeyController'
import AgentUsageController from './AgentUsageController'
import SubscriptionController from './SubscriptionController'
import AgentTemplateController from './AgentTemplateController'

const User = {
    UserConversationController: Object.assign(UserConversationController, UserConversationController),
    UserSettingsController: Object.assign(UserSettingsController, UserSettingsController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    SiteController: Object.assign(SiteController, SiteController),
    AIAgentController: Object.assign(AIAgentController, AIAgentController),
    AgentConversationController: Object.assign(AgentConversationController, AgentConversationController),
    AgentMessageController: Object.assign(AgentMessageController, AgentMessageController),
    AgentKnowledgeBaseController: Object.assign(AgentKnowledgeBaseController, AgentKnowledgeBaseController),
    AgentToolController: Object.assign(AgentToolController, AgentToolController),
    AgentWidgetSettingsController: Object.assign(AgentWidgetSettingsController, AgentWidgetSettingsController),
    AgentApiKeyController: Object.assign(AgentApiKeyController, AgentApiKeyController),
    AgentUsageController: Object.assign(AgentUsageController, AgentUsageController),
    SubscriptionController: Object.assign(SubscriptionController, SubscriptionController),
    AgentTemplateController: Object.assign(AgentTemplateController, AgentTemplateController),
}

export default User