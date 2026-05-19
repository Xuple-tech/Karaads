import AIModeController from './AIModeController'
import PersonalizationAdminController from './PersonalizationAdminController'
import SubscriptionPlanController from './SubscriptionPlanController'
import Auth from './Auth'
import DashboardController from './DashboardController'
import UserController from './UserController'
import StaffController from './StaffController'
import SaasOwnerController from './SaasOwnerController'
import AdminDashboardController from './AdminDashboardController'
import GrokApiController from './GrokApiController'
import PromptController from './PromptController'
import PresentationTemplateAdminController from './PresentationTemplateAdminController'
import PersonalizationController from './PersonalizationController'
import DeveloperApiController from './DeveloperApiController'
import SubscriptionPlanFeaturesController from './SubscriptionPlanFeaturesController'

const Admin = {
    AIModeController: Object.assign(AIModeController, AIModeController),
    PersonalizationAdminController: Object.assign(PersonalizationAdminController, PersonalizationAdminController),
    SubscriptionPlanController: Object.assign(SubscriptionPlanController, SubscriptionPlanController),
    Auth: Object.assign(Auth, Auth),
    DashboardController: Object.assign(DashboardController, DashboardController),
    UserController: Object.assign(UserController, UserController),
    StaffController: Object.assign(StaffController, StaffController),
    SaasOwnerController: Object.assign(SaasOwnerController, SaasOwnerController),
    AdminDashboardController: Object.assign(AdminDashboardController, AdminDashboardController),
    GrokApiController: Object.assign(GrokApiController, GrokApiController),
    PromptController: Object.assign(PromptController, PromptController),
    PresentationTemplateAdminController: Object.assign(PresentationTemplateAdminController, PresentationTemplateAdminController),
    PersonalizationController: Object.assign(PersonalizationController, PersonalizationController),
    DeveloperApiController: Object.assign(DeveloperApiController, DeveloperApiController),
    SubscriptionPlanFeaturesController: Object.assign(SubscriptionPlanFeaturesController, SubscriptionPlanFeaturesController),
}

export default Admin