import type { LegalDocument } from '@/lib/legal/types'
import type { Locale } from '@/lib/i18n'

/**
 * Terms of Service. A draft to review with a lawyer before release. Tokens: {operator},
 * {contact}, {updated}, {jurisdiction}.
 */
export const TERMS: Record<Locale, LegalDocument> = {
  en: {
    title: 'Terms of Service',
    intro:
      'These terms govern your use of the UpMyMood app and website (the "service"), operated by {operator}. By creating an account or using the service you agree to them. If you do not agree, please do not use UpMyMood.',
    sections: [
      {
        heading: 'Who can use UpMyMood',
        paragraphs: [
          'You must be at least 13 years old, and old enough to consent to online services where you live. If you are under the age of majority, a parent or guardian must agree to these terms on your behalf. You are responsible for keeping your login details safe and for activity on your account.',
        ],
      },
      {
        heading: 'What the service does',
        paragraphs: [
          'UpMyMood suggests films and series based on how you say you feel, your preferences and your history. Suggestions are produced with the help of artificial intelligence and are offered for entertainment only. They may not always match your taste, and descriptions or explanations may contain mistakes.',
          'We do not host or stream any film or series. Availability on streaming services, ratings and descriptions come from third parties, mainly TMDB, and may be out of date. Watching a title happens on the streaming service, under its own terms and subscription.',
          'UpMyMood is not a medical, psychological or crisis service. If you are in distress, contact a professional or your local emergency services.',
        ],
      },
      {
        heading: 'Plans and subscriptions',
        bullets: [
          'The Free plan includes a limited number of recommendation requests per day. The Advanced plan, a paid subscription, raises that limit. Current limits and prices are shown in the app before you buy.',
          'Subscriptions are sold and billed by Apple (App Store) or Google (Google Play) and are governed by their terms. Payment is taken when you confirm the purchase.',
          'Subscriptions renew automatically at the end of each period at the then-current price unless you cancel at least 24 hours before the period ends. Manage or cancel in your store account’s subscription settings; deleting the app or your account does not cancel it.',
          'Refunds are handled by Apple or Google under their policies. Nothing in these terms limits refund or withdrawal rights you have under consumer law.',
          'We may change plan features, limits or prices. Price increases apply from your next renewal after notice, as the store’s rules require, and you can cancel before they take effect.',
          'Daily limits reset at midnight UTC. A request that fails on our side does not count against your limit.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: ['When using UpMyMood you agree not to:'],
        bullets: [
          'break the law or infringe anyone’s rights;',
          'try to get around plan limits, security or access controls, or use another person’s account;',
          'scrape, copy or resell the service or its catalogue, or access it by automated means except through the app;',
          'interfere with or overload the service, or try to reverse engineer it except where the law allows;',
          'use the service to create or train a competing product.',
        ],
      },
      {
        heading: 'Your content',
        paragraphs: [
          'You keep ownership of what you write or say in the app, such as your mood descriptions and feedback. You give us a licence to store and process it only to provide and improve the service, as explained in our Privacy Policy. Do not include other people’s personal information or anything unlawful in your requests.',
        ],
      },
      {
        heading: 'Our content and third-party content',
        paragraphs: [
          'The app, its design, software and text belong to {operator} or its licensors. We grant you a personal, non-exclusive, non-transferable licence to use the service for your own, non-commercial purposes.',
          'Film and series information and artwork are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming service names and logos belong to their owners and are used only to tell you where a title is available.',
        ],
      },
      {
        heading: 'Availability and changes',
        paragraphs: [
          'We work to keep UpMyMood available but do not promise it will always be uninterrupted or error-free. We may change, suspend or stop features. If we stop the service entirely, we will give reasonable notice where we can.',
        ],
      },
      {
        heading: 'Suspension and ending your account',
        paragraphs: [
          'You can stop using UpMyMood at any time and ask us to delete your account at {contact}. We may suspend or close an account that seriously or repeatedly breaks these terms, after warning you where reasonable. Sections that by their nature should continue after your account ends will continue.',
        ],
      },
      {
        heading: 'Disclaimers',
        paragraphs: [
          'To the extent the law allows, the service is provided "as is" and "as available", without warranties that suggestions will suit you or that third-party information is accurate. Some countries do not allow these exclusions, so they may not apply to you, and your statutory consumer rights are not affected.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'To the extent the law allows, {operator} is not liable for indirect or consequential losses, or for losses caused by third-party services such as streaming platforms or app stores. Our total liability to you for any claim related to the service is limited to the amount you paid us for it in the 12 months before the claim. Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or any other liability that cannot be limited by law.',
        ],
      },
      {
        heading: 'Changes to these terms',
        paragraphs: [
          'We may update these terms. We will tell you in the app about significant changes before they take effect; if you keep using UpMyMood afterwards, the new terms apply. The date at the top shows the current version.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: [
          'These terms are governed by the laws of {jurisdiction}. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live and can bring claims in its courts.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions about these terms: {contact}.'],
      },
    ],
  },

  fr: {
    title: 'Conditions d’utilisation',
    intro:
      'Ces conditions régissent l’utilisation de l’application et du site UpMyMood (le « service »), exploités par {operator}. En créant un compte ou en utilisant le service, vous les acceptez. Si vous ne les acceptez pas, n’utilisez pas UpMyMood.',
    sections: [
      {
        heading: 'Qui peut utiliser UpMyMood',
        paragraphs: [
          'Vous devez avoir au moins 13 ans et l’âge requis pour consentir aux services en ligne dans votre pays. Si vous êtes mineur, un parent ou tuteur doit accepter ces conditions pour vous. Vous êtes responsable de la confidentialité de vos identifiants et de l’activité de votre compte.',
        ],
      },
      {
        heading: 'Ce que fait le service',
        paragraphs: [
          'UpMyMood suggère des films et séries selon ce que vous dites ressentir, vos préférences et votre historique. Les suggestions sont produites avec l’aide de l’intelligence artificielle et proposées à titre de divertissement. Elles peuvent ne pas correspondre à vos goûts, et les descriptions ou explications peuvent comporter des erreurs.',
          'Nous n’hébergeons ni ne diffusons aucun film ou série. La disponibilité sur les plateformes, les classifications et les descriptions proviennent de tiers, principalement TMDB, et peuvent ne pas être à jour. Le visionnage a lieu sur la plateforme de streaming, selon ses propres conditions et abonnement.',
          'UpMyMood n’est pas un service médical, psychologique ou d’urgence. Si vous êtes en détresse, contactez un professionnel ou les services d’urgence.',
        ],
      },
      {
        heading: 'Formules et abonnements',
        bullets: [
          'La formule Gratuite comprend un nombre limité de demandes de recommandation par jour. La formule Advanced, un abonnement payant, augmente cette limite. Les limites et prix en vigueur sont affichés dans l’app avant l’achat.',
          'Les abonnements sont vendus et facturés par Apple (App Store) ou Google (Google Play) et soumis à leurs conditions. Le paiement est prélevé lors de la confirmation de l’achat.',
          'Les abonnements se renouvellent automatiquement à la fin de chaque période au prix alors en vigueur, sauf résiliation au moins 24 heures avant la fin de la période. Gérez-les ou résiliez-les dans les réglages d’abonnement de votre compte store ; supprimer l’app ou votre compte ne les résilie pas.',
          'Les remboursements sont traités par Apple ou Google selon leurs politiques. Rien dans ces conditions ne limite vos droits de remboursement ou de rétractation prévus par le droit de la consommation.',
          'Nous pouvons modifier les fonctionnalités, limites ou prix des formules. Une hausse de prix s’applique à votre prochain renouvellement après préavis, selon les règles du store, et vous pouvez résilier avant qu’elle ne prenne effet.',
          'Les limites quotidiennes se renouvellent à minuit UTC. Une demande qui échoue de notre fait n’est pas décomptée.',
        ],
      },
      {
        heading: 'Utilisation acceptable',
        paragraphs: ['En utilisant UpMyMood, vous vous engagez à ne pas :'],
        bullets: [
          'enfreindre la loi ou les droits d’autrui ;',
          'contourner les limites des formules, la sécurité ou les contrôles d’accès, ni utiliser le compte d’une autre personne ;',
          'extraire, copier ou revendre le service ou son catalogue, ni y accéder par des moyens automatisés autres que l’app ;',
          'perturber ou surcharger le service, ni tenter de le désassembler, sauf si la loi le permet ;',
          'utiliser le service pour créer ou entraîner un produit concurrent.',
        ],
      },
      {
        heading: 'Vos contenus',
        paragraphs: [
          'Vous restez propriétaire de ce que vous écrivez ou dites dans l’app, comme vos descriptions d’humeur et vos avis. Vous nous accordez une licence pour les stocker et les traiter uniquement afin de fournir et d’améliorer le service, comme expliqué dans notre Politique de confidentialité. N’incluez pas d’informations personnelles sur autrui ni de contenu illicite dans vos demandes.',
        ],
      },
      {
        heading: 'Nos contenus et ceux de tiers',
        paragraphs: [
          'L’app, son design, son logiciel et ses textes appartiennent à {operator} ou à ses concédants. Nous vous accordons une licence personnelle, non exclusive et non cessible d’utiliser le service à des fins personnelles et non commerciales.',
          'Les informations et visuels des films et séries sont fournis par TMDB. Ce produit utilise l’API TMDB mais n’est ni approuvé ni certifié par TMDB. Les noms et logos des plateformes de streaming appartiennent à leurs propriétaires et servent uniquement à indiquer où un titre est disponible.',
        ],
      },
      {
        heading: 'Disponibilité et évolutions',
        paragraphs: [
          'Nous nous efforçons de maintenir UpMyMood disponible, sans garantir un fonctionnement ininterrompu ou sans erreur. Nous pouvons modifier, suspendre ou arrêter des fonctionnalités. Si nous arrêtons totalement le service, nous vous préviendrons dans un délai raisonnable lorsque c’est possible.',
        ],
      },
      {
        heading: 'Suspension et fermeture du compte',
        paragraphs: [
          'Vous pouvez cesser d’utiliser UpMyMood à tout moment et demander la suppression de votre compte à {contact}. Nous pouvons suspendre ou fermer un compte qui enfreint gravement ou de façon répétée ces conditions, après avertissement lorsque c’est raisonnable. Les clauses qui, par nature, doivent survivre à la fermeture du compte restent applicables.',
        ],
      },
      {
        heading: 'Exclusions de garantie',
        paragraphs: [
          'Dans les limites permises par la loi, le service est fourni « en l’état » et « selon disponibilité », sans garantie que les suggestions vous conviendront ni que les informations de tiers sont exactes. Certains pays n’autorisent pas ces exclusions ; elles peuvent donc ne pas s’appliquer à vous, et vos droits légaux de consommateur ne sont pas affectés.',
        ],
      },
      {
        heading: 'Limitation de responsabilité',
        paragraphs: [
          'Dans les limites permises par la loi, {operator} n’est pas responsable des dommages indirects, ni des dommages causés par des services tiers comme les plateformes de streaming ou les stores. Notre responsabilité totale envers vous pour toute réclamation liée au service est limitée au montant que vous nous avez payé pour celui-ci au cours des 12 mois précédant la réclamation. Rien dans ces conditions ne limite la responsabilité en cas de décès ou de dommage corporel causé par une négligence, de fraude, ou toute autre responsabilité qui ne peut être limitée par la loi.',
        ],
      },
      {
        heading: 'Modification des conditions',
        paragraphs: [
          'Nous pouvons mettre à jour ces conditions. Nous vous informerons dans l’app des changements importants avant leur entrée en vigueur ; si vous continuez à utiliser UpMyMood ensuite, les nouvelles conditions s’appliquent. La date en haut indique la version en vigueur.',
        ],
      },
      {
        heading: 'Droit applicable',
        paragraphs: [
          'Ces conditions sont régies par le droit de l’État suivant : {jurisdiction}. Si vous êtes consommateur, vous conservez la protection des dispositions impératives du pays où vous résidez et pouvez saisir ses tribunaux.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions sur ces conditions : {contact}.'],
      },
    ],
  },

  es: {
    title: 'Términos del servicio',
    intro:
      'Estos términos regulan el uso de la app y la web de UpMyMood (el «servicio»), gestionadas por {operator}. Al crear una cuenta o usar el servicio, los aceptas. Si no estás de acuerdo, no uses UpMyMood.',
    sections: [
      {
        heading: 'Quién puede usar UpMyMood',
        paragraphs: [
          'Debes tener al menos 13 años y la edad necesaria para consentir servicios en línea en tu país. Si eres menor de edad, uno de tus padres o tutores debe aceptar estos términos por ti. Eres responsable de mantener seguros tus datos de acceso y de la actividad de tu cuenta.',
        ],
      },
      {
        heading: 'Qué hace el servicio',
        paragraphs: [
          'UpMyMood sugiere películas y series según cómo dices que te sientes, tus preferencias y tu historial. Las sugerencias se generan con ayuda de inteligencia artificial y se ofrecen solo como entretenimiento. Puede que no siempre encajen con tus gustos, y las descripciones o explicaciones pueden contener errores.',
          'No alojamos ni emitimos ninguna película o serie. La disponibilidad en plataformas, las clasificaciones y las descripciones proceden de terceros, principalmente TMDB, y pueden no estar actualizadas. Ver un título ocurre en la plataforma de streaming, con sus propias condiciones y suscripción.',
          'UpMyMood no es un servicio médico, psicológico ni de emergencias. Si estás pasando por un mal momento, contacta con un profesional o con los servicios de emergencia.',
        ],
      },
      {
        heading: 'Planes y suscripciones',
        bullets: [
          'El plan Gratis incluye un número limitado de peticiones de recomendación al día. El plan Advanced, una suscripción de pago, amplía ese límite. Los límites y precios vigentes se muestran en la app antes de comprar.',
          'Las suscripciones las venden y cobran Apple (App Store) o Google (Google Play) y se rigen por sus condiciones. El pago se realiza al confirmar la compra.',
          'Las suscripciones se renuevan automáticamente al final de cada periodo al precio vigente salvo que las canceles al menos 24 horas antes del final del periodo. Gestiónalas o cancélalas en los ajustes de suscripción de tu cuenta de la tienda; borrar la app o tu cuenta no las cancela.',
          'Los reembolsos los gestionan Apple o Google según sus políticas. Nada en estos términos limita los derechos de reembolso o desistimiento que te reconoce la normativa de consumo.',
          'Podemos cambiar las funciones, límites o precios de los planes. Una subida de precio se aplica en tu siguiente renovación tras avisarte, según las reglas de la tienda, y puedes cancelar antes de que entre en vigor.',
          'Los límites diarios se reinician a medianoche UTC. Una petición que falla por nuestra parte no se descuenta.',
        ],
      },
      {
        heading: 'Uso aceptable',
        paragraphs: ['Al usar UpMyMood te comprometes a no:'],
        bullets: [
          'infringir la ley ni los derechos de otras personas;',
          'eludir los límites de los planes, la seguridad o los controles de acceso, ni usar la cuenta de otra persona;',
          'extraer, copiar o revender el servicio o su catálogo, ni acceder a él por medios automatizados distintos de la app;',
          'interferir en el servicio o sobrecargarlo, ni intentar aplicarle ingeniería inversa salvo que la ley lo permita;',
          'usar el servicio para crear o entrenar un producto competidor.',
        ],
      },
      {
        heading: 'Tu contenido',
        paragraphs: [
          'Sigues siendo propietario de lo que escribes o dices en la app, como tus descripciones de ánimo y valoraciones. Nos concedes una licencia para guardarlo y tratarlo solo para prestar y mejorar el servicio, como se explica en nuestra Política de privacidad. No incluyas datos personales de otras personas ni nada ilegal en tus peticiones.',
        ],
      },
      {
        heading: 'Nuestro contenido y el de terceros',
        paragraphs: [
          'La app, su diseño, software y textos pertenecen a {operator} o a sus licenciantes. Te concedemos una licencia personal, no exclusiva e intransferible para usar el servicio con fines propios y no comerciales.',
          'La información e imágenes de películas y series las proporciona TMDB. Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB. Los nombres y logotipos de las plataformas de streaming pertenecen a sus titulares y solo se usan para indicar dónde está disponible un título.',
        ],
      },
      {
        heading: 'Disponibilidad y cambios',
        paragraphs: [
          'Trabajamos para que UpMyMood esté disponible, pero no garantizamos que funcione sin interrupciones ni errores. Podemos cambiar, suspender o retirar funciones. Si cerramos el servicio por completo, avisaremos con antelación razonable cuando sea posible.',
        ],
      },
      {
        heading: 'Suspensión y cierre de la cuenta',
        paragraphs: [
          'Puedes dejar de usar UpMyMood cuando quieras y pedirnos que eliminemos tu cuenta en {contact}. Podemos suspender o cerrar una cuenta que incumpla estos términos de forma grave o reiterada, avisando antes cuando sea razonable. Las cláusulas que por su naturaleza deban seguir vigentes tras el cierre de la cuenta seguirán vigentes.',
        ],
      },
      {
        heading: 'Exención de garantías',
        paragraphs: [
          'En la medida en que la ley lo permita, el servicio se ofrece «tal cual» y «según disponibilidad», sin garantía de que las sugerencias te convengan ni de que la información de terceros sea exacta. Algunos países no permiten estas exclusiones, por lo que puede que no te afecten, y tus derechos legales como consumidor no se ven afectados.',
        ],
      },
      {
        heading: 'Limitación de responsabilidad',
        paragraphs: [
          'En la medida en que la ley lo permita, {operator} no responde de daños indirectos ni de los causados por servicios de terceros como plataformas de streaming o tiendas de apps. Nuestra responsabilidad total frente a ti por cualquier reclamación relacionada con el servicio se limita a lo que nos hayas pagado por él en los 12 meses anteriores a la reclamación. Nada en estos términos limita la responsabilidad por muerte o lesiones causadas por negligencia, por fraude o cualquier otra que la ley no permita limitar.',
        ],
      },
      {
        heading: 'Cambios en estos términos',
        paragraphs: [
          'Podemos actualizar estos términos. Te avisaremos en la app de los cambios importantes antes de que entren en vigor; si sigues usando UpMyMood después, se aplicarán los nuevos términos. La fecha de arriba indica la versión vigente.',
        ],
      },
      {
        heading: 'Ley aplicable',
        paragraphs: [
          'Estos términos se rigen por la legislación de este país: {jurisdiction}. Si eres consumidor, conservas la protección de las normas imperativas del país donde vives y puedes acudir a sus tribunales.',
        ],
      },
      {
        heading: 'Contacto',
        paragraphs: ['Preguntas sobre estos términos: {contact}.'],
      },
    ],
  },
}
