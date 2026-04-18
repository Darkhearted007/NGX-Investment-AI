#!/usr/bin/env node

/**
 * Supabase Configuration Validator
 * Run this after setting up your Supabase credentials in .env
 * 
 * Usage: node validate-supabase.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function validateSupabase() {
  log('\n═══════════════════════════════════════════════════', 'blue');
  log('     Supabase Configuration Validator', 'blue');
  log('═══════════════════════════════════════════════════\n', 'blue');

  let allPass = true;

  // ─── Check 1: Environment Variables ───
  log('1️⃣  Checking Environment Variables...', 'cyan');

  if (!supabaseUrl) {
    logError('VITE_SUPABASE_URL is not set in .env');
    allPass = false;
  } else if (!supabaseUrl.includes('supabase.co')) {
    logError('VITE_SUPABASE_URL looks invalid (should end with .supabase.co)');
    allPass = false;
  } else {
    logSuccess(`VITE_SUPABASE_URL: ${supabaseUrl}`);
  }

  if (!supabaseKey) {
    logError('VITE_SUPABASE_ANON_KEY is not set in .env');
    allPass = false;
  } else if (supabaseKey.length < 100) {
    logError('VITE_SUPABASE_ANON_KEY looks too short (should be 200+ chars)');
    allPass = false;
  } else {
    const preview = supabaseKey.substring(0, 20) + '...' + supabaseKey.substring(supabaseKey.length - 10);
    logSuccess(`VITE_SUPABASE_ANON_KEY: ${preview}`);
  }

  if (!supabaseUrl || !supabaseKey) {
    logError('\n❌ Cannot continue without Supabase credentials.');
    log('\nPlease follow SUPABASE_SETUP.md to:');
    log('  1. Create a Supabase project');
    log('  2. Get your credentials from Supabase Dashboard');
    log('  3. Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n');
    return false;
  }

  // ─── Check 2: Connection ───
  log('\n2️⃣  Testing Connection...', 'cyan');

  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    logSuccess('Supabase client created');
  } catch (error) {
    logError(`Failed to create Supabase client: ${error.message}`);
    allPass = false;
    return false;
  }

  // Test actual connection
  try {
    const { data, error } = await supabase
      .from('ngx_stocks')
      .select('count', { count: 'exact' })
      .limit(0);

    if (error) {
      if (error.code === '42P01') {
        logWarning('ngx_stocks table does not exist yet (this is normal on first setup)');
        logInfo('Run the SQL queries from SUPABASE_SETUP.md to create tables');
      } else {
        logError(`Connection failed: ${error.message}`);
      }
      allPass = false;
    } else {
      logSuccess('Connected to Supabase!');
    }
  } catch (error) {
    logError(`Connection test failed: ${error.message}`);
    allPass = false;
  }

  // ─── Check 3: Table Schema ───
  log('\n3️⃣  Checking Tables...', 'cyan');

  const tables = ['ngx_stocks', 'ngx_signal_history', 'ngx_users'];
  let tablesFound = 0;

  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('1')
        .limit(1);

      if (error && error.code === '42P01') {
        logWarning(`Table '${tableName}' not found`);
      } else if (error) {
        logWarning(`Cannot access '${tableName}': ${error.message}`);
      } else {
        logSuccess(`Table '${tableName}' exists`);
        tablesFound++;
      }
    } catch (error) {
      logWarning(`Error checking '${tableName}': ${error.message}`);
    }
  }

  if (tablesFound !== 3) {
    logWarning(`Only ${tablesFound}/3 tables found. Run SQL setup from SUPABASE_SETUP.md`);
    allPass = false;
  }

  // ─── Check 4: Sample Data ───
  log('\n4️⃣  Checking Sample Data...', 'cyan');

  try {
    const { data: stocks, error: dataError } = await supabase
      .from('ngx_stocks')
      .select('ticker, signal')
      .limit(5);

    if (dataError) {
      logWarning(`Cannot read data: ${dataError.message}`);
    } else if (!stocks || stocks.length === 0) {
      logWarning('No sample data found');
      logInfo('Add sample stocks in Supabase Dashboard or run INSERT statements from SUPABASE_SETUP.md');
      allPass = false;
    } else {
      logSuccess(`Found ${stocks.length} stocks:`);
      stocks.forEach(stock => {
        log(`   - ${stock.ticker}: ${stock.signal || 'No signal yet'}`);
      });
    }
  } catch (error) {
    logWarning(`Could not check data: ${error.message}`);
  }

  // ─── Check 5: .env File ───
  log('\n5️⃣  Checking .env File...', 'cyan');

  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    logSuccess('.env file exists');
    const envSize = fs.statSync(envPath).size;
    logInfo(`File size: ${envSize} bytes`);
  } else {
    logError('.env file does not exist');
    allPass = false;
  }

  // ─── Check 6: Vite Config ───
  log('\n6️⃣  Checking Vite Configuration...', 'cyan');

  const vitePath = path.join(__dirname, 'vite.config.js');
  if (fs.existsSync(vitePath)) {
    const viteContent = fs.readFileSync(vitePath, 'utf8');
    if (viteContent.includes('VITE_')) {
      logSuccess('Vite config properly configured for env vars');
    } else {
      logWarning('Vite config may not properly expose environment variables');
    }
  } else {
    logError('vite.config.js not found');
    allPass = false;
  }

  // ─── Check 7: Client Library ───
  log('\n7️⃣  Checking Supabase Client...', 'cyan');

  const clientPath = path.join(__dirname, 'src/lib/supabase.js');
  if (fs.existsSync(clientPath)) {
    const clientContent = fs.readFileSync(clientPath, 'utf8');
    if (clientContent.includes('createClient')) {
      logSuccess('Supabase client properly configured');
    } else {
      logError('Supabase client not properly set up');
      allPass = false;
    }
  } else {
    logError('src/lib/supabase.js not found');
    allPass = false;
  }

  // ─── Summary ───
  log('\n═══════════════════════════════════════════════════\n', 'blue');

  if (allPass) {
    logSuccess('ALL CHECKS PASSED! Your Supabase is ready to use.\n');
    logInfo('Next steps:');
    logInfo('  1. Start the development server: npm run dev');
    logInfo('  2. Open http://localhost:3000');
    logInfo('  3. View your stocks and signals from Supabase\n');
  } else {
    logWarning('SOME CHECKS FAILED. Please review and fix issues above.\n');
    logInfo('Common fixes:');
    logInfo('  1. Create Supabase account: https://supabase.com');
    logInfo('  2. Follow SUPABASE_SETUP.md for detailed instructions');
    logInfo('  3. Run this script again after fixing issues\n');
  }

  log('═══════════════════════════════════════════════════\n', 'blue');

  return allPass;
}

// Run validation
try {
  const result = await validateSupabase();
  process.exit(result ? 0 : 1);
} catch (error) {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
}
