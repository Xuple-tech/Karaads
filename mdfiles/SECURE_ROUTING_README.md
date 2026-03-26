# Secure Routing System

## Overview

This document describes the comprehensive security overhaul implemented for the Rhea AI Application, featuring heavily obfuscated routes, enhanced security measures, and comprehensive audit logging.

## 🔒 Security Features

### 1. Route Obfuscation
- **Heavy Obfuscation**: All routes use randomized 8-character alphanumeric patterns
- **UUID-based Parameters**: All resource identifiers use UUIDs instead of incremental IDs
- **Dynamic Route Generation**: Routes can be regenerated periodically for enhanced security

### 2. Enhanced Middleware Stack
- **SecureRouteMiddleware**: Comprehensive security validation
- **UuidValidationMiddleware**: Validates UUID format for all route parameters
- **BotDetection**: Advanced bot and automated tool detection
- **Enhanced Rate Limiting**: Tiered rate limiting based on route sensitivity

### 3. Content Security
- **Input Sanitization**: All user inputs are sanitized and validated
- **XSS Protection**: Advanced XSS attack detection and prevention
- **SQL Injection Prevention**: Pattern-based SQL injection detection
- **File Upload Security**: Secure file handling with type and size validation

### 4. Audit Logging
- **Comprehensive Logging**: All security events are logged with detailed metadata
- **Threat Detection**: Automatic detection and logging of suspicious activities
- **Performance Monitoring**: Track and analyze security metrics

## 📁 File Structure

```
routes/
├── secure-api.php           # Secure API routes with obfuscation
├── secure-web.php           # Secure web routes with obfuscation
├── secure-auth.php          # Secure authentication routes
├── secure-admin.php         # Secure admin routes
└── secure-project-chats.php # Secure project chat routes

app/Http/Middleware/
├── SecureRouteMiddleware.php    # Main security middleware
├── UuidValidationMiddleware.php # UUID validation
└── BotDetection.php            # Enhanced bot detection

app/Services/
├── SecureGrokApiService.php    # Secure AI service
├── SecurityAuditService.php    # Audit logging service
└── ...

app/Models/
└── SecurityAuditLog.php       # Security audit log model

app/Console/Commands/
├── GenerateSecureRoutes.php   # Route generation command
├── CleanSecurityAuditLogs.php # Log cleanup command
└── SecurityHealthCheck.php    # Security health monitoring
```

## 🚀 Installation & Setup

### 1. Run Database Migration
```bash
php artisan migrate
```

### 2. Publish Configuration
```bash
php artisan vendor:publish --tag=secure-routing-config
```

### 3. Generate Initial Secure Routes
```bash
php artisan secure:generate-routes
```

### 4. Configure Environment Variables
Add to your `.env` file:
```env
SECURE_ROUTING_ENABLED=true
ROUTE_OBFUSCATION_LEVEL=heavy
BOT_DETECTION_STRICT=true
AUDIT_LOG_ALL_REQUESTS=false
SESSION_CHECK_IP=false
API_REQUIRE_HTTPS=true
```

## 🛡️ Security Configurations

### Rate Limiting Tiers
- **Authentication**: 5 attempts per 5 minutes
- **Admin Routes**: 20 attempts per minute
- **API Routes**: 60 attempts per minute
- **Chat Routes**: 30 attempts per minute
- **Default**: 100 attempts per minute

### Content Security Policies
- **Max Message Length**: 10,000 characters
- **Max File Size**: 10MB
- **Allowed File Types**: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
- **XSS Protection**: Enabled with pattern detection
- **SQL Injection Protection**: Enabled with pattern detection

### UUID Validation
All route parameters ending with 'Uuid' or in the predefined list are validated:
- `userUuid`, `projectUuid`, `conversationUuid`, `chatUuid`
- `agentUuid`, `memoryUuid`, `scheduleUuid`, `chainUuid`
- `triggerUuid`, `actionUuid`, `logUuid`, `fileUuid`

## 📊 Monitoring & Management

### Security Health Check
```bash
php artisan security:health-check --detailed --days=7
```

### Clean Audit Logs
```bash
php artisan security:clean-audit-logs --days=90 --keep-critical=365
```

### Generate New Routes
```bash
php artisan secure:generate-routes --force
```

## 🔄 Route Examples

