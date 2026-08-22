const mineflayer = require('mineflayer')

const {
  pathfinder,
  Movements,
  goals
} = require('mineflayer-pathfinder')

const {
  GoalNear,
  GoalFollow
} = goals

// ======================================================
// CONFIGURATION
// ======================================================

const CONFIG = {
  host: process.env.MC_HOST || 'MrSadib.aternos.me',
  port: Number(process.env.MC_PORT || 54276),

  username: process.env.BOT_USERNAME || 'MyBot',

  // Use:
  // offline     -> only if your server allows offline/cracked accounts
  // microsoft   -> for an authenticated Microsoft Minecraft account
  auth: process.env.MC_AUTH || 'offline',

  version: '1.21.11',

  reconnectDelay: 10000,

  // How often the bot starts another wandering activity
  activityInterval: 30000
}

// ======================================================
// VARIABLES
// ======================================================

let bot = null
let activityTimer = null
let reconnectTimer = null
let shuttingDown = false

// ======================================================
// CREATE BOT
// ======================================================

function createBot() {

  console.log('-----------------------------------')
  console.log('Starting Minecraft bot...')
  console.log(`Server: ${CONFIG.host}:${CONFIG.port}`)
  console.log(`Version: ${CONFIG.version}`)
  console.log(`Username: ${CONFIG.username}`)
  console.log('-----------------------------------')

  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    auth: CONFIG.auth,
    version: CONFIG.version
  })

  bot.loadPlugin(pathfinder)

  // ====================================================
  // SPAWN
  // ====================================================

  bot.once('spawn', () => {

    console.log('Bot joined the server!')

    const movements = new Movements(bot)

    // Don't destroy blocks while randomly walking.
    movements.canDig = false

    bot.pathfinder.setMovements(movements)

    startActivities()

    setTimeout(() => {
      safeLookAround()
    }, 3000)
  })

  // ====================================================
  // CHAT
  // ====================================================

  bot.on('chat', (username, message) => {

    if (username === bot.username) return

    const args = message.trim().split(/\s+/)
    const command = args[0].toLowerCase()

    // ------------------------------
    // !help
    // ------------------------------

    if (command === '!help') {

      bot.chat(
        '!come, !follow, !stop, !where, !jump, !look'
      )

      return
    }

    // ------------------------------
    // !come
    // ------------------------------

    if (command === '!come') {

      const player = bot.players[username]

      if (!player || !player.entity) {
        bot.chat("I can't see you.")
        return
      }

      const pos = player.entity.position

      bot.pathfinder.setGoal(
        new GoalNear(
          pos.x,
          pos.y,
          pos.z,
          2
        )
      )

      bot.chat('Coming!')

      return
    }

    // ------------------------------
    // !follow
    // ------------------------------

    if (command === '!follow') {

      const player = bot.players[username]

      if (!player || !player.entity) {
        bot.chat("I can't see you.")
        return
      }

      bot.pathfinder.setGoal(
        new GoalFollow(
          player.entity,
          2
        ),
        true
      )

      bot.chat(`Following ${username}.`)

      return
    }

    // ------------------------------
    // !stop
    // ------------------------------

    if (command === '!stop') {

      bot.pathfinder.setGoal(null)

      bot.clearControlStates()

      bot.chat('Stopped.')

      return
    }

    // ------------------------------
    // !where
    // ------------------------------

    if (command === '!where') {

      if (!bot.entity) return

      const p = bot.entity.position

      bot.chat(
        `X:${Math.floor(p.x)} Y:${Math.floor(p.y)} Z:${Math.floor(p.z)}`
      )

      return
    }

    // ------------------------------
    // !jump
    // ------------------------------

    if (command === '!jump') {

      bot.setControlState('jump', true)

      setTimeout(() => {

        if (bot) {
          bot.setControlState('jump', false)
        }

      }, 500)

      return
    }

    // ------------------------------
    // !look
    // ------------------------------

    if (command === '!look') {

      safeLookAround()

      return
    }
  })

  // ====================================================
  // HEALTH
  // ====================================================

  bot.on('health', () => {

    if (!bot.entity) return

    if (bot.health <= 5) {
      console.log(`Low health: ${bot.health}`)
    }
  })

  // ====================================================
  // DEATH
  // ====================================================

  bot.on('death', () => {

    console.log('Bot died.')

    stopMovement()

    setTimeout(() => {

      if (bot && bot.entity) {
        safeLookAround()
      }

    }, 5000)
  })

  // ====================================================
  // KICK
  // ====================================================

  bot.on('kicked', reason => {

    console.log('Bot was kicked:')
    console.log(reason)
  })

  // ====================================================
  // ERROR
  // ====================================================

  bot.on('error', error => {

    console.log('Minecraft error:')
    console.log(error.message)
  })

  // ====================================================
  // DISCONNECT
  // ====================================================

  bot.on('end', () => {

    console.log('Bot disconnected.')

    stopActivities()

    if (!shuttingDown) {
      scheduleReconnect()
    }
  })
}

