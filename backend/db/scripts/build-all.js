const { execSync } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const config = {
  db: 'gccb_db',
  user: 'postgres',

  // Add more scripts to this list as created
  scripts: [
    'initialize_db.sql',
    'add_dummy_data.sql',
    'update_db_sso.sql',
    'add_user_last_login.sql',
    'create_report_table.sql',
    'add_created_at_column_event_and_route.sql',
    'update_path_data_type.sql',
    'add_report_columns.sql',
  ],
}

const execOptions = {
  stdio: 'inherit',
  env: {
    ...process.env,
    PGPASSWORD: process.env.DB_PASSWORD,
  },
}
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

function runScripts() {
  makeDatabase()
  config.scripts.forEach(file => {
    try {
      console.log(`\nRunning: ${file}`)
      execSync(
        `psql -d ${config.db} -U ${config.user} -f ${path.join(__dirname, file)}`,
        execOptions
      )
    } catch (err) {
      console.error(`Error in ${file}. Resolve before continuing.`, err.message)
      process.exit(1)
    }
  })

  console.log('\nDatabase is up to date.')
}

runScripts()
