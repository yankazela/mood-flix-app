import { Capacitor } from '@capacitor/core'
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition'

/**
 * Speech to text behind one interface. In the browser it is the Web Speech API (Chrome, Edge,
 * Safari); inside the apps, where neither WebView exposes it, it is the platform recogniser
 * through the Capacitor plugin. Either way the caller gets the running transcript and an end signal.
 */

export interface SpeechHandlers {
  /** The whole transcript so far, interim words included. */
  onTranscript: (text: string) => void
  /** Listening stopped: by request, by silence, or because the recogniser gave up. */
  onEnd: () => void
  onError: (message: string) => void
}

export interface SpeechSession {
  stop: () => Promise<void>
}

export interface SpeechRecognizer {
  isSupported: () => Promise<boolean>
  /** Asks for permission when needed, then listens until stop() or the recogniser ends on its own. */
  start: (language: string, handlers: SpeechHandlers) => Promise<SpeechSession>
}

/** The person said no to the microphone or speech permission. */
export class SpeechPermissionError extends Error {
  constructor() {
    super('Microphone access was turned down. Allow it in your device settings to speak your mood.')
    this.name = 'SpeechPermissionError'
  }
}

export function createRecognizer(): SpeechRecognizer {
  return Capacitor.isNativePlatform() ? nativeRecognizer : webRecognizer
}

// ---------------------------------------------------------------------------
// Apps: the platform recogniser via @capgo/capacitor-speech-recognition (ships Swift Package Manager support)
// ---------------------------------------------------------------------------

const nativeRecognizer: SpeechRecognizer = {
  async isSupported() {
    try {
      return (await SpeechRecognition.available()).available
    } catch {
      return false
    }
  },

  async start(language, handlers) {
    let permission = await SpeechRecognition.checkPermissions()
    if (permission.speechRecognition !== 'granted') permission = await SpeechRecognition.requestPermissions()
    if (permission.speechRecognition !== 'granted') throw new SpeechPermissionError()

    await SpeechRecognition.removeAllListeners()
    let ended = false
    const end = () => {
      if (ended) return
      ended = true
      void SpeechRecognition.removeAllListeners()
      handlers.onEnd()
    }
    // Partial results carry the whole utterance so far, so the latest one is always the text to show.
    await SpeechRecognition.addListener('partialResults', (event) => {
      const text = event.accumulated ?? event.accumulatedText ?? event.matches?.[0]
      if (text !== undefined) handlers.onTranscript(text)
    })
    await SpeechRecognition.addListener('listeningState', (event) => {
      if (event.status === 'stopped' || event.state === 'stopped') end()
    })
    await SpeechRecognition.addListener('error', (event) => {
      handlers.onError(speechErrorMessage(event.message))
    })

    SpeechRecognition.start({ language, partialResults: true, popup: false, maxResults: 1, addPunctuation: true })
      .then((result) => {
        if (result?.matches?.[0]) handlers.onTranscript(result.matches[0])
        end()
      })
      .catch((error: unknown) => {
        handlers.onError(speechErrorMessage(error))
        end()
      })

    return {
      stop: async () => {
        try {
          await SpeechRecognition.stop()
        } finally {
          end()
        }
      },
    }
  },
}

// ---------------------------------------------------------------------------
// Browser: the Web Speech API
// ---------------------------------------------------------------------------

interface WebRecognitionEvent {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

interface WebRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: WebRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function webRecognitionConstructor(): (new () => WebRecognition) | undefined {
  if (typeof window === 'undefined') return undefined
  const scope = window as unknown as { SpeechRecognition?: new () => WebRecognition; webkitSpeechRecognition?: new () => WebRecognition }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition
}

const webRecognizer: SpeechRecognizer = {
  async isSupported() {
    return Boolean(webRecognitionConstructor())
  },

  async start(language, handlers) {
    const Recognition = webRecognitionConstructor()
    if (!Recognition) throw new Error('Voice input is not available in this browser.')

    const recognition = new Recognition()
    recognition.lang = language
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalText = ''
    let ended = false
    const end = () => {
      if (ended) return
      ended = true
      handlers.onEnd()
    }

    recognition.onresult = (event) => {
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) finalText += result[0].transcript
        else interim += result[0].transcript
      }
      handlers.onTranscript(`${finalText}${interim}`.replace(/\s+/g, ' ').trim())
    }
    recognition.onerror = (event) => {
      // Silence and an aborted session are normal ends, not failures.
      if (event.error === 'no-speech' || event.error === 'aborted') return
      handlers.onError(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? new SpeechPermissionError().message : speechErrorMessage(event.error))
    }
    recognition.onend = end
    recognition.start()

    return {
      stop: async () => {
        recognition.stop()
      },
    }
  },
}

function speechErrorMessage(error: unknown): string {
  const text = typeof error === 'string' ? error : ((error as { message?: unknown } | null)?.message as string | undefined)
  if (text && /network/i.test(text)) return 'Voice input needs a connection. Check yours and try again.'
  return 'We couldn’t hear you. Please try again.'
}
