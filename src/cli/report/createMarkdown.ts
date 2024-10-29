import { mdEscape } from './Report'
import type { Data } from './types/TReport'

const DISBALE_MARKDOWN = false // for console.log
// const DISBALE_MARKDOWN = true

export function createMarkdown({
  outputPath,
  remainingCount,
  remainingPath,
  afterImportedCheckPath,
  afterImportedCheckCount,
  processedCount,
  requireFixCount,
  isRemainingFileEncrypted,
  isInputFileOverwritten,
}: Data) {
  if (DISBALE_MARKDOWN) {
    return ''
  }

  let index = 1

  let report = `
# 📋 Final Report 📋

## ${index++}. ✅ Exported Passwords

\`${processedCount}\` items have been exported successfully and saved to \`${outputPath}\`. 

To import them into the \`Passwords\` app:

1. Open the \`Passwords\` app.
2. Navigate to \`File\` > \`Import Password\`.
3. Follow the on-screen instructions to complete the import.

**Note:** For security reasons, please delete the exported file after importing.
**Note:** Exported data from Bitwarden does not include passkeys and file attachments.
  `.trimEnd()

  let summaryTable = `
|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | ${processedCount}  |
| ✅ Exported Items Saved In      | ${mdEscape(outputPath)}      |
  `.trimEnd()

  if (requireFixCount > 0) {
    report += `
## ${index++}. ⚠️ Items Requiring Manual Fixes

\`${requireFixCount}\` items have multiple domains and require your attention:

1. \`Open\` the iOS \`Passwords\` app. (macOS app has a bug)
2. \`Find\` items ends with \`FIXWEBSITE\`
3. \`Add\` the corresponding website from the \`Notes\` field.
    `.trimEnd()

    summaryTable += `
| ⚠ Requiring Manual Fixes Items  | ${requireFixCount} |
| ⚠ Requiring Manual Fixes Items Saved In  | ${outputPath}  |
    `.trimEnd()
  }

  if (afterImportedCheckCount > 0) {
    report += `
## ${index++}. ⚠️ Items Requiring Checking After Import

\`${afterImportedCheckCount}\` items lack a username but contain a password and website that require your attention. These items are already present in the \`${outputPath}\` file. After you import, the \`Apple Passwords\` app indicates they have been successfully imported, but they may not have been updated.

1. \`Check\` each item in the \`${afterImportedCheckPath}\` file.
2. \`Compare\` each item with the corresponding entry in the \`Apple Passwords\` app.
3. Verify if they are identical; if not, \`Update\` the item in the app.
    `.trimEnd()

    summaryTable += `
| ⚠ After Imported Check Items  | ${afterImportedCheckCount} |
| ⚠ After Imported Check Items Saved In | ${afterImportedCheckPath} |
    `.trimEnd()
  }

  if (remainingCount > 0) {
    report += `
## ${index++}. 🚫 Remainig Items

${
  remainingPath
    ? `
\`${remainingCount}\` remaining items have been saved to \`${remainingPath}\`.`
    : `\`${remainingCount}\` remaining items has not been saved, use \`--output-remaining\` option to save them.`
}

These items can be used for incremental exports in the future.

${isInputFileOverwritten ? '**Note:** The input file has been overwritten.' : ''} 
**Note:** Please keep this file secure. ${isRemainingFileEncrypted ? 'It has been encrypted with the same password.' : 'It is **not encrypted**. Please encrypt it.'} 
    `.trimEnd()

    summaryTable += `
| 🚫 Remaining Items                | ${remainingCount}    |
| 🚫 Remaining Items Saved In       | ${mdEscape(remainingPath || '(not saved)')}   |
    `.trimEnd()
  }

  return `
${report}

# 📊 Summary 📊

${summaryTable}

Thank you for using our CLI app! If you found it helpful, please [⭐️ star the project️️ ⭐](https://github.com/gutenye/password-manager-tools) on GitHub. If you have any questions or encounter issues, please refer to the documentation or report an issue on GitHub.
  `.trimEnd()
}
