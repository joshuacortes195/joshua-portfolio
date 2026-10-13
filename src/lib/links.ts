// lets a link from the content files or from github through only when it's a full https address
export function safeLink(url?: string | null) {
  return url?.startsWith('https://') ? url : undefined
}
