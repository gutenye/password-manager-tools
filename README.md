# PasswordManagerTools

> Easily transfer passwords from one password manager to another, including Bitwarden, Apple Passwords/iCloud Keychain.

**Note: Currently, only supports transfer data from Bitwarden to Apple Passwords.**

## Features

- Comprehensive Data Preservation: transfer everything, all Bitwarden notes, custom fields, multiple URLs, and password history.
- Selective Transfer: Filter passwords by URL to move only what you need.
- Incremental Transfer: Move passwords in batches at your convenience, with remaining passwords securely stored for seamless future transfers until all are moved.
- Reverse Transfer (TODO): Seamlessly transfer passwords from Apple Passwords back to Bitwarden, while accurately setting custom fields, multiple URLs, and maintaining password history to ensure data integrity.
- In-Depth End Report (TODO): Receive a detailed summary highlighting items not moved and guidance for manual fixes.

## Getting Started

### 1) Export Data

- [Bitwarden](https://bitwarden.com/help/export-your-data): export `.json` file

- BitWarden export does not contain file attachments.

### 2) Convert Data

- [Install Bun](https://bun.sh/docs/installation)

#### One time Transfer

```sh
bunx @gutenye/password-manager-tools convert bitwarden-to-apple <input.json> <output.csv>
```

#### Incremental Transfer

```sh
cp input.json input.json.bak  # backup orignal file, will be overwritten later
bunx @gutenye/password-manager-tools encrypt input.json # encrypte the file, to be used in the future
bunx @gutenye/password-manager-tools convert bitwarden-to-apple input.json output.csv --include-uris a.com,b.com
#-> creates output.csv
#-> override input.json, items with url contains a.com or b.com are removed
```

  --include-uris a.com,b.com # Selective Transfer

### 3) Import Data

- [Apple Passwords](https://support.apple.com/guide/passwords/import-mchl2f1a184c/1.0/mac): import `.csv` file

- Multiple websites with same domain are handled correctly, with differnt domains, open the Apple Passwords app to edit it manually.
