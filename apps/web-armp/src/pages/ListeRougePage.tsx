import { useState } from 'react'

const blacklist = [
  { id: 1, entite: 'Construction Rapide SARL', nif: 'BJ-2019-45678', motif: 'Fausse declaration de capacite technique', dateInscription: '2025-06-15', duree: '3 ans', expiration: '2028-06-15', statut: 'Active', decision: 'DEC-ARMP-2025-0089' },
  { id: 2, entite: 'TechnoPlus SA', nif: 'BJ-2020-12345', motif: 'Corruption averee lors de procedure d\'attribution', dateInscription: '2024-11-20', duree: '5 ans', expiration: '2029-11-20', statut: 'Active', decision: 'DEC-ARMP-2024-0156' },
  { id: 3, entite: 'Services Generaux Benin', nif: 'BJ-2018-78901', motif: 'Inexecution grave de marche public', dateInscription: '2024-03-10', duree: '2 ans', expiration: '2026-03-10', statut: 'Active', decision: 'DEC-ARMP-2024-0034' },
  { id: 4, entite: 'BTP Excellence', nif: 'BJ-2017-34567', motif: 'Collusion entre soumissionnaires', dateInscription: '2023-08-01', duree: '3 ans', expiration: '2026-08-01', statut: 'Active', decision: 'DEC-ARMP-2023-0112' },
  { id: 5, entite: 'Fournitures Express', nif: 'BJ-2016-56789', motif: 'Defaut de qualification', dateInscription: '2023-01-15', duree: '2 ans', expiration: '2025-01-15', statut: 'Expiree', decision: 'DEC-ARMP-2023-0008' },
  { id: 6, entite: 'Logistique Atlantique', nif: 'BJ-2019-23456', motif: 'Fraude documentaire', dateInscription: '2022-07-20', duree: '5 ans', expiration: '2027-07-20', statut: 'Active', decision: 'DEC-ARMP-2022-0098' },
]

const historique = [
  { date: '2026-02-01', action: 'Verification annuelle - 2 inscriptions expirees retirees', acteur: 'Systeme' },
  { date: '2025-12-15', action: 'Rejet demande rehabilitation - BTP Excellence', acteur: 'CRD ARMP' },
  { date: '2025-11-20', action: 'Demande de rehabilitation recue - BTP Excellence', acteur: 'BTP Excellence' },
  { date: '2025-06-15', action: 'Inscription - Construction Rapide SARL', acteur: 'ARMP' },
]

function StatusBadge({ statut }: { statut: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
      statut === 'Active' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'
    }`}>
      {statut}
    </span>
  )
}

export default function ListeRougePage() {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste rouge</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des entreprises exclues des marches publics</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm font-medium px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          Ajouter une entite
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Nouvelle inscription sur la liste rouge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Denomination sociale</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900" placeholder="Nom de l'entite" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFU / Identifiant fiscal unique</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900" placeholder="BJ-XXXX-XXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif d'exclusion</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900">
                <option>Selectionner un motif</option>
                <option>Corruption</option>
                <option>Fraude documentaire</option>
                <option>Fausse declaration</option>
                <option>Inexecution grave</option>
                <option>Collusion</option>
                <option>Defaut de qualification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duree d'exclusion</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900">
                <option>Selectionner la duree</option>
                <option>1 an</option>
                <option>2 ans</option>
                <option>3 ans</option>
                <option>5 ans</option>
                <option>Permanente</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision de reference</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900" placeholder="Numero de la decision ARMP" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowAddForm(false)} className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button className="text-sm font-medium px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
              Inscrire sur la liste
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Entites exclues (actives)</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{blacklist.filter(b => b.statut === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expirations prochaines (6 mois)</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Demandes rehabilitation</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">1</p>
        </div>
      </div>

      {/* Blacklist table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entite</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">IFU</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motif</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duree</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiration</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blacklist.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{b.entite}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 font-mono">{b.nif}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{b.motif}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{b.dateInscription}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{b.duree}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{b.expiration}</td>
                  <td className="px-5 py-3"><StatusBadge statut={b.statut} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Details
                      </button>
                      {b.statut === 'Active' && (
                        <button className="text-xs font-medium px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                          Retirer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Historique des modifications</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {historique.map((h, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm text-gray-800">{h.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">Par : {h.acteur}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{h.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
