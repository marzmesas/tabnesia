# Tabnesia

![Version](https://img.shields.io/badge/version-1.1-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Chrome Manifest](https://img.shields.io/badge/manifest-v3-orange)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6?logo=typescript&logoColor=white)

Tabnesia is a Chrome extension that helps you manage your browser tabs by tracking tab usage and identifying forgotten tabs.

## Features

- **Tab Analytics**: View statistics about your open tabs, including total count, grouped tabs, and forgotten tabs.
- **Recently Inactive Tabs**: See tabs you haven't visited recently but are still within the 30-day active period.
- **Forgotten Tabs**: Identify tabs that haven't been accessed in over 30 days, helping you clean up your browser.
- **Tab Details**: View detailed information about any tab, including its URL, access time, and group membership.
- **Collapsible Sections**: Easily expand or collapse sections to focus on what matters to you.

## How It Works

Tabnesia tracks when you access your tabs and categorizes them based on their last access time:

1. **Recently Inactive Tabs**: Tabs you haven't visited recently but have been accessed within the last 30 days.
2. **Forgotten Tabs**: Tabs that haven't been accessed for more than 30 days.

The extension provides a clean, intuitive interface with statistics about your tabs and allows you to manage them more effectively.

## Installation

### Chrome Web Store (Recommended)
Install Tabnesia directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/tabnesia/eaednkmiemlfdnodjhcabecfdnjecjjd).

### Manual Installation (For Developers)
1. Clone this repository
2. Ensure the `assets/` folder contains the extension icons: `icon16.png`, `icon32.png`, `icon48.png`, `icon.png` (see `manifest.json` for paths)
3. Run `npm install` to install dependencies
4. Run `npm run build` to build the extension
5. Run `npm run prepare-dist` to prepare the distribution files
6. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## Publishing to Chrome Web Store

To create a zip for uploading to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole):

1. Build and prepare the extension:
   ```bash
   npm run build && npm run prepare-dist
   ```
2. Zip the **contents** of the `dist` folder (manifest and assets at the root of the zip):
   ```bash
   cd dist && zip -r ../tabnesia-v1.1.zip . && cd ..
   ```
3. Upload `tabnesia-v1.1.zip` in the developer dashboard. Do not commit the zip to the repo.

## Testing

- `npm test` — run the test suite once
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage report

## Development

- `src/`: Source code for the extension
- `dist/`: Built extension files
- `manifest.json`: Extension manifest file
- `src/background.ts`: Background script (TypeScript) for tracking tab access
- `src/components/`: React components for the UI
- `src/hooks/`: Custom React hooks
- `src/styles/`: CSS styles
- `src/test/`: Test setup and utilities
- `src/**/*.test.ts(x)`: Unit and component tests

## Permissions

The extension requires the following permissions:
- `tabs`: To access and manage tabs
- `tabGroups`: To access tab group information
- `history`: To check tab access history
- `storage`: To store tab access data

## Why "Tabnesia"?

Because we all forget what we opened. Tabnesia helps you remember and manage those forgotten tabs that accumulate over time.

