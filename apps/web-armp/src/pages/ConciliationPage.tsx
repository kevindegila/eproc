const cases = [
  { ref: 'CON-2026-0008', parties: 'Fournisseurs Reunis c/ SONEB', objet: 'Differend sur conditions de paiement', montant: '85 000 000 FCFA', date: '2026-02-01', statut: 'En cours', conciliateur: 'M. Hounkpatin' },
  { ref: 'CON-2026-0007', parties: 'Elec Services c/ SBEE', objet: 'Litige sur delais d\'execution', montant: '120 000 000 FCFA', date: '2026-01-22', statut: 'Accord trouve', conciliateur: 'Mme Assogba' },
  { ref: 'CON-2026-0006', parties: 'Transport Express c/ Min. Transports', objet: 'Revision prix marche logistique', montant: '65 000 000 FCFA', date: '2026-01-15', statut: 'En cours', conciliateur: 'M. Hounkpatin' },
  { ref: 'CON-2025-0032', parties: 'Batiments du Sud c/ Mairie Porto-Novo', objet: 'Penalites de retard contestees', montant: '45 000 000 FCFA', date: '2025-12-20', statut: 'Echec', conciliateur: 'Mme Assogba' },
  { ref: 'CON-2025-0031', parties: 'AgriPlus c/ Min. Agriculture', objet: 'Qualite fournitures contestee', montant: '90 000 000 FCFA', date: '2025-12-10', statut: 'Accord trouve', conciliateur: 'M. Hounkpatin' },
]

function StatusBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
    'Accord trouve': 'bg-green-100 text-green-800 border-green-200',
    'Echec': 'bg-red-100 text-red-800 border-red-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colors[statut] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {statut}
    </span>
  )
}

export default function ConciliationPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conciliation</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des procedures de conciliation amiable</p>
        </div>
        <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
          <option>Tous les statuts</option>
          <option>En cours</option>
          <option>Accord trouve</option>
          <option>Echec</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Conciliations en cours</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Taux de reussite</p>
          <p className="text-2xl font-bold text-green-700 mt-1">72%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Duree moyenne</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">21 jours</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parties</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conciliateur</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.map((c) => (
                <tr key={c.ref} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-red-900">{c.ref}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{c.parties}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{c.objet}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{c.montant}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.date}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{c.conciliateur}</td>
                  <td className="px-5 py-3"><StatusBadge statut={c.statut} /></td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs font-medium px-3 py-1.5 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
                      Consulter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
