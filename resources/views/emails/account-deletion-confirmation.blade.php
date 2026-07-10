@component('mail::message')
# Confirm Your Account Deletion

Hi {{ $user->name }},

You've requested to delete your Shoplace account. To proceed, please click the button below:

@component('mail::button', ['url' => $deletionUrl])
Confirm Deletion
@endcomponent

**Important:** This link will expire in 24 hours. If you did not request this deletion, please ignore this email.

When you confirm, you'll be asked to enter your password to verify this action.

---

**What will be deleted:**
- Your profile and all personal information
- All your posts and comments
- All your messages
- Your wallet and financial data
- Any ads or ad spaces you created
- All followers and following relationships

This action **cannot be undone**.

If you have any questions, please contact us at support@shoplace.com

Thanks,
**The Shoplace Team**
@endcomponent