# SurplusSave Tirupati

Hyper-local food waste reduction platform for Tirupati.
Tagline: "Rescue food. Feed the hungry. Zero waste."

## Features
- **Donor Flow:** Post surplus food with quantity, expiry, and location.
- **Volunteer Flow:** View available food on a live map, request pickups, and mark as completed.
- **Impact Dashboard:** Track kg rescued, meals served, and CO2 saved.
- **Demo Mode:** Safe, offline mode with pre-populated Tirupati data for presentations.

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
   - Enable **Firestore Database** and **Authentication** (Phone provider).
   - Copy your config and add it to a `.env` file (see `.env.example`).

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Demo Flow Walkthrough

1. Open the app and click **Demo OFF** in the top right corner to toggle **Demo ON**.
2. Click **I'm a Donor**. You will bypass OTP and log in as "Ramesh".
3. View the Dashboard, see your stats, and click the **+** button to post new surplus.
4. Log out (or clear localStorage), toggle Demo Mode ON again, and click **I'm a Volunteer**.
5. View the map, click a green pin, and request a pickup.
6. Go to the **Impact** tab to see the community stats.

## Telegram Bot Companion
*Note: This is a planned feature and not included in this codebase.*
A Telegram bot (`@SurplusSaveTptBot`) will be created to alert registered volunteers instantly when a new surplus is posted in their specific zone (e.g., "Balaji Nagar").
