# Order Bot

> A custom-designed Discord bot tailored for EZDestinyBoost.

- [Features](#features)
- [Commands List](#commands-list)

## About

### Features

- Polished order-management system using reactions to swiftly process submitted order tickets
- Colour-coded order tickets for quick identification and easy organisation
- Automatically updating master list of all orders across all vendors, categorised into active, completed and deleted orders
	> All master tickets have an automatically updating hyperlink to the actionable order ticket in the vendor's private channel
- Automatically processes new or re-joining vendors, creating a private category kept updated with their current Discord Username#Discriminator, which each have their own set of private order channels
- Automatically sets up new servers the bot is added to, adding all roles and emojis necessary for the bot's function, alongside automatically creating all master and instruction channels
- Permissions-based reactions system, allowing vendors access to specific vendor actions only
- A comprehensive back-end database, allowing for advanced statistics and analytics
- Non-sequential order ID generation for public order labels, while maintaining a private back-end sequential serial of the order for both the individual vendor and the server as a whole
- Supports commenting and amending previously submitted orders, allowing for orders with problems to be corrected after submission
- Robust order archive system, listening for both intentional and accidental order deletions
- Supports multi-server operation, supporting unique configurations and settings for all individual servers
- Allows 'tagging' of order tickets with an order cost
- `!earnings` and `!paid` commands to significantly streamline tracking of inbound payments and outstanding balances
- Already in-place frameworks and handlers for commands and database querying, allowing for easy future development
- Dynamic command permissions system, allowing for commands to be white/blacklisted based on Roles or even specific users
- Fully-featured command help and error responses for ease of use
- Command listener on message edits to maximise efficiency

### Commands List

| Command           | Description                                                  | Default Permissions                                             |
| ----------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `!ping`           | Test the latency of the bot                                  | All                                                             |
| `!uptime`         | Time since last restart                                      | All                                                             |
| `!evaluate`       | Evaluate Javascript code                                     | Developer                                                       |
| `!restart`        | Restart the bot                                              | Developer                                                       |
| `!help`           | Get help with using Order Bot                                | All                                                             |
| `!help [command]` | Get help with a specific command                             | All (user must have permissions to use the sub-command however) |
| `!earnings`       | Calculate earnings from orders completed within a date range | Non-Vendors                                                     |
| `!paid`           | Calculate or update outstanding balances                     | Non-Vendors                                                     |