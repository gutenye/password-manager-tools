# PasswordManagerTools

> Easily transfer passwords from one password manager to another, including Bitwarden, Apple Passwords/iCloud Keychain.

**Note: Currently, only supports transfer data from Bitwarden to Apple Passwords.**

## Features

- Comprehensive Data Preservation: transfer everything, all Bitwarden notes, custom fields, multiple URLs, and password history.
- Selective Transfer (TODO): Filter passwords by name or URL to move only what you need.
- Incremental Transfer (TODO): Move passwords in batches at your convenience, with remaining passwords securely stored for seamless future transfers until all are moved.
- Reverse Transfer (TODO): Seamlessly transfer passwords from Apple Passwords back to Bitwarden, while accurately setting custom fields, multiple URLs, and maintaining password history to ensure data integrity.
- In-Depth End Report (TODO): Receive a detailed summary highlighting items not moved and guidance for manual fixes.

## Getting Started

### 1) Export Data

- [Bitwarden](https://bitwarden.com/help/export-your-data): export `.json` file

- BitWarden export does not contain file attachments.

### 2) Convert Data

- [Install Bun](https://bun.sh/docs/installation)

```sh
bunx @gutenye/password-manager-tools convert bitwarden-to-apple <input.json> <output.csv>
```

### 3) Import Data

- [Apple Passwords](https://support.apple.com/guide/passwords/import-mchl2f1a184c/1.0/mac): import `.csv` file

- Multiple websites with same domain are handled correctly, with differnt domains, open the Apple Passwords app to edit it manually.
