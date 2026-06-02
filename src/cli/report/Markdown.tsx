import { Text } from 'ink'
import { Marked } from 'marked'
// @ts-expect-error marked-terminal v6 ships no type declarations for this export
import { markedTerminal } from 'marked-terminal'

// Renders markdown to ANSI text inside an Ink <Text>. Replaces `ink-markdown`,
// which is incompatible with `ink@5` (it `require()`s the ESM-only `ink`).
export const Markdown = ({ children, ...options }: Props) => {
  const marked = new Marked(markedTerminal(options))
  return (
    <Text>{(marked.parse(children, { async: false }) as string).trim()}</Text>
  )
}

type Props = {
  children: string
  strong?: (text: string) => string
}
