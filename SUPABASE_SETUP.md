# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name for your project (e.g., "unidemy-marketplace")
3. Set a strong database password
4. Choose a region close to your users

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - Project URL
   - Anon (public) key

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Example:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables, policies, and functions

## 5. Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure the following:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: Add `http://localhost:3000/auth/callback`
   - Enable email confirmations (optional)
   - Configure social providers if needed (Google, Facebook, etc.)

## 6. Set Up Storage

1. Go to Storage in your Supabase dashboard
2. The `product-images` bucket should be created automatically by the schema
3. If not, create it manually with public access

## 7. Test Your Setup

1. Start your development server: `npm run dev`
2. Try to register a new user
3. Check if the user appears in the Authentication > Users section
4. Verify the user profile is created in the `users` table

## 8. Production Deployment

For production deployment:

1. Update your environment variables with production Supabase credentials
2. Update Site URL and Redirect URLs in Supabase Auth settings
3. Configure your domain in the Supabase dashboard
4. Set up proper CORS policies if needed

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your domain is added to the allowed origins in Supabase
2. **RLS Policies**: Check that Row Level Security policies are correctly set up
3. **Storage Access**: Verify storage bucket policies allow public read access
4. **Environment Variables**: Ensure `.env.local` is in your `.gitignore` file

### Useful Commands:

\`\`\`bash
# Check if environment variables are loaded
npm run dev

# Test Supabase connection
# Add this to a component to test:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
\`\`\`
