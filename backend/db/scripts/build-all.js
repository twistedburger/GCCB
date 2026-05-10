const { execSync } = require('child_process')
const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '../../.env.development'),
})

const isProduction = process.env.NODE_ENV === 'production'

const config = {
  scripts: ['setup.sql'],
}

if (process.argv.includes('--seed')) {
  config.scripts.push('dummy_data.sql')
  config.scripts.push('seed_badges.sql')
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
  if (isProduction) {
    return
  }

  try {
    execSync(
      `psql -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d postgres -c "CREATE DATABASE ${process.env.DB_NAME};"`,
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
 * Returns the appropriate psql command based on the environment.
 * @param {string} filePath - The path to the SQL file to execute.
 * @returns {string} The psql command to execute the SQL file.
 */
function getPsqlCommand(filePath) {
  if (isProduction) {
    return `psql "${process.env.DATABASE_URL}" -f "${filePath}"`
  }

  return `psql -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f "${filePath}"`
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

      execSync(getPsqlCommand(filePath), {
        ...execOptions,
        shell: true,
      })
    } catch (err) {
      console.error(`Error in ${file}.`, err.message)
      process.exit(1)
    }
  })

  console.log('\nDatabase is up to date.')
}

runScripts()
