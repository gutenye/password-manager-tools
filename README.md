# PasswordManagerTools

> Easily transfer passwords from Bitwarden to Apple Passwords

**Note: Currently, only supports transfer data from Bitwarden to Apple Passwords.**

## Features

- Comprehensive Data Preservation: transfer everything, all Bitwarden notes, custom fields, multiple URLs, and password history.
- In-Depth End Report: Receive a detailed summary highlighting items not moved and guidance for manual fixes.
- Selective Transfer: Filter passwords by URL to move only what you need.
- Incremental Transfer: Move passwords in batches at your convenience, with remaining passwords securely stored for seamless future transfers until all are moved.
- Reverse Transfer (TODO): Seamlessly transfer passwords from Apple Passwords back to Bitwarden, while accurately setting custom fields, multiple URLs, and maintaining password history to ensure data integrity.

## Getting Started

### 1) Export Data

- Bitwarden: Follow [this guide](https://bitwarden.com/help/export-your-data) to export `.json` format, support unencrypted and encrypted with password protected.

### 2) Convert Data

1. Install Bun: Follow [this guide](https://bun.sh/docs/installation)

2. Convert passwords

```sh
bunx @gutenye/password-manager-tools convert bitwarden-to-apple <input.json> <output.csv>
```

### 3) Import Data

- Apple Passwords: Follow [this guide](https://support.apple.com/guide/passwords/import-mchl2f1a184c/1.0/mac) to import `.csv` file

### Special thanks

- [warden](https://github.com/thewh1teagle/warden): offline bitwarden viewer
