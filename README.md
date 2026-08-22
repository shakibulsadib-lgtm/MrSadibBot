# Minecraft 1.21.11 Bot

A Mineflayer Minecraft Java 1.21.11 bot with:

- Random wandering
- Looking around
- Jumping
- Player following
- Player navigation
- Chat commands
- Automatic reconnection
- Health monitoring
- Death handling

## Requirements

- Node.js 18 or newer
- Minecraft Java Edition server
- Minecraft Java 1.21.11

## Installation

Clone the repository:

    git clone YOUR_GITHUB_REPOSITORY_URL

Enter the folder:

    cd minecraft-aternos-bot

Install dependencies:

    npm install

## Configuration

Set these environment variables:

    MC_HOST
    MC_PORT
    BOT_USERNAME
    MC_AUTH

Example:

    MC_HOST=yourserver.aternos.me
    MC_PORT=25565
    BOT_USERNAME=MyBot
    MC_AUTH=offline

The `offline` authentication option should only be used when the server is configured to allow offline-mode accounts.

For an authenticated Microsoft account, use:

    MC_AUTH=microsoft

Do not put account passwords or tokens in the GitHub repository.

## Start

Run:

    npm start

## Commands

    !help

Shows available commands.

    !come

Makes the bot walk to the player.

    !follow

Makes the bot follow the player.

    !stop

Stops pathfinding and movement.

    !where

Shows the bot's coordinates.

    !jump

Makes the bot jump.

    !look

Makes the bot look in a random direction.

## Important

GitHub stores the source code. It does not continuously execute Node.js programs.

For continuous operation, the Node.js program needs to run on a computer or hosting service that remains online.

This project does not attempt to bypass server anti-bot, anti-AFK, or hosting restrictions.
