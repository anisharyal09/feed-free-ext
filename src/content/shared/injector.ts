import type { SelectorRule } from '../../types'

const STYLE_ID = 'feed-free-style'
const AF_STYLE_ID = 'ff-antiflicker'

function buildRule(selector: string, property: string, value: string): string {
  return `${selector} { ${property}: ${value} !important; }`
}

function expandRule(rule: SelectorRule): string[] {
  return [rule.selector, ...rule.fallbacks].map((sel) =>
    buildRule(sel, rule.property, rule.value)
  )
}

export function updateStyles(
  rules: Array<{ name: string; selectors: SelectorRule[] }>,
): void {
  const css: string[] = []
  for (const { selectors } of rules) {
    for (const rule of selectors) {
      css.push(...expandRule(rule))
    }
  }

  const existingStyle = document.getElementById(STYLE_ID) as HTMLStyleElement | null

  if (css.length === 0) {
    existingStyle?.remove()
    return
  }

  const joined = css.join('\n')

  let styleEl = existingStyle ?? document.createElement('style')
  styleEl.id = STYLE_ID
  styleEl.textContent = joined
  
  if (!styleEl.parentNode) {
    document.documentElement.appendChild(styleEl)
  }
}

export function unmountAll(): void {
  const existingStyle = document.getElementById(STYLE_ID)
  existingStyle?.remove()
}

export function removeAntiflicker(): void {
  const af = document.getElementById(AF_STYLE_ID)
  af?.remove()
}
