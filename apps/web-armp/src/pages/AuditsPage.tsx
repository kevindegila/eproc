const audits = [
  { ref: 'AUD-2026-0005', entite: 'Ministere de la Sante', objet: 'Audit des marches publics 2025', type: 'Programme', debut: '2026-02-01', fin: '2026-03-15', statut: 'En cours', auditeur: 'Equipe A' },
  { ref: 'AUD-2026-0004', entite: 'Mairie de Cotonou', objet: 'Controle a posteriori - Travaux voirie', type: 'Ponctuel', debut: '2026-01-15', fin: '2026-02-28', statut: 'En cours', auditeur: 'Equipe B' },
  { ref: 'AUD-2026-0003', entite: 'SONEB', objet: 'Revue des procedures de passation', type: 'Programme', debut: '2026-01-10', fin: '2026-02-10', statut: 'Rapport provisoire', auditeur: 'Equipe A' },
  { ref: 'AUD-2025-0028', entite: 'Port Autonome Cotonou', objet: 'Audit marches infrastructure portuaire', type: 'Special', debut: '2025-11-15', fin: '2026-01-15', statut: 'Rapport final', auditeur: 'Equipe C' },
  { ref: 'AUD-2025-0027', entite: 'Ministere Education', objet: 'Controle execution marches scolaires', type: 'Programme', debut: '2025-10-01', fin: '2025-12-31', statut: 'Cloture', auditeur: 'Equipe B' },
]

const findings = [
  { audit: 'AUD-2026-0003', constat: 'Absence de publication d\'avis dans 3 procedures', gravite: 'Majeure', recommandation: 'Mise en conformite immediate' },
  { audit: 'AUD-2025-0028', constat: 'Depassement de seuil sans AOI', gravite: 'Critique', recommandation: 'Saisine DNCMP pour regularisation' },
  { audit: 'AUD-2025-0028', constat: 'Retards systematiques dans les paiements', gravite: 'Mineure', recommandation: 'Amelioration circuit de paiement' },
]

function StatusBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
    'Rapport provisoire': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Rapport final': 'bg-green-100 text-green-800 border-green-200',
    'Cloture': 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colors[statut] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {statut}
    </span>
  )
}

function GraviteBadge({ gravite }: { gravite: string }) {
  const colors: Record<string, string> = {
    'Critique': 'bg-red-100 text-red-800 border-red-200',
    'Majeure': 'bg-orange-100 text-orange-800 border-orange-200',
    'Mineure': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colors[gravite] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {gravite}
    </span>
  )
}

export default function AuditsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audits et controles</h1>
          <p className="text-sm text-gray-500 mt-1">Rapports d'audit et constats des controles a posteriori</p>
        </div>
        <button className="text-sm font-medium px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
          Nouvel audit
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Audits en cours</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">3</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rapports en attente</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Constats critiques</p>
          <p className="text-2xl font-bold text-red-700 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Termines cette annee</p>
          <p className="text-2xl font-bold text-green-700 mt-1">12</p>
        </div>
      </div>

      {/* Audits table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Missions d'audit</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entite auditee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipe</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {audits.map((a) => (
                <tr key={a.ref} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-red-900">{a.ref}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{a.entite}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{a.objet}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{a.type}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{a.debut} - {a.fin}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{a.auditeur}</td>
                  <td className="px-5 py-3"><StatusBadge statut={a.statut} /></td>
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

      {/* Recent findings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Constats recents</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {findings.map((f, i) => (
            <div key={i} className="px-5 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">{f.audit}</span>
                    <GraviteBadge gravite={f.gravite} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{f.constat}</p>
                  <p className="text-xs text-gray-500 mt-1">Recommandation : {f.recommandation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
