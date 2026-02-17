import { useState } from 'react'

interface Message {
  id: string
  expediteur: string
  sujet: string
  apercu: string
  date: string
  lu: boolean
  categorie: 'DNCMP' | 'Fournisseur' | 'Interne' | 'Système'
}

const mockMessages: Message[] = [
  {
    id: '1',
    expediteur: 'DNCMP - Service Validation',
    sujet: 'Avis de non-objection - DAC-2025-0087',
    apercu: "Nous avons le plaisir de vous informer que votre dossier d'appel à concurrence a reçu l'avis de non-objection...",
    date: '11/02/2025 09:30',
    lu: false,
    categorie: 'DNCMP',
  },
  {
    id: '2',
    expediteur: 'TechnoPlus SARL',
    sujet: 'Demande de clarification - DAC-2025-0087',
    apercu: "Suite à la publication du dossier d'appel d'offres, nous souhaitons obtenir des précisions sur le lot 2...",
    date: '10/02/2025 16:45',
    lu: false,
    categorie: 'Fournisseur',
  },
  {
    id: '3',
    expediteur: 'Système eProcurement',
    sujet: "Rappel : Date limite de soumission dans 48h",
    apercu: "La date limite de soumission pour le marché DAC-2025-0092 est fixée au 15/02/2025 à 10h00...",
    date: '10/02/2025 08:00',
    lu: true,
    categorie: 'Système',
  },
  {
    id: '4',
    expediteur: 'Direction des Finances',
    sujet: 'Validation du décompte n°4',
    apercu: "Le décompte n°4 pour le marché d'entretien routier a été validé par le contrôleur financier...",
    date: '09/02/2025 14:20',
    lu: true,
    categorie: 'Interne',
  },
  {
    id: '5',
    expediteur: 'DNCMP - Secrétariat',
    sujet: 'Convocation - Séance d\'ouverture des plis',
    apercu: "Vous êtes convié(e) à la séance d'ouverture des plis pour le marché MR-2025-0034 qui se tiendra le...",
    date: '08/02/2025 11:00',
    lu: true,
    categorie: 'DNCMP',
  },
  {
    id: '6',
    expediteur: 'BTP Afrique SA',
    sujet: 'Transmission du décompte n°2',
    apercu: "Veuillez trouver ci-joint le décompte n°2 pour les travaux de réhabilitation du bâtiment administratif...",
    date: '07/02/2025 09:15',
    lu: true,
    categorie: 'Fournisseur',
  },
]

const categorieColors: Record<string, string> = {
  'DNCMP': 'bg-blue-100 text-blue-700',
  'Fournisseur': 'bg-purple-100 text-purple-700',
  'Interne': 'bg-gray-100 text-gray-700',
  'Système': 'bg-amber-100 text-amber-700',
}

export default function MessagesPage() {
  const [messages] = useState<Message[]>(mockMessages)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedMessage = messages.find((m) => m.id === selectedId)

  const unreadCount = messages.filter((m) => !m.lu).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`
              : 'Aucun nouveau message'}
          </p>
        </div>
        <button className="bg-[#1e3a5f] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a4d7a] transition-colors">
          Nouveau message
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Message list */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {/* Filters */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <select className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tous les messages</option>
                <option value="non_lu">Non lus</option>
                <option value="dncmp">DNCMP</option>
                <option value="fournisseur">Fournisseurs</option>
                <option value="interne">Interne</option>
                <option value="systeme">Système</option>
              </select>
            </div>

            {/* Messages */}
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedId(message.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedId === message.id ? 'bg-blue-50' : ''
                } ${!message.lu ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p
                    className={`text-sm truncate pr-2 ${
                      !message.lu ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                    }`}
                  >
                    {message.expediteur}
                  </p>
                  {!message.lu && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-900 truncate">{message.sujet}</p>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      categorieColors[message.categorie] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {message.categorie}
                  </span>
                  <span className="text-xs text-gray-400">{message.date.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="flex-1 overflow-y-auto">
            {selectedMessage ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        categorieColors[selectedMessage.categorie] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {selectedMessage.categorie}
                    </span>
                    <span className="text-xs text-gray-400">{selectedMessage.date}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedMessage.sujet}
                  </h2>
                  <p className="text-sm text-gray-500">De : {selectedMessage.expediteur}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedMessage.apercu}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-4">
                    Veuillez prendre les dispositions nécessaires dans les meilleurs délais.
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-4">
                    Cordialement,
                    <br />
                    {selectedMessage.expediteur}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2a4d7a] transition-colors">
                    Répondre
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Transférer
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 transition-colors">
                    Archiver
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-3">{'\u2709'}</p>
                  <p className="text-sm">Sélectionnez un message pour le lire</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
