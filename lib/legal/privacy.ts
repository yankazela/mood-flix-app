import type { LegalDocument } from '@/lib/legal/types'
import type { Locale } from '@/lib/i18n'

/**
 * Privacy Policy. Written from what the code actually collects and who processes it; review it with
 * a lawyer before release. Tokens: {operator}, {contact}, {updated}, {jurisdiction}.
 */
export const PRIVACY: Record<Locale, LegalDocument> = {
  en: {
    title: 'Privacy Policy',
    intro:
      'This policy explains what UpMyMood collects when you use the app or website, why, who helps us process it, and the choices you have. UpMyMood is operated by {operator} ("we", "us").',
    sections: [
      {
        heading: 'What we collect',
        bullets: [
          'Account details: your email address and name, and, if you sign in with Google, the basic profile Google shares (name, email, picture).',
          'Your preferences: country, streaming services, favourite genres and the maximum content rating you choose.',
          'Your requests: the words you type or dictate to describe your mood, the moods and filters you pick, how our model interpreted them, the titles we suggested, the title you chose and any feedback you give.',
          'Your library: titles you save, like, dislike, rate or mark as watched.',
          'Subscription status: whether you are on the Free or Advanced plan, when it renews or ends, and the store it was bought from. We never receive your card or bank details.',
          'Usage counters: how many recommendations you requested today, to apply your plan’s daily limit.',
          'Technical data: the language of your device or browser, and the server logs every request leaves (time, address, errors), used for security and fixing faults.',
        ],
      },
      {
        heading: 'Voice input',
        paragraphs: [
          'If you use the microphone, your speech is turned into text by your device or browser: Apple’s speech service on iPhone, Google’s on Android, and the browser’s own service on the web (Chrome sends audio to Google, Safari to Apple). Their privacy terms apply to that step. We never receive or store the audio, only the resulting text, which is treated like a typed request. The app asks for microphone permission first, and you can withdraw it at any time in your device settings.',
        ],
      },
      {
        heading: 'How we use it',
        bullets: [
          'To recommend titles that suit your mood and are available on your services in your country.',
          'To learn your taste from your library and feedback, so recommendations improve over time.',
          'To run your account, apply your plan and its daily limit, and restore purchases.',
          'To keep the service secure, prevent abuse and fix problems.',
        ],
        paragraphs: ['We do not sell your personal data, show advertising, or use your data for advertising profiles.'],
      },
      {
        heading: 'Artificial intelligence',
        paragraphs: [
          'Your request text and selected moods are sent to AI models hosted on Amazon Bedrock (Anthropic Claude to understand your mood and explain suggestions, Amazon Titan to compare it with our catalogue). Under Amazon’s terms, these inputs are not used to train the models. The output is used only to produce your recommendations and is kept with the request in your history.',
          'If something you write suggests you may be in distress, the app may show a supportive message instead of recommendations. It is not a medical or crisis service.',
        ],
      },
      {
        heading: 'Legal bases',
        paragraphs: [
          'Where data protection law requires a legal basis (for example the GDPR, the UK GDPR or POPIA), we rely on: performing our contract with you to provide the service; our legitimate interest in keeping it secure and improving recommendations; and your consent for the microphone, which you can withdraw at any time.',
        ],
      },
      {
        heading: 'Who processes your data',
        paragraphs: ['We use these service providers, each bound to use the data only to provide their service to us:'],
        bullets: [
          'Amazon Web Services: hosting, databases, sign-in (Amazon Cognito) and AI models (Amazon Bedrock).',
          'Google: sign-in with Google, if you choose it; speech recognition on Android and in Chrome.',
          'Apple: speech recognition on iPhone and in Safari; App Store payments.',
          'Google Play: payments on Android.',
          'RevenueCat: manages subscription status across stores, linked to your account by an internal identifier, not your email.',
          'Vercel: privacy-friendly page analytics on the website, without cookies or cross-site tracking.',
          'TMDB (The Movie Database): source of title information and artwork. We do not send your personal data to TMDB.',
        ],
      },
      {
        heading: 'Where your data is stored',
        paragraphs: [
          'Our servers are in the United States (AWS, us-east-1). If you live elsewhere, your data is transferred there with the safeguards data protection law requires, such as standard contractual clauses.',
        ],
      },
      {
        heading: 'How long we keep it',
        bullets: [
          'Your requests and their results: 90 days, then deleted automatically.',
          'Your account, preferences and library: until you delete your account.',
          'Server logs: a limited period for security, then deleted.',
          'Purchase records kept by Apple, Google and RevenueCat: as required by their terms and tax law.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'Depending on where you live, you can ask to access your data, correct it, delete it, receive a copy in a portable format, object to or restrict certain processing, and withdraw consent. You can change your preferences and library directly in the app. To delete your account or make any other request, contact us at {contact}; we answer within the time the law requires, usually one month. You can also complain to your data protection authority.',
          'Deleting your account does not cancel a subscription bought through Apple or Google; cancel it in your store’s subscription settings.',
        ],
      },
      {
        heading: 'Data on your device',
        paragraphs: [
          'The app stores your session, language and a few display preferences on your device (local storage) so you stay signed in. These are not advertising cookies and are not shared with third parties. Signing out removes the session.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'UpMyMood is not intended for children under 13, or under the age of digital consent where you live. We do not knowingly collect their data; if you believe a child has created an account, contact us and we will delete it.',
        ],
      },
      {
        heading: 'Security',
        paragraphs: [
          'Data is encrypted in transit and at rest, access to it is limited, and passwords are handled by Amazon Cognito and never stored by us. No system is perfectly secure, so we also keep what we collect to what the service needs.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: ['We will update this page when our practices change and tell you in the app about significant changes. The date at the top shows the current version.'],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions or requests about your data: {contact}.'],
      },
    ],
  },

  fr: {
    title: 'Politique de confidentialité',
    intro:
      'Cette politique explique ce qu’UpMyMood collecte lorsque vous utilisez l’application ou le site, pourquoi, qui nous aide à le traiter et quels choix vous avez. UpMyMood est exploité par {operator} (« nous »).',
    sections: [
      {
        heading: 'Ce que nous collectons',
        bullets: [
          'Données de compte : votre adresse e-mail et votre nom, et, si vous vous connectez avec Google, le profil de base que Google partage (nom, e-mail, photo).',
          'Vos préférences : pays, services de streaming, genres favoris et classification maximale choisie.',
          'Vos demandes : les mots que vous écrivez ou dictez pour décrire votre humeur, les humeurs et filtres choisis, l’interprétation de notre modèle, les titres suggérés, le titre choisi et vos avis.',
          'Votre bibliothèque : les titres gardés, aimés, non aimés, notés ou marqués comme vus.',
          'Statut d’abonnement : formule Gratuite ou Advanced, date de renouvellement ou de fin, et store d’achat. Nous ne recevons jamais vos coordonnées bancaires.',
          'Compteurs d’utilisation : le nombre de recommandations demandées aujourd’hui, pour appliquer la limite quotidienne de votre formule.',
          'Données techniques : la langue de votre appareil ou navigateur, et les journaux serveur laissés par chaque requête (heure, adresse, erreurs), utilisés pour la sécurité et la correction d’erreurs.',
        ],
      },
      {
        heading: 'Saisie vocale',
        paragraphs: [
          'Si vous utilisez le micro, votre voix est transformée en texte par votre appareil ou navigateur : le service vocal d’Apple sur iPhone, celui de Google sur Android, et celui du navigateur sur le web (Chrome envoie l’audio à Google, Safari à Apple). Leurs conditions de confidentialité s’appliquent à cette étape. Nous ne recevons ni ne conservons jamais l’audio, seulement le texte obtenu, traité comme une demande écrite. L’app demande d’abord l’autorisation du micro, que vous pouvez retirer à tout moment dans les réglages.',
        ],
      },
      {
        heading: 'Comment nous les utilisons',
        bullets: [
          'Pour recommander des titres adaptés à votre humeur et disponibles sur vos services dans votre pays.',
          'Pour apprendre vos goûts à partir de votre bibliothèque et de vos avis, afin d’améliorer les recommandations.',
          'Pour gérer votre compte, appliquer votre formule et sa limite quotidienne, et restaurer vos achats.',
          'Pour sécuriser le service, prévenir les abus et corriger les problèmes.',
        ],
        paragraphs: ['Nous ne vendons pas vos données, n’affichons pas de publicité et ne les utilisons pas pour du profilage publicitaire.'],
      },
      {
        heading: 'Intelligence artificielle',
        paragraphs: [
          'Le texte de vos demandes et les humeurs choisies sont envoyés à des modèles d’IA hébergés sur Amazon Bedrock (Anthropic Claude pour comprendre votre humeur et expliquer les suggestions, Amazon Titan pour la comparer à notre catalogue). Selon les conditions d’Amazon, ces données ne servent pas à entraîner les modèles. Le résultat sert uniquement à produire vos recommandations et est conservé avec la demande dans votre historique.',
          'Si vos mots laissent penser que vous traversez un moment difficile, l’app peut afficher un message de soutien au lieu de recommandations. Ce n’est pas un service médical ou d’urgence.',
        ],
      },
      {
        heading: 'Bases légales',
        paragraphs: [
          'Lorsque la loi l’exige (par exemple le RGPD, le UK GDPR ou la POPIA), nous nous appuyons sur : l’exécution de notre contrat avec vous pour fournir le service ; notre intérêt légitime à le sécuriser et à améliorer les recommandations ; et votre consentement pour le micro, que vous pouvez retirer à tout moment.',
        ],
      },
      {
        heading: 'Qui traite vos données',
        paragraphs: ['Nous faisons appel à ces prestataires, chacun tenu de n’utiliser les données que pour nous fournir son service :'],
        bullets: [
          'Amazon Web Services : hébergement, bases de données, connexion (Amazon Cognito) et modèles d’IA (Amazon Bedrock).',
          'Google : connexion avec Google si vous la choisissez ; reconnaissance vocale sur Android et dans Chrome.',
          'Apple : reconnaissance vocale sur iPhone et dans Safari ; paiements App Store.',
          'Google Play : paiements sur Android.',
          'RevenueCat : gère le statut d’abonnement entre stores, rattaché à votre compte par un identifiant interne, pas votre e-mail.',
          'Vercel : statistiques de pages respectueuses de la vie privée sur le site, sans cookies ni suivi intersites.',
          'TMDB (The Movie Database) : source des informations et visuels des titres. Nous ne transmettons pas vos données personnelles à TMDB.',
        ],
      },
      {
        heading: 'Où vos données sont stockées',
        paragraphs: [
          'Nos serveurs sont aux États-Unis (AWS, us-east-1). Si vous résidez ailleurs, vos données y sont transférées avec les garanties exigées par la loi, comme les clauses contractuelles types.',
        ],
      },
      {
        heading: 'Durée de conservation',
        bullets: [
          'Vos demandes et leurs résultats : 90 jours, puis suppression automatique.',
          'Votre compte, vos préférences et votre bibliothèque : jusqu’à la suppression du compte.',
          'Journaux serveur : une durée limitée pour la sécurité, puis suppression.',
          'Justificatifs d’achat conservés par Apple, Google et RevenueCat : selon leurs conditions et le droit fiscal.',
        ],
      },
      {
        heading: 'Vos droits',
        paragraphs: [
          'Selon votre lieu de résidence, vous pouvez demander l’accès à vos données, leur rectification, leur suppression, une copie dans un format portable, vous opposer à certains traitements ou les limiter, et retirer votre consentement. Vous pouvez modifier vos préférences et votre bibliothèque directement dans l’app. Pour supprimer votre compte ou toute autre demande, écrivez-nous à {contact} ; nous répondons dans le délai légal, généralement un mois. Vous pouvez aussi saisir votre autorité de protection des données (en France, la CNIL).',
          'Supprimer votre compte n’annule pas un abonnement acheté via Apple ou Google ; annulez-le dans les réglages d’abonnement de votre store.',
        ],
      },
      {
        heading: 'Données sur votre appareil',
        paragraphs: [
          'L’app enregistre votre session, votre langue et quelques préférences d’affichage sur votre appareil (stockage local) pour que vous restiez connecté. Ce ne sont pas des cookies publicitaires et ils ne sont pas partagés. La déconnexion supprime la session.',
        ],
      },
      {
        heading: 'Enfants',
        paragraphs: [
          'UpMyMood ne s’adresse pas aux enfants de moins de 13 ans, ni à ceux qui n’ont pas l’âge du consentement numérique dans leur pays (15 ans en France). Nous ne collectons pas sciemment leurs données ; si vous pensez qu’un enfant a créé un compte, contactez-nous et nous le supprimerons.',
        ],
      },
      {
        heading: 'Sécurité',
        paragraphs: [
          'Les données sont chiffrées en transit et au repos, leur accès est limité, et les mots de passe sont gérés par Amazon Cognito, jamais stockés par nous. Aucun système n’est parfaitement sûr ; c’est pourquoi nous ne collectons que ce dont le service a besoin.',
        ],
      },
      {
        heading: 'Modifications',
        paragraphs: ['Nous mettrons cette page à jour si nos pratiques changent et vous informerons dans l’app des changements importants. La date en haut indique la version en vigueur.'],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions ou demandes concernant vos données : {contact}.'],
      },
    ],
  },

  es: {
    title: 'Política de privacidad',
    intro:
      'Esta política explica qué recopila UpMyMood cuando usas la app o la web, para qué, quién nos ayuda a tratarlo y qué opciones tienes. UpMyMood está gestionado por {operator} («nosotros»).',
    sections: [
      {
        heading: 'Qué recopilamos',
        bullets: [
          'Datos de la cuenta: tu correo electrónico y tu nombre y, si inicias sesión con Google, el perfil básico que comparte Google (nombre, correo, foto).',
          'Tus preferencias: país, servicios de streaming, géneros favoritos y la clasificación máxima que elijas.',
          'Tus peticiones: las palabras que escribes o dictas para describir tu ánimo, los estados de ánimo y filtros elegidos, cómo los interpretó nuestro modelo, los títulos sugeridos, el que elegiste y tu valoración.',
          'Tu biblioteca: títulos que guardas, te gustan, no te gustan, valoras o marcas como vistos.',
          'Estado de la suscripción: plan Gratis o Advanced, cuándo se renueva o termina y en qué tienda se compró. Nunca recibimos los datos de tu tarjeta o cuenta bancaria.',
          'Contadores de uso: cuántas recomendaciones has pedido hoy, para aplicar el límite diario de tu plan.',
          'Datos técnicos: el idioma de tu dispositivo o navegador y los registros que deja cada petición en el servidor (hora, dirección, errores), usados para la seguridad y para corregir fallos.',
        ],
      },
      {
        heading: 'Entrada por voz',
        paragraphs: [
          'Si usas el micrófono, tu dispositivo o navegador convierte tu voz en texto: el servicio de voz de Apple en iPhone, el de Google en Android y el del propio navegador en la web (Chrome envía el audio a Google, Safari a Apple). Sus condiciones de privacidad se aplican a ese paso. Nunca recibimos ni guardamos el audio, solo el texto resultante, que tratamos como una petición escrita. La app pide permiso para el micrófono antes y puedes retirarlo cuando quieras en los ajustes.',
        ],
      },
      {
        heading: 'Para qué los usamos',
        bullets: [
          'Para recomendar títulos que encajen con tu ánimo y estén disponibles en tus servicios en tu país.',
          'Para aprender tus gustos a partir de tu biblioteca y tus valoraciones, y mejorar las recomendaciones.',
          'Para gestionar tu cuenta, aplicar tu plan y su límite diario y restaurar tus compras.',
          'Para mantener el servicio seguro, evitar abusos y corregir problemas.',
        ],
        paragraphs: ['No vendemos tus datos personales, no mostramos publicidad ni los usamos para perfiles publicitarios.'],
      },
      {
        heading: 'Inteligencia artificial',
        paragraphs: [
          'El texto de tus peticiones y los estados de ánimo elegidos se envían a modelos de IA alojados en Amazon Bedrock (Anthropic Claude para entender tu ánimo y explicar las sugerencias, Amazon Titan para compararlo con nuestro catálogo). Según las condiciones de Amazon, estos datos no se usan para entrenar los modelos. El resultado solo sirve para generar tus recomendaciones y se guarda con la petición en tu historial.',
          'Si algo de lo que escribes indica que lo estás pasando mal, la app puede mostrar un mensaje de apoyo en lugar de recomendaciones. No es un servicio médico ni de emergencias.',
        ],
      },
      {
        heading: 'Bases legales',
        paragraphs: [
          'Cuando la ley lo exige (por ejemplo el RGPD, el UK GDPR o la POPIA), nos basamos en: la ejecución de nuestro contrato contigo para prestar el servicio; nuestro interés legítimo en mantenerlo seguro y mejorar las recomendaciones; y tu consentimiento para el micrófono, que puedes retirar en cualquier momento.',
        ],
      },
      {
        heading: 'Quién trata tus datos',
        paragraphs: ['Usamos estos proveedores, cada uno obligado a usar los datos solo para prestarnos su servicio:'],
        bullets: [
          'Amazon Web Services: alojamiento, bases de datos, inicio de sesión (Amazon Cognito) y modelos de IA (Amazon Bedrock).',
          'Google: inicio de sesión con Google si lo eliges; reconocimiento de voz en Android y en Chrome.',
          'Apple: reconocimiento de voz en iPhone y en Safari; pagos del App Store.',
          'Google Play: pagos en Android.',
          'RevenueCat: gestiona el estado de la suscripción entre tiendas, vinculado a tu cuenta por un identificador interno, no tu correo.',
          'Vercel: estadísticas de páginas respetuosas con la privacidad en la web, sin cookies ni seguimiento entre sitios.',
          'TMDB (The Movie Database): fuente de la información e imágenes de los títulos. No enviamos tus datos personales a TMDB.',
        ],
      },
      {
        heading: 'Dónde se guardan tus datos',
        paragraphs: [
          'Nuestros servidores están en Estados Unidos (AWS, us-east-1). Si vives en otro lugar, tus datos se transfieren allí con las garantías que exige la ley, como las cláusulas contractuales tipo.',
        ],
      },
      {
        heading: 'Cuánto tiempo los guardamos',
        bullets: [
          'Tus peticiones y sus resultados: 90 días; después se borran automáticamente.',
          'Tu cuenta, preferencias y biblioteca: hasta que elimines la cuenta.',
          'Registros del servidor: un periodo limitado por seguridad; después se borran.',
          'Registros de compra que guardan Apple, Google y RevenueCat: según sus condiciones y la normativa fiscal.',
        ],
      },
      {
        heading: 'Tus derechos',
        paragraphs: [
          'Según dónde vivas, puedes pedir acceder a tus datos, corregirlos, eliminarlos, recibir una copia en un formato portable, oponerte a ciertos tratamientos o limitarlos y retirar tu consentimiento. Puedes cambiar tus preferencias y tu biblioteca directamente en la app. Para eliminar tu cuenta o cualquier otra petición, escríbenos a {contact}; respondemos en el plazo legal, normalmente un mes. También puedes reclamar ante tu autoridad de protección de datos (en España, la AEPD).',
          'Eliminar tu cuenta no cancela una suscripción comprada a través de Apple o Google; cancélala en los ajustes de suscripción de tu tienda.',
        ],
      },
      {
        heading: 'Datos en tu dispositivo',
        paragraphs: [
          'La app guarda tu sesión, tu idioma y algunas preferencias de visualización en tu dispositivo (almacenamiento local) para que sigas conectado. No son cookies publicitarias ni se comparten con terceros. Al cerrar sesión se borra la sesión.',
        ],
      },
      {
        heading: 'Menores',
        paragraphs: [
          'UpMyMood no está dirigido a menores de 13 años ni a quienes no tengan la edad de consentimiento digital en su país (14 años en España). No recopilamos sus datos a sabiendas; si crees que un menor ha creado una cuenta, contáctanos y la eliminaremos.',
        ],
      },
      {
        heading: 'Seguridad',
        paragraphs: [
          'Los datos se cifran en tránsito y en reposo, el acceso está limitado y las contraseñas las gestiona Amazon Cognito; nosotros nunca las guardamos. Ningún sistema es totalmente seguro, por eso solo recopilamos lo que el servicio necesita.',
        ],
      },
      {
        heading: 'Cambios',
        paragraphs: ['Actualizaremos esta página si cambian nuestras prácticas y te avisaremos en la app de los cambios importantes. La fecha de arriba indica la versión vigente.'],
      },
      {
        heading: 'Contacto',
        paragraphs: ['Preguntas o peticiones sobre tus datos: {contact}.'],
      },
    ],
  },
}
