Harvester Parts clean Supabase setup
====================================

Use only this file in Supabase SQL Editor:

  SUPABASE_CLEAN_FULL_RESET.sql

It replaces the old optional patch SQL files. It drops the old app tables, clears product/verification storage object metadata, recreates all app tables, adds RLS policies, creates product-images and verification-docs buckets, and locks admin access to:

  kiratveersinghralhan@gmail.com

Important steps:
1. Open Supabase Dashboard > SQL Editor.
2. Paste and run SUPABASE_CLEAN_FULL_RESET.sql.
3. In Supabase Auth, enable the login providers you want: Email, Google, Phone OTP, etc.
4. Open the website and sign up/log in with kiratveersinghralhan@gmail.com.
5. That account becomes the admin automatically.

Do not run the old SUPABASE_V68 or SUPABASE_V70 optional SQL after this reset, because this file already includes the complete schema.

FIX IN v72:
- Removed the forbidden DELETE FROM storage.objects statement. Supabase blocks direct deletion from storage tables.
- To clear old uploaded files, use Supabase Dashboard > Storage and empty the product-images and verification-docs buckets, or use the Storage API.
- The SQL still resets all app tables/history and recreates the storage buckets, settings, grants, and policies.
