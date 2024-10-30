import { expect, it } from 'bun:test'
import { initialReport } from '#/cli/report'
import { createMarkdown } from '../createMarkdown'

const props = {
  ...initialReport,
  processedCount: 1,
  requireFixCount: 2,
  afterImportedCheckCount: 3,
  remainingCount: 4,
  outputPath: 'output.csv',
  remainingPath: 'remaining.json',
  afterImportedCheckPath: 'output-check-after-import.csv',
  isRemainingFileEncrypted: true,
  isInputFileOverwritten: true,
}

it('works', () => {
  expect(createMarkdown(props)).toEqual(
    `
# 📋 Final Report 📋

## 1. ✅ Exported Passwords

\`1\` items have been exported successfully and saved to \`output.csv\`. 

To import them into the \`Passwords\` app:

1. Open the \`Passwords\` app.
2. Navigate to \`File\` > \`Import Password\`.
3. Follow the on-screen instructions to complete the import.

**Note:** For security reasons, please delete the exported file after importing.
**Note:** Exported data from Bitwarden does not include passkeys and file attachments.

## 2. ⚠️ Items Requiring Manual Fixes

\`2\` items have multiple domains and require your attention:

1. \`Open\` the iOS \`Passwords\` app. (macOS app has a bug)
2. \`Find\` items ends with \`FIXWEBSITE\`
3. \`Add\` the corresponding website from the \`Notes\` field.

## 3. ⚠️ Items Requiring Checking After Import

\`3\` items lack a username but contain a password and website that require your attention. These items are already present in the \`output.csv\` file. After you import, the \`Apple Passwords\` app indicates they have been successfully imported, but they may not have been updated.

1. \`Check\` each item in the \`output-check-after-import.csv\` file.
2. \`Compare\` each item with the corresponding entry in the \`Apple Passwords\` app.
3. Verify if they are identical; if not, \`Update\` the item in the app.

## 4. 🚫 Remaining Items

\`4\` remaining items have been saved to \`remaining.json\`.

These items can be used for incremental exports in the future.

**Note:** The input file has been overwritten. 
**Note:** Please keep this file secure. It has been encrypted with the same password.

# 📊 Summary 📊

|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | 1  |
| ✅ Exported Items Saved In      | output.csv      |
| ⚠ Requiring Manual Fixes Items  | 2 |
| ⚠ Requiring Manual Fixes Items Saved In  | output.csv  |
| ⚠ After Imported Check Items  | 3 |
| ⚠ After Imported Check Items Saved In | output-check-after-import.csv |
| 🚫 Remaining Items                | 4    |
| 🚫 Remaining Items Saved In       | remaining.json   |

Thank you for using our CLI app! If you found it helpful, please [⭐️ star the project️️ ⭐](https://github.com/gutenye/password-manager-tools) on GitHub. If you have any questions or encounter issues, please refer to the documentation or report an issue on GitHub.
	`.trim(),
  )
})

it('exported items', () => {
  expect(
    createMarkdown({
      ...props,
      processedCount: 1,
      requireFixCount: 0,
      afterImportedCheckCount: 0,
      remainingCount: 0,
    }),
  ).toMatch(`
|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | 1  |
| ✅ Exported Items Saved In      | output.csv      |

`)
})

it('requiring manual fixes items', () => {
  expect(
    createMarkdown({
      ...props,
      processedCount: 1,
      requireFixCount: 2,
      afterImportedCheckCount: 0,
      remainingCount: 0,
    }),
  ).toMatch(`
|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | 1  |
| ✅ Exported Items Saved In      | output.csv      |
| ⚠ Requiring Manual Fixes Items  | 2 |
| ⚠ Requiring Manual Fixes Items Saved In  | output.csv  |

`)
})

it('after imported check items', () => {
  expect(
    createMarkdown({
      ...props,
      processedCount: 1,
      requireFixCount: 0,
      afterImportedCheckCount: 3,
      remainingCount: 0,
    }),
  ).toMatch(`
|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | 1  |
| ✅ Exported Items Saved In      | output.csv      |
| ⚠ After Imported Check Items  | 3 |
| ⚠ After Imported Check Items Saved In | output-check-after-import.csv |

`)
})

it('remaining items', () => {
  expect(
    createMarkdown({
      ...props,
      processedCount: 1,
      requireFixCount: 0,
      afterImportedCheckCount: 0,
      remainingCount: 4,
    }),
  ).toMatch(`
|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | 1  |
| ✅ Exported Items Saved In      | output.csv      |
| 🚫 Remaining Items                | 4    |
| 🚫 Remaining Items Saved In       | remaining.json   |

`)
})
