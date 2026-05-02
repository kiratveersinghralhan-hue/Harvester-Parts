# Delivery / shipping connection

Current website:
- Calculates shipping estimate by total cart weight.
- Supports Standard Cargo and Premium Blue Dart estimate UI.
- Saves shipping amount to Supabase orders.

Recommended launch workflow:
1. Keep shipment booking manual for first orders.
2. When order is placed, you see buyer details and items in admin/orders.
3. Book shipment in your courier dashboard.
4. Add AWB / tracking link to the order in Supabase.

Automation later:
- Use Shiprocket API through Supabase Edge Functions.
- Shiprocket docs provide API users, tokens, rate calculator, order creation and tracking.
- Your frontend should never expose courier API secret. Only Edge Function should call shipping APIs.

Blue Dart Premium:
- Keep it as premium estimate/manual option for valuable/heavy parts.
- User pays shipping; you do not bear shipping loss.
