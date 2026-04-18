# Supabase Connection Guide

## Step 1: Setup Environment
1. Navigate to your project directory:
   ```bash
   cd path/to/your/project
   ```
2. Create a `.env` file (if it doesn’t exist) to store your environment variables:
   ```bash
   touch .env
   ```

## Step 2: Create Supabase Project
1. Log in to your [Supabase account](https://supabase.com/).
2. Click on "New Project".
3. Fill in the project details:
   - **Project Name**: Choose a unique name.
   - **Organization**: Select or create an organization.
   - **Database Password**: Set a strong password for your database.
4. Click on "Create New Project" and wait for provisioning.

## Step 3: Database Setup
1. After your project is created, go to the "SQL Editor" in Supabase.
2. Run the following SQL command to create a new table (modify as required):
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

## Step 4: Obtain API Keys
1. Navigate to the "Settings" > "API" in your Supabase project dashboard.
2. Note down the `URL` and `anon` `public` API `key`. These will be used for connecting your application to Supabase.

## Step 5: Update .env File
1. Open the `.env` file in your project directory.
2. Add the following keys:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   ```
   Replace `your_supabase_url` and `your_anon_key` with the values from your Supabase project.

## Step 6: Verification Steps
1. Install the Supabase client library (e.g., for JavaScript: `npm install @supabase/supabase-js`).
2. Use the following code to test the connection in your project:
   ```javascript
   import { createClient } from '@supabase/supabase-js';

   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

   async function checkConnection() {
       const { data, error } = await supabase.from('users').select('*');
       console.log(data, error);
   }

   checkConnection();
   ```
3. If you receive user data without errors, your connection is successful!