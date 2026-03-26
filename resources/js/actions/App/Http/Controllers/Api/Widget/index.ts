import SessionController from './SessionController'
import ChatController from './ChatController'
import FileController from './FileController'
import WebhookController from './WebhookController'
import AnalyticsController from './AnalyticsController'

const Widget = {
    SessionController: Object.assign(SessionController, SessionController),
    ChatController: Object.assign(ChatController, ChatController),
    FileController: Object.assign(FileController, FileController),
    WebhookController: Object.assign(WebhookController, WebhookController),
    AnalyticsController: Object.assign(AnalyticsController, AnalyticsController),
}

export default Widget