# KaraAds v1.2 Earnings API

Base URL: `https://karaads.com/api/open-labs/oyibo/v1.2`

All responses use the v1.2 envelope:

```json
{
  "success": true,
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {}
  }
}
```

## Headers

For authenticated endpoints, include:

```
Authorization: Bearer {TOKEN}
Content-Type: application/json
Accept: application/json
```

## Notes

- All endpoints below require authenticated and verified users.
- For mobile integration, use the `/earnings/*` paths.
- Legacy aliases under `/rewarded/*` remain available.
- Active-session lock for rewarded flow is currently disabled to allow multi-tab and multi-device usage.

## Endpoints

### Get Earnings Queue
`GET /earnings/queue?limit=10`

Response (200):
```json
{
  "success": true,
  "data": {
    "ads": [
      {
        "delivery_id": "uuid",
        "signature": "hmac-signature",
        "session_id": "session-id",
        "title": "Creative Title",
        "description": "Creative Description",
        "media_url": "https://...",
        "media_type": "video",
        "duration": 30,
        "required_view_seconds": 30,
        "ad_type": "rewarded",
        "reward": 2,
        "target_url": "https://..."
      }
    ],
    "count": 1
  }
}
```

### Complete Rewarded View
`POST /earnings/{deliveryId}/complete`

Request:
```json
{
  "signature": "hmac-signature",
  "view_duration": 30,
  "meta": {
    "client": "android"
  }
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "message": "Rewarded completion recorded.",
    "event_id": "uuid",
    "earnings": {
      "total_earned": 20,
      "available_balance": 12
    },
    "wallet": {
      "id": "uuid",
      "user_id": "uuid",
      "balance": 12,
      "total_earned": 20,
      "total_withdrawn": 8,
      "pending_withdrawal": 0,
      "currency": "NGN",
      "is_active": true
    }
  }
}
```

Validation error example (422):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Rewarded ad must be watched for at least 30 seconds.",
    "details": {
      "required_view_seconds": 30
    }
  }
}
```

### Get Earnings Summary
`GET /earnings/summary`

Response (200):
```json
{
  "success": true,
  "data": {
    "total_earned": 120,
    "pending": 0,
    "processing": 10,
    "available_balance": 110,
    "today_earnings": 8,
    "week_earnings": 35,
    "month_earnings": 120,
    "ads_completed": 60,
    "ads_watched": 60,
    "average_earning_per_ad": 2,
    "total_withdrawn": 40
  }
}
```

### Get Wallet Snapshot
`GET /earnings/wallet`

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "balance": 110,
    "total_earned": 120,
    "total_withdrawn": 10,
    "pending_withdrawal": 0,
    "currency": "NGN",
    "is_active": true
  }
}
```

### List Banks
`GET /earnings/banks`

Response (200):
```json
{
  "success": true,
  "data": {
    "status": true,
    "message": "Banks fetched",
    "data": [
      {
        "bank_code": "058",
        "bank_name": "GTBank"
      }
    ]
  }
}
```

### Resolve Bank Account Name
`POST /earnings/banks/resolve`

Request:
```json
{
  "account_number": "0123456789",
  "bank_code": "058"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "status": true,
    "data": {
      "account_number": "0123456789",
      "bank_code": "058",
      "account_name": "JOHN DOE"
    }
  }
}
```

### Create Withdrawal
`POST /earnings/withdraw`

Request:
```json
{
  "amount": 50,
  "account_number": "0123456789",
  "bank_code": "058",
  "narration": "Creator payout"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "message": "Withdrawal request submitted.",
    "reference": "rw_xxx",
    "transfer": {
      "status": "processing"
    },
    "wallet": {
      "id": "uuid",
      "balance": 60,
      "pending_withdrawal": 50,
      "currency": "NGN"
    }
  }
}
```

### Get Withdrawal Status
`GET /earnings/withdraw/status/{reference}`

Response (200):
```json
{
  "success": true,
  "data": {
    "reference": "rw_xxx",
    "status": "pending",
    "response": {
      "status": "success"
    }
  }
}
```

### Get Interface Balance
`GET /earnings/interface/balance`

Response (200):
```json
{
  "success": true,
  "data": {
    "status": true,
    "data": {
      "balance": 500000
    }
  }
}
```