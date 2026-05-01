Harvester Parts v35 final document + approval fix

SQL required: YES if you want a clean database. Run database-clean-reset-full.sql once in Supabase SQL editor.

This version fixes:
- Admin document buttons binding
- Secure signed Aadhaar/shop document opening
- Admin approval/reject buttons with visible errors
- Seller approval updates user role and sends notification
- Clean storage buckets and RLS policies in SQL

After SQL:
1. Add keys in config.js
2. Upload files to GitHub root
3. Logout/login again
4. Test seller verification and admin approval
