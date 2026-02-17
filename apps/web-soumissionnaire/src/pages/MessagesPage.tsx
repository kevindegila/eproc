import { useState } from 'react'

interface Message {
  id: number
  expediteur: string
  sujet: string
  extrait: string
  date: string
  lu: boolean
  type: 'systeme' | 'autorite' | 'support'
}

const messages: Message[] = [
  {
    id: 1,
    expediteur: 'Systeme eProcurement',
    sujet: 'Confirmation de retrait du DAC - AOO-2026-0048',
    extrait: 'Vous avez retire avec succes le Dossier d\'Appel a Concurrence pour l\'appel AOO-2026-0048. Vous pouvez desormais...',
    date: '11 Fev 2026, 10:15',
    lu: false,
    type: 'systeme',
  },
  {
    id: 2,
    expediteur: 'Ministere de la Sante',
    sujet: 'Demande de clarification - AOO-2026-0042',
    extrait: 'Suite a votre demande de clarification concernant les specifications techniques du lot 2, veuillez trouver ci-joint...',
    date: '10 Fev 2026, 16:30',
    lu: false,
    type: 'autorite',
  },
  {
    id: 3,
    expediteur: 'Systeme eProcurement',
    sujet: 'Accuse de reception - Offre OFF-2026-0112',
    extrait: 'Votre offre a ete recue et enregistree avec succes. Reference de depot: DEP-2026-0112. Date et heure de depot...',
    date: '05 Fev 2026, 09:50',
    lu: true,
    type: 'systeme',
  },
  {
    id: 4,
    expediteur: 'Support eProcurement',
    sujet: 'Resolution de votre ticket #1245',
    extrait: 'Votre probleme technique concernant le telechargement des documents du DAC a ete resolu. Veuillez reessayer...',
    date: '03 Fev 2026, 14:00',
    lu: true,
    type: 'support',
  },
  {
    id: 5,
    expediteur: 'Mairie de Porto-Novo',
    sujet: 'Notification - Debut des travaux CTR-2025-0089',
    extrait: 'L\'ordre de service de demarrage des travaux pour le contrat CTR-2025-0089 sera emis le 15 Fevrier 2026...',
    date: '01 Fev 2026, 11:20',
    lu: true,
    type: 'autorite',
  },
  {
    id: 6,
    expediteur: 'Systeme eProcurement',
    sujet: 'Nouvel appel d\'offres correspondant a votre profil',
    extrait: 'Un nouvel appel d\'offres dans le secteur BTP a ete publie: AOO-2026-0048 - Construction de 10 salles de classe...',
    date: '25 Jan 2026, 08:00',
    lu: true,
    type: 'systeme',
  },
]

const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
  systeme: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Systeme' },
  autorite: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Autorite' },
  support: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Support' },
}

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<'tous' | 'non-lus'>('tous')

  const filtered = filter === 'non-lus' ? messages.filter((m) => !m.lu) : messages
  const selected = messages.find((m) => m.id === selectedId)
  const unreadCount = messages.filter((m) => !m.lu).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Votre boite de reception. {unreadCount} message(s) non lu(s).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Message list */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Filters */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <button
                onClick={() => setFilter('tous')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === 'tous' ? 'bg-teal-100 text-teal-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Tous ({messages.length})
              </button>
              <button
                onClick={() => setFilter('non-lus')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === 'non-lus' ? 'bg-teal-100 text-teal-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Non lus ({unreadCount})
              </button>
            </div>

            {/* Messages */}
            <div className="divide-y divide-gray-50 max-h-[calc(100vh-320px)] overflow-y-auto">
              {filtered.map((msg) => {
                const typeInfo = typeConfig[msg.type]
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors ${
                      selectedId === msg.id ? 'bg-teal-50' : 'hover:bg-gray-50'
                    } ${!msg.lu ? 'bg-blue-50/50' : ''}`}
                  >
                    {!msg.lu && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                    )}
                    <div className={`min-w-0 flex-1 ${msg.lu && !selectedId ? 'ml-5' : msg.lu ? 'ml-5' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${!msg.lu ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                          {msg.expediteur}
                        </p>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${typeInfo.bg} ${typeInfo.text}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className={`mt-0.5 text-sm truncate ${!msg.lu ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {msg.sujet}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 truncate">{msg.extrait}</p>
                      <p className="mt-1 text-[10px] text-gray-400">{msg.date}</p>
                    </div>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-500">Aucun message non lu.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{selected.sujet}</h2>
                    <p className="mt-1 text-sm text-gray-500">De : {selected.expediteur}</p>
                    <p className="text-xs text-gray-400">{selected.date}</p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${typeConfig[selected.type].bg} ${typeConfig[selected.type].text}`}>
                    {typeConfig[selected.type].label}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <p>{selected.extrait}</p>
                  <p className="mt-4">
                    Pour toute question ou besoin d'assistance supplementaire, n'hesitez pas a contacter
                    notre equipe de support via la plateforme.
                  </p>
                  <p className="mt-4 text-gray-500">
                    Cordialement,<br />
                    {selected.expediteur}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-4">
                <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Repondre
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="mt-3 text-sm text-gray-500">Selectionnez un message pour le lire</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