// ======================================================
// RANDOM ACTIVITY
// ======================================================

function startActivities() {

  stopActivities()

  activityTimer = setInterval(() => {

    if (!bot || !bot.entity) return

    // Don't interrupt following/pathfinding.
    if (bot.pathfinder.isMoving()) return

    const action = Math.floor(Math.random() * 4)

    switch (action) {

      case 0:
        randomWalk()
        break

      case 1:
        safeLookAround()
        break

      case 2:
        randomJump()
        break

      case 3:
        randomWalk()
        safeLookAround()
        break
    }

  }, CONFIG.activityInterval)
}

// ======================================================
// RANDOM WALK
// ======================================================

function randomWalk() {

  if (!bot || !bot.entity) return

  const current = bot.entity.position

  const distance = 5 + Math.floor(Math.random() * 10)

  const angle = Math.random() * Math.PI * 2

  const x =
    current.x +
    Math.cos(angle) * distance

  const z =
    current.z +
    Math.sin(angle) * distance

  const y = current.y

  console.log(
    `Walking toward ${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}`
  )

  bot.pathfinder.setGoal(
    new GoalNear(
      Math.floor(x),
      Math.floor(y),
      Math.floor(z),
      2
    )
  )
}

// ======================================================
// RANDOM JUMP
// ======================================================

function randomJump() {

  if (!bot || !bot.entity) return

  bot.setControlState('jump', true)

  setTimeout(() => {

    if (bot) {
      bot.setControlState('jump', false)
    }

  }, 400)
}

// ======================================================
// LOOK AROUND
// ======================================================

async function safeLookAround() {

  if (!bot || !bot.entity) return

  try {

    const yaw =
      Math.random() * Math.PI * 2

    const pitch =
      (Math.random() - 0.5) * 0.5

    await bot.look(
      yaw,
      pitch,
      true
    )

  } catch (error) {

    console.log(
      'Look error:',
      error.message
    )
  }
}

// ======================================================
// STOP MOVEMENT
// ======================================================

function stopMovement() {

  if (!bot) return

  try {

    bot.pathfinder.setGoal(null)
    bot.clearControlStates()

  } catch (error) {

    console.log(
      'Movement stop error:',
      error.message
    )
  }
}

// ======================================================
// ACTIVITY TIMER
// ======================================================

function stopActivities() {

  if (activityTimer) {

    clearInterval(activityTimer)

    activityTimer = null
  }
}

// ======================================================
// RECONNECT
// ======================================================

function scheduleReconnect() {

  if (reconnectTimer) return

  console.log(
    `Reconnecting in ${CONFIG.reconnectDelay / 1000} seconds...`
  )

  reconnectTimer = setTimeout(() => {

    reconnectTimer = null

    if (!shuttingDown) {
      createBot()
    }

  }, CONFIG.reconnectDelay)
}

// ======================================================
// SHUTDOWN
// ======================================================

function shutdown() {

  shuttingDown = true

  console.log('Shutting down bot...')

  stopActivities()

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }

  if (bot) {

    try {
      bot.quit('Bot shutting down')
    } catch {}
  }

  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// ======================================================
// START
// ======================================================

createBot()
