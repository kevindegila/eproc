import { useState } from 'react'

export default function ProfilPage() {
  const [editing, setEditing] = useState(false)

  const company = {
    nom: 'Entreprise CODJA SARL',
    ifu: '3201 2345 6789',
    rccm: 'RB/COT/26 B 12345',
    formeJuridique: 'SARL',
    capitalSocial: '50 000 000 FCFA',
    dateCreation: '15 Mars 2010',
    adresse: '123 Boulevard de la Marina, Cotonou',
    ville: 'Cotonou',
    pays: 'Benin',
    telephone: '+229 21 30 45 67',
    email: 'contact@codja-sarl.bj',
    siteWeb: 'www.codja-sarl.bj',
    directeur: 'Jean-Marc CODJA',
    secteurs: ['BTP', 'Fournitures', 'Services informatiques'],
  }

  const certificats = [
    {
      nom: 'Attestation fiscale',
      numero: 'AF-2026-123456',
      dateExpiration: '31 Dec 2026',
      statut: 'Valide',
    },
    {
      nom: 'Attestation CNSS',
      numero: 'CNSS-2026-789012',
      dateExpiration: '30 Juin 2026',
      statut: 'Valide',
    },
    {
      nom: 'Attestation de non faillite',
      numero: 'ANF-2026-345678',
      dateExpiration: '31 Mars 2026',
      statut: 'Valide',
    },
    {
      nom: 'Certification ISO 9001',
      numero: 'ISO-9001-2024-BJ-0456',
      dateExpiration: '15 Sep 2026',
      statut: 'Valide',
    },
    {
      nom: 'Agrement BTP Categorie B',
      numero: 'AGR-BTP-B-2024-0089',
      dateExpiration: '01 Jan 2027',
      statut: 'Valide',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Informations de votre entreprise et documents certifies.
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
            editing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {editing ? 'Annuler' : 'Modifier le profil'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Company identity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Informations de l'entreprise</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Raison sociale</label>
                  {editing ? (
                    <input
                      type="text"
                      defaultValue={company.nom}
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1.5 text-sm font-medium text-gray-900">{company.nom}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Forme juridique</label>
                  {editing ? (
                    <select className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
                      <option>SARL</option>
                      <option>SA</option>
                      <option>SAS</option>
                      <option>Entreprise individuelle</option>
                      <option>GIE</option>
                    </select>
                  ) : (
                    <p className="mt-1.5 text-sm text-gray-900">{company.formeJuridique}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">IFU (Identifiant Fiscal Unique)</label>
                  <p className="mt-1.5 text-sm font-mono font-semibold text-gray-900">{company.ifu}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">RCCM</label>
                  <p className="mt-1.5 text-sm font-mono font-semibold text-gray-900">{company.rccm}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Capital social</label>
                  <p className="mt-1.5 text-sm text-gray-900">{company.capitalSocial}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Date de creation</label>
                  <p className="mt-1.5 text-sm text-gray-900">{company.dateCreation}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Dirigeant principal</label>
                  <p className="mt-1.5 text-sm text-gray-900">{company.directeur}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Secteurs d'activite</label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {company.secteurs.map((s) => (
                      <span key={s} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Coordonnees</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Adresse</label>
                  {editing ? (
                    <input
                      type="text"
                      defaultValue={company.adresse}
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1.5 text-sm text-gray-900">{company.adresse}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Ville</label>
                  {editing ? (
                    <input
                      type="text"
                      defaultValue={company.ville}
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1.5 text-sm text-gray-900">{company.ville}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Pays</label>
                  <p className="mt-1.5 text-sm text-gray-900">{company.pays}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Telephone</label>
                  {editing ? (
                    <input
                      type="text"
                      defaultValue={company.telephone}
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1.5 text-sm text-gray-900">{company.telephone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      defaultValue={company.email}
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1.5 text-sm text-teal-600">{company.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Site web</label>
                  {editing ? (
                    <input
                      type="text"
                      defaultValue={company.siteWeb}
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1.5 text-sm text-teal-600">{company.siteWeb}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="mt-6 flex justify-end">
                  <button className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm transition-colors">
                    Enregistrer les modifications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certificates sidebar */}
        <div className="space-y-6">
          {/* Company card */}
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-teal-600 to-teal-700 p-6 shadow-sm text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-xl font-bold">
                EC
              </div>
              <div>
                <p className="font-bold text-lg">{company.nom}</p>
                <p className="text-teal-100 text-xs">{company.formeJuridique} - Depuis {company.dateCreation}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-teal-200">IFU</span>
                <span className="font-mono font-semibold">{company.ifu}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-200">RCCM</span>
                <span className="font-mono font-semibold">{company.rccm}</span>
              </div>
            </div>
          </div>

          {/* Certificates */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Certificats et attestations</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {certificats.map((cert, idx) => (
                <div key={idx} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cert.nom}</p>
                      <p className="mt-0.5 text-xs font-mono text-gray-500">{cert.numero}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                      {cert.statut}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Expire le {cert.dateExpiration}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-5 py-3">
              <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
                Ajouter un certificat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
