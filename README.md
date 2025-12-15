# Bolt Gameserver Sample

⚠️ **Note:** We will be updating this repo with a fully featured demo in the very near future. If you would like early access please let our team know.

<img src="https://github.com/BoltApp/bolt-gameserver-sample/blob/main/public/banner-gameserver.svg?raw=true" alt="Bolt Charge Hero" />

## Description

Sample backend code snippets to demonstrate how to integrate Bolt's SDK into your game server.

## What You Will Find

This project showcases an example backend with the following flows implemented

- **Payment Links:** Creating links that take user to checkout
- **Validate Order:** Validating a transaction was successful for a specific user
- **Transaction Webhooks:** Handling webhooks on transaction success as users make purchases in your game

## API Keys

Bolt uses API keys to authenticate your requests. You can manage your API keys in the Bold Dashboard.

- [Sandbox Dashboard](https://merchant-sandbox.bolt.com/)
- [Production Dashboard](https://merchant.bolt.com/)

## Quick Start

When you are ready to implement Bolt into your gaming SDK make sure to follow along using the Installation Guide.

**Installation Guide:** Our [Quickstart](https://gaming-help.bolt.com/guide/quickstart.html) guide will walk you through the full gaming setup.

### Development Environment

This project includes a Tilt configuration for easy local development. You have two options to start the development environment:

**Setup:**
```
cp client/.env.local.sample client/.env.local
cp client/.env.staging.sample client/.env.staging

cp server/.env.local.sample server/.env.local
cp server/.env.staging.sample server/.env.staging
```

**Using script (uses Tilt):**

```bash
./start-dev.sh
```

The `start-dev.sh` script provides additional features:

- Automatic ngrok hostname configuration based on your `BL_DOMAIN` environment variable
- Support for custom ngrok hostnames (requires reserved domain in ngrok dashboard)
- Proper environment variable setup for the Tilt environment

Both options will start the backend server, frontend client, and ngrok tunnel for external access.

## Onboarding

**Merchant Dashboard:** Make sure you have fully onboarded onto our Bolt Gaming sandbox. You can [sign up](https://merchant-sandbox.bolt.com/onboarding/get-started/gaming) or [sign in](https://merchant-sandbox.bolt.com/) depending if you have an existing merchant account or not.

## Support

**Language Support:** Looking for a different language or a particular server SDK? You can easily clone, copy, or paste URL this lightweight repo into your favorite copilot tool and it should do a good job replicating the interfaces for you.

**Bolt Support:** If you have questions or need additional support please reach out to us in our [discord server](https://discord.gg/BSUp9qjtnc) and we would be happy to assist!
