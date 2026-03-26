import auth from './auth'
import chat from './chat'
import voice from './voice'
import email from './email'
import images from './images'
import files from './files'
import settings from './settings'
import subscription from './subscription'
import admin from './admin'
import teams from './teams'
import workflows from './workflows'
import mcp from './mcp'

const secure = {
    auth: Object.assign(auth, auth),
    chat: Object.assign(chat, chat),
    voice: Object.assign(voice, voice),
    email: Object.assign(email, email),
    images: Object.assign(images, images),
    files: Object.assign(files, files),
    settings: Object.assign(settings, settings),
    subscription: Object.assign(subscription, subscription),
    admin: Object.assign(admin, admin),
    teams: Object.assign(teams, teams),
    workflows: Object.assign(workflows, workflows),
    mcp: Object.assign(mcp, mcp),
}

export default secure