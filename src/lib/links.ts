// lets a link from the content files or from github through only when it's a full https address with no login tucked into it
export function safeLink(url?: string | null) {
  // anything that isn't text is dropped too
  if (typeof url !== 'string' || !url.startsWith('https://')) return undefined
  try {
    const parsed = new URL(url)
    return parsed.username || parsed.password ? undefined : url
  } catch {
    return undefined
  }
}

// lets a path from the content files through only when it's a plain file on this site, like /resume.pdf
// every part has to start with a letter, number, dash or underscore, so no "//", no "..", and no backslashes
export function sitePath(path?: string | null) {
  return typeof path === 'string' && /^(\/[A-Za-z0-9_-][A-Za-z0-9._-]*)+$/.test(path) ? path : undefined
}
