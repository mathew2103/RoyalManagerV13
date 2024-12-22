Here’s a comprehensive README based on the details you’ve provided:

---

# Royal Manager v13

**Royal Manager v13** is a Discord bot designed for a two-server setup: a **main server** and a **staff server**. This bot includes a variety of features for moderation, staff management, utility, economy, and music, along with handling **Top.gg votes** via an Express API.

> **Note:** This project is outdated and relies on **Discord.js v13**, which no longer supports the latest Discord API. As a result, the bot will not function properly unless updated to the latest Discord.js version. Consider upgrading the project for compatibility with the current Discord API.

---

## Features

### Core Functionality
1. **Moderation**: Commands for banning, kicking, muting, and other server management tasks.
2. **Utility**: Tools to assist with general server operations.
3. **Staff Management**: Features to manage staff activity and communication across the staff server.
4. **Economy**: A basic economy system for user engagement.
5. **Music Commands**: Simple commands to play and manage music in voice channels.
6. **Top.gg Votes**: Integrates with **Top.gg** using **Express** to track and reward server votes via an API.

---

## Requirements

- **Node.js**: Version 16.6.0 or higher (required for Discord.js v13)
- **MongoDB**: A running MongoDB instance or cluster
- **Discord.js**: Version 13 (outdated)
- **Express**: For handling Top.gg vote integration

---

## Installation

To set up the bot locally, follow these steps:

### 1. Clone the repository:

```bash
git clone https://github.com/mathew2103/RoyalManagerV13.git
```

### 2. Navigate to the project directory:

```bash
cd RoyalManagerV13
```

### 3. Install dependencies:

Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
npm install
```

### 4. Configure the bot:

1. **Environment Variables**:
   - Rename `.env.example` to `.env`.
   - Update the `.env` file with the required environment variables:
     - `DISCORD_TOKEN`: Your bot's Discord token
     - `MONGO_URI`: Connection string for your MongoDB instance
     - `TOPGG_API_TOKEN`: Token for integrating with Top.gg API
2. **Config File**:
   - Rename `config.json.example` to `config.json`.
   - Update the configuration file to match your server setup.

### 5. Run the bot:

```bash
node index.js
```

---

## Usage

- This bot is designed to handle operations for a **main server** and a **staff server**.
- It uses MongoDB with **Mongoose** for managing persistent data such as:
  - User activity
  - Economy balances
  - Moderation logs
- **Express** is used to handle **Top.gg vote callbacks** for server rewards.
- The music commands provide basic playback functionality but are limited compared to modern music bots.

---

## Limitations

- **Outdated Discord.js v13**: This version is no longer supported and does not work with Discord's current API. You will need to update to **Discord.js v14+** or the latest version to restore functionality.
- **Music Commands**: Due to changes in YouTube and audio libraries, music functionality may also be broken.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

If you need assistance upgrading or modernizing the bot, feel free to open an issue in the repository.

Let me know if you'd like further refinements!
