import { mdEscape } from './Report'
import type { Data } from './types/TReport'

export function createMarkdown({
  outputPath,
  outputRemainingPath,
  processedCount,
  remainingCount,
  requireFixCount,
  itOutputRemainingFileEncrypted,
  isInputFileOverwritten,
}: Data) {
  return `
# 📋 Final Report 📋

## 1. ✅ Exported Passwords

\`${processedCount}\` items have been exported successfully and saved to \`${outputPath}\`. 

To import them into the \`Passwords\` app:

1. Open the \`Passwords\` app.
2. Navigate to \`File\` > \`Import Password\`.
3. Follow the on-screen instructions to complete the import.

**Note:** For security reasons, please delete the exported file after importing.
**Note:** Exported data from Bitwarden does not include passkeys and file attachments.

## 2. ⚠️ Items Requiring Manual Fixes

\`${requireFixCount}\` items have multiple domains and require your attention:

1. \`Open\` the iOS \`Passwords\` app. (macOS app has a bug)
2. \`Find\` items ends with \`FIXWEBSITE\`
3. \`Add\` the corresponding website from the \`Notes\` field.

${
  outputRemainingPath
    ? `
## 3. 🚫 Remainig Items

\`${remainingCount}\` items have been saved to \`${outputRemainingPath}\`.

These items can be used for incremental exports in the future.

${isInputFileOverwritten ? '**Note:** The input file has been overwritten.' : ''} 
**Note:** Please keep this file secure. ${itOutputRemainingFileEncrypted ? 'It has been encrypted with the same password.' : 'It is **not encrypted**. Please encrypt it.'} 
`.trim()
    : ''
}

# 📊 Summary 📊

|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | ${processedCount}  |
| ✅ Exported Items Saved In      | ${mdEscape(outputPath)}      |
| ⚠ Items Requiring Manual Fixes  | ${requireFixCount} |
${
  outputRemainingPath
    ? `
| 🚫 Remainig Items                | ${remainingCount}    |
| 🚫 Remainig Items Saved In       | ${mdEscape(outputRemainingPath)}   |
`.trim()
    : ''
}

Thank you for using our CLI app! If you found it helpful, please [⭐️ star the project️️ ⭐](https://github.com/gutenye/password-manager-tools) on GitHub. If you have any questions or encounter issues, please refer to the documentation or report an issue on GitHub.
`
}
