with open('.env.local', 'w') as f:
    f.write('NEXT_PUBLIC_SUPABASE_URL=https://nafqxkzbofvmkiceotxo.supabase.co\n')
    f.write('NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aG_7WtCcBjo8W54tuM5CaQ_TM7uwGW-Z\n')
print("Successfully fixed .env.local")
