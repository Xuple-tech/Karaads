import AIModeController from './AIModeController'
import PersonalizationAdminController from './PersonalizationAdminController'
import DashboardController from './DashboardController'
import UserController from './UserController'
import StaffController from './StaffController'
import SaasOwnerController from './SaasOwnerController'
import AdminDashboardController from './AdminDashboardController'
import GrokApiController from './GrokApiController'
import PromptController from './PromptController'
import PersonalizationController from './PersonalizationController'
import SubscriptionPlanController from './SubscriptionPlanController'
import SubscriptionPlanFeaturesController from './SubscriptionPlanFeaturesController'
const Admin = {
    AIModeController: Object.assign(AIModeController, AIModeController),
PersonalizationAdminController: Object.assign(PersonalizationAdminController, PersonalizationAdminController),
DashboardController: Object.assign(DashboardController, DashboardController),
UserController: Object.assign(UserController, UserController),
StaffController: Object.assign(StaffController, StaffController),
SaasOwnerController: Object.assign(SaasOwnerController, SaasOwnerController),
AdminDashboardController: Object.assign(AdminDashboardController, AdminDashboardController),
GrokApiController: Object.assign(GrokApiController, GrokApiController),
PromptController: Object.assign(PromptController, PromptController),
PersonalizationController: Object.assign(PersonalizationController, PersonalizationController),
SubscriptionPlanController: Object.assign(SubscriptionPlanController, SubscriptionPlanController),
SubscriptionPlanFeaturesController: Object.assign(SubscriptionPlanFeaturesController, SubscriptionPlanFeaturesController),
}

export default Admin