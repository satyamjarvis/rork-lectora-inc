# Email Verification Setup Guide

This guide explains how to enable and configure email verification for new user signups.

## Overview

The app now includes a complete email verification flow:
- Users sign up with email and password
- A verification email is sent automatically
- Users are redirected to a verification screen
- Users can verify their email and access the app

## Enable Email Confirmation in Supabase

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Settings**

### Step 2: Enable Email Confirmation

1. Under "Auth Providers", find **Email**
2. Toggle **"Confirm email"** to ON
3. Click **Save**

### Step 3: Configure Email Template (Optional)

You can customize the confirmation email:

1. Go to **Authentication** → **Email Templates**
2. Select **"Confirm signup"**
3. Customize the email content
4. Use these variables:
   - `{{ .ConfirmationURL }}` - Verification link
   - `{{ .SiteURL }}` - Your site URL
   - `{{ .Token }}` - Verification token

### Step 4: Test the Flow

1. Create a new account in the app
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. Return to the app and tap "I've Verified My Email"
5. You should be redirected to the app

## App Components

The verification flow includes:

### 1. Signup Screen (`app/(auth)/signup.tsx`)
- Redirects to verification screen after successful signup
- Passes email as a parameter

### 2. Verification Screen (`app/(auth)/verify-email.tsx`)
- Shows verification instructions
- Displays user's email
- "Resend Email" button
- "I've Verified" button
- Listens for auth state changes
- Auto-redirects when verified

### 3. Translations (`i18n/translations.ts`)
- English and Spanish support
- All verification screen texts

## Features

### ✅ Email Verification
- Automatic verification email
- Clear instructions
- Visual feedback

### ✅ Resend Email
- Users can request a new verification email
- Prevents spam with loading states

### ✅ Manual Check
- Users can manually check verification status
- Shows appropriate error messages

### ✅ Auto-Detection
- Listens for auth state changes
- Auto-redirects when email is verified

### ✅ Beautiful UI
- Matches app design
- Icons and animations
- Success states
- Error handling

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Use "Resend Email" button
4. Check Supabase email logs in Dashboard

### Verification Not Working
1. Ensure email confirmation is enabled in Supabase
2. Check Supabase logs for errors
3. Verify the confirmation link hasn't expired
4. Try signing out and back in

### Development Testing
- Use a real email address (test emails may not work)
- Check Supabase Dashboard → Authentication → Users to see verification status
- You can manually verify a user in the dashboard for testing

## Security Notes

- Email verification prevents fake signups
- Users cannot access the app until verified
- Verification tokens expire after 24 hours (default)
- Rate limiting prevents spam signups

## Customization

### Change Redirect URL
In `lib/supabase.ts`, you can configure the redirect:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ... other settings
    redirectTo: 'YOUR_CUSTOM_URL',
  },
});
```

### Modify Email Template
Customize the email in Supabase Dashboard to match your brand.

### Adjust UI
All UI components are in `app/(auth)/verify-email.tsx` and can be styled to match your design.

## Support

If you encounter issues:
1. Check Supabase Dashboard logs
2. Verify all settings are correct
3. Test with a fresh email address
4. Contact support with specific error messages
