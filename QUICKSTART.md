# 🚀 Quick Start - Supabase Integration

## ⚡ 5-Minute Setup

### 1️⃣ Go to Supabase Dashboard
Visit: https://hodsrehnvqizglehqebm.supabase.co

### 2️⃣ Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**

### 3️⃣ Run Database Setup
1. Open the file `supabase-schema.sql` in your code editor
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Paste it in the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success" message

### 4️⃣ Verify Tables Created
1. Click **Table Editor** in the left sidebar
2. You should see 6 tables:
   - ✅ profiles
   - ✅ folders
   - ✅ articles
   - ✅ reading_sessions
   - ✅ daily_statistics
   - ✅ user_statistics

### 5️⃣ Test the App
```bash
# Clear cache and restart
npm run start -- --clear
# or
bun run start -- --clear
```

### 6️⃣ Create Your First User
1. Open the app
2. Click "Sign Up"
3. Enter:
   - Name: Tu Nombre
   - Email: tu@email.com
   - Password: (mínimo 6 caracteres)
4. Click "Create Account"

### 7️⃣ Verify User Created
1. Go back to Supabase
2. Click **Authentication** > **Users**
3. You should see your new user!
4. Click **Table Editor** > **profiles**
5. You should see your profile!

## ✅ You're Done!

Your app is now fully integrated with Supabase!

### What Works Now?
- ✅ User registration and login
- ✅ Save articles to the cloud
- ✅ Organize in folders
- ✅ Track reading statistics
- ✅ Sync across devices
- ✅ Delete account and all data

## 📚 Documentation

For detailed information:
- **Setup Guide**: `SUPABASE_SETUP.md`
- **Privacy & Data**: `PRIVACY_AND_DATA_DELETION.md`
- **Complete Summary**: `SUPABASE_INTEGRATION_SUMMARY.md`

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution**: Restart your development server
```bash
npm run start -- --clear
```

### Error: "relation does not exist"
**Solution**: Run the SQL schema again in Supabase SQL Editor

### Tables not appearing in Table Editor
**Solution**: 
1. Refresh the page
2. Make sure the SQL ran without errors
3. Check for error messages in the SQL Editor

### Can't log in after creating account
**Solution**: 
1. Check Supabase **Authentication** > **Settings**
2. Disable "Enable email confirmations" for development
3. Or check your email for confirmation link

### Data not syncing
**Solution**:
1. Check console logs for errors
2. Verify you're logged in: The user object should be in state
3. Check **Table Editor** to see if data is being saved

## 🎯 Next Steps

### Add Delete Account Button
Add to your settings page:

```typescript
import { Alert } from 'react-native';
import { useAuth } from '@/providers/auth-provider';

const SettingsScreen = () => {
  const { deleteAccount } = useAuth();

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro? Esta acción eliminará todos tus datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleDelete}>
      <Text style={{ color: 'red' }}>Eliminar Cuenta</Text>
    </TouchableOpacity>
  );
};
```

### Test Multi-Device Sync
1. Log in on multiple devices with the same account
2. Save an article on one device
3. Pull to refresh on another device
4. The article should appear!

### Monitor Usage
Check your Supabase dashboard:
1. **Database** > **Database Usage**
2. **Authentication** > **Users**
3. Monitor your free tier limits

## 🎉 That's It!

You now have a production-ready app with:
- Real authentication
- Cloud database
- Multi-device sync
- Privacy compliance
- Scalable architecture

**Happy coding! 🚀**
