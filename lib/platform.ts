import { Capacitor } from '@capacitor/core'

/**
 * True inside the Android app. Its WebView mis-composites a few effects, most visibly large CSS
 * blur filters and transforms inside a rounded, scrolling sheet, which show up as ghosted copies
 * of content. Screens use this to pick a filter-free rendering there.
 */
export function isAndroidApp(): boolean {
  return Capacitor.getPlatform() === 'android'
}
