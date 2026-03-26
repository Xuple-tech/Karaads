import Api from './Api'
import Admin from './Admin'
import TeamController from './TeamController'
import WorkflowController from './WorkflowController'
import MCPServerController from './MCPServerController'
import Agent from './Agent'
import ChatController from './ChatController'
import MailController from './MailController'
import WidgetController from './WidgetController'
import User from './User'
import ConversationShareController from './ConversationShareController'
import VoiceConversationController from './VoiceConversationController'
import Meta from './Meta'
import EnhancedProjectController from './EnhancedProjectController'
import ProjectController from './ProjectController'
import ProjectChatController from './ProjectChatController'
import AgentController from './AgentController'
import AgentIntelligenceController from './AgentIntelligenceController'
import ImageController from './ImageController'
import PageController from './PageController'
import Auth from './Auth'
import Demo from './Demo'
import SaasOwner from './SaasOwner'
import Staff from './Staff'
import Settings from './Settings'
import SubscriptionController from './SubscriptionController'
import StripeWebhookController from './StripeWebhookController'
import StripePaymentController from './StripePaymentController'
import Developer from './Developer'
import CurrencyController from './CurrencyController'
import ProjectAgentController from './ProjectAgentController'
import AgentMemoryController from './AgentMemoryController'
import ToolChainController from './ToolChainController'
import AgentScheduleController from './AgentScheduleController'
import AgentToolController from './AgentToolController'
import StudioController from './StudioController'
import PodcastController from './PodcastController'
import Docs from './Docs'
import DeveloperApi from './DeveloperApi'
const Controllers = {
    Api: Object.assign(Api, Api),
Admin: Object.assign(Admin, Admin),
TeamController: Object.assign(TeamController, TeamController),
WorkflowController: Object.assign(WorkflowController, WorkflowController),
MCPServerController: Object.assign(MCPServerController, MCPServerController),
Agent: Object.assign(Agent, Agent),
ChatController: Object.assign(ChatController, ChatController),
MailController: Object.assign(MailController, MailController),
WidgetController: Object.assign(WidgetController, WidgetController),
User: Object.assign(User, User),
ConversationShareController: Object.assign(ConversationShareController, ConversationShareController),
VoiceConversationController: Object.assign(VoiceConversationController, VoiceConversationController),
Meta: Object.assign(Meta, Meta),
EnhancedProjectController: Object.assign(EnhancedProjectController, EnhancedProjectController),
ProjectController: Object.assign(ProjectController, ProjectController),
ProjectChatController: Object.assign(ProjectChatController, ProjectChatController),
AgentController: Object.assign(AgentController, AgentController),
AgentIntelligenceController: Object.assign(AgentIntelligenceController, AgentIntelligenceController),
ImageController: Object.assign(ImageController, ImageController),
PageController: Object.assign(PageController, PageController),
Auth: Object.assign(Auth, Auth),
Demo: Object.assign(Demo, Demo),
SaasOwner: Object.assign(SaasOwner, SaasOwner),
Staff: Object.assign(Staff, Staff),
Settings: Object.assign(Settings, Settings),
SubscriptionController: Object.assign(SubscriptionController, SubscriptionController),
StripeWebhookController: Object.assign(StripeWebhookController, StripeWebhookController),
StripePaymentController: Object.assign(StripePaymentController, StripePaymentController),
Developer: Object.assign(Developer, Developer),
CurrencyController: Object.assign(CurrencyController, CurrencyController),
ProjectAgentController: Object.assign(ProjectAgentController, ProjectAgentController),
AgentMemoryController: Object.assign(AgentMemoryController, AgentMemoryController),
ToolChainController: Object.assign(ToolChainController, ToolChainController),
AgentScheduleController: Object.assign(AgentScheduleController, AgentScheduleController),
AgentToolController: Object.assign(AgentToolController, AgentToolController),
StudioController: Object.assign(StudioController, StudioController),
PodcastController: Object.assign(PodcastController, PodcastController),
Docs: Object.assign(Docs, Docs),
DeveloperApi: Object.assign(DeveloperApi, DeveloperApi),
}

export default Controllers