import SaasOwnerDashboardController from './SaasOwnerDashboardController'
import SubscriptionManagementController from './SubscriptionManagementController'
import UserManagementController from './UserManagementController'
import UserStatsController from './UserStatsController'
import TeamMemberController from './TeamMemberController'
import CustomPromptController from './CustomPromptController'

const SaasOwner = {
    SaasOwnerDashboardController: Object.assign(SaasOwnerDashboardController, SaasOwnerDashboardController),
    SubscriptionManagementController: Object.assign(SubscriptionManagementController, SubscriptionManagementController),
    UserManagementController: Object.assign(UserManagementController, UserManagementController),
    UserStatsController: Object.assign(UserStatsController, UserStatsController),
    TeamMemberController: Object.assign(TeamMemberController, TeamMemberController),
    CustomPromptController: Object.assign(CustomPromptController, CustomPromptController),
}

export default SaasOwner