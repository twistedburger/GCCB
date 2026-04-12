const { execSync } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const config = {
  db: 'gccb_db',
  user: 'postgres',
  scripts: ['setup.sql'],
}

if (process.argv.includes('--seed')) {
  config.scripts.push('dummy_data.sql')
}

const execOptions = {
  stdio: 'inherit',
  env: {
    ...process.env,
    PGPASSWORD: process.env.DB_PASSWORD,
  },
}

/**
 * Creates the database if it does not already exist.
 */
function makeDatabase() {
  try {
    execSync(
      `psql -U ${config.user} -d postgres -c "CREATE DATABASE ${config.db};"`,
      {
        ...execOptions,
        stdio: 'pipe',
      }
    )
  } catch (err) {
    console.log(
      err.message +
        'Database may already exist, continuing with script execution.'
    )
  }
}

/**
 * Runs all available scripts within db script directory.
 */
function runScripts() {
  makeDatabase()
  config.scripts.forEach(file => {
    try {
      console.log(`\nRunning: ${file}`)
      const filePath = path.join(__dirname, file)
      execSync(`psql -d ${config.db} -U ${config.user} -f "${filePath}"`, {
        ...execOptions,
        shell: true,
      })
    } catch (err) {
      console.error(`Error in ${file}. Resolve before continuing.`, err.message)
      process.exit(1)
    }
  })

  console.log('\nDatabase is up to date.')
}

runScripts()
