const { execSync } = require('child_process')
const path = require('path')

const config = {
  db: 'gccb_db',
  user: 'postgres',

  // Add more scripts to this list as created
  scripts: [
    'initialize_db.sql',
    'add_dummy_data.sql',
    'add_vehicle_to_user.sql',
  ],
}

function makeDatabase() {
  try {
    execSync(`psql -U ${config.user} -c "CREATE DATABASE ${config.db};"`, {
      stdio: 'pipe',
    })
  } catch (err) {
    console.log(err.message + ' ^^^^^ Not a real error :) ^^^^^')
  }
}

function runScripts() {
  makeDatabase()
  config.scripts.forEach(file => {
    try {
      console.log(`\nRunning: ${file}`)
      execSync(
        `psql -d ${config.db} -U ${config.user} -f ${path.join(__dirname, file)}`,
        { stdio: 'inherit' }
      )
    } catch (err) {
      console.error(`Error in ${file}. Resolve before continuing.`, err.message)
      process.exit(1)
    }
  })

  console.log('\nDatabase is up to date.')
}

runScripts()