### Before (Legacy)
```
GET  /conversations
POST /conversations
GET  /conversations/{id}
POST /chat/message
```

### After (Secure)
```
GET  /api/secure/chat/x9k2m7p4/conv/list/w6r9t2y5
POST /api/secure/chat/x9k2m7p4/conv/create/h5j8n3q1
GET  /api/secure/chat/x9k2m7p4/conv/show/{uuid}/m4k7l9p2
POST /api/secure/chat/x9k2m7p4/msg/send/a2s5d8f1
```

## 🎯 Frontend Integration

### Route Helper (JavaScript)
```javascript
// Use the secure route helper
const routes = {
    chat: {
        create: '/api/secure/chat/x9k2m7p4/conv/create/h5j8n3q1',
        list: '/api/secure/chat/x9k2m7p4/conv/list/w6r9t2y5',
        show: (uuid) => `/api/secure/chat/x9k2m7p4/conv/show/${uuid}/m4k7l9p2`,
        send: '/api/secure/chat/x9k2m7p4/msg/send/a2s5d8f1'
    }
};
```

### Security Token Integration
```javascript
// Include security token in requests
const securityToken = document.querySelector('meta[name="security-token"]').content;

fetch(routes.chat.send, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Security-Token': securityToken
    },
    body: JSON.stringify({
        message: 'Hello',
        conversation_id: conversationUuid,
        security_token: securityToken
    })
});
```

## 📈 Security Metrics

The system tracks various security metrics:

- **Total Events**: All security-related events
- **Security Violations**: Critical security breaches
- **Unauthorized Access**: Failed access attempts
- **Suspicious Activity**: Potential threats
- **Rate Limit Exceeded**: Rate limiting violations
- **Top IPs**: Most active IP addresses
- **Daily Trends**: Event patterns over time

## 🚨 Incident Response

### Automatic Responses
- **Rate Limiting**: Automatic IP throttling
- **Bot Detection**: Immediate blocking of automated tools
- **Content Filtering**: Rejection of malicious content
- **Audit Logging**: Comprehensive event tracking

### Manual Responses
- **IP Blacklisting**: Manual IP blocking capability
- **User Suspension**: Account suspension for violations
- **Route Regeneration**: Emergency route pattern changes
- **Lockdown Mode**: System-wide security lockdown

## 🔧 Troubleshooting

### Common Issues

1. **Route Not Found (404)**
   - Check if secure routing is enabled
   - Verify route patterns are current
   - Ensure UUID format is correct

2. **Rate Limit Exceeded (429)**
   - Check rate limiting configuration
   - Verify user behavior patterns
   - Consider adjusting limits for legitimate users

3. **Security Validation Failed (403)**
   - Verify security tokens are included
   - Check UUID parameter formats
   - Ensure content passes security filters

### Debug Commands
```bash
# Check security configuration
php artisan config:show secure-routing

# View recent security events
php artisan security:health-check --detailed

# Test route generation
php artisan secure:generate-routes --force
```

## 📝 Migration Guide

### From Legacy Routes

1. **Update Frontend Routes**: Replace all hardcoded routes with secure patterns
2. **Add Security Tokens**: Include security tokens in all requests
3. **Use UUIDs**: Replace incremental IDs with UUIDs
4. **Update API Calls**: Modify API endpoints to use secure patterns

### Testing Checklist

- [ ] All routes return expected responses
- [ ] Security tokens are properly validated
- [ ] UUID validation works correctly
- [ ] Rate limiting functions as expected
- [ ] Audit logging captures events
- [ ] Bot detection blocks automated tools
- [ ] Content filtering prevents malicious input

## 🔮 Future Enhancements

- **Dynamic Route Rotation**: Automatic route pattern changes
- **Machine Learning Threat Detection**: AI-powered security analysis
- **Real-time Monitoring Dashboard**: Live security metrics
- **Advanced Encryption**: End-to-end encryption for sensitive data
- **Biometric Authentication**: Enhanced user verification

## 📞 Support

For security-related issues or questions:
1. Check the security health status
2. Review audit logs for patterns
3. Consult this documentation
4. Contact the development team

---

**⚠️ Security Notice**: This system implements heavy security measures. Ensure all team members are familiar with the new routing patterns and security requirements before deployment.
