// Watches for SPA navigations using MutationObserver.
// We use a strict URL check to prevent infinite loops when our
// own injector modifies <style> elements.
export class DOMPatron {
  private lastUrl: string
  private onNav: (() => void) | null = null
  private observer: MutationObserver | null = null

  constructor(onNav?: () => void) {
    this.lastUrl = location.href
    this.onNav = onNav ?? null
  }

  // Begin watching for URL changes via DOM mutations
  start(): void {
    if (this.observer) return
    this.observer = new MutationObserver(() => {
      if (location.href !== this.lastUrl) {
        this.lastUrl = location.href
        this.onNav?.()
      }
    })
    
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}
