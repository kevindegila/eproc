import { useRef, useState } from 'react'
import { useCreateDenunciation } from '@eproc/api-client'

export default function DenonciationPage() {
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const mutation = useCreateDenunciation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    const type = formData.get('type') as string
    const entite = formData.get('entite') as string
    const referenceMarche = formData.get('referenceMarche') as string
    const description = formData.get('description') as string
    const email = formData.get('email') as string
    const telephone = formData.get('telephone') as string

    // Map form type values to backend category enum
    const categoryMap: Record<string, string> = {
      corruption: 'CORRUPTION',
      collusion: 'COLLUSION',
      fraude: 'FRAUDE',
      favoritisme: 'FAVORITISME',
      conflit: 'CONFLIT_INTERET',
      surfacturation: 'IRREGULARITE_PROCEDURE',
      execution: 'IRREGULARITE_PROCEDURE',
      autre: 'AUTRE',
    }

    // Build full description with extra context
    let fullDescription = description
    if (referenceMarche) fullDescription += `\n\nReference du marche: ${referenceMarche}`
    if (telephone) fullDescription += `\nTelephone: ${telephone}`

    const payload: Record<string, unknown> = {
      subject: `Denonciation: ${entite}`,
      description: fullDescription,
      category: categoryMap[type] || 'AUTRE',
      isAnonymous: !email,
      contactEmail: email || undefined,
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        setSubmitted(true)
        form.reset()
      },
    })
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-700 text-2xl font-bold">OK</span>
          </div>
          <h2 className="text-xl font-bold text-green-800 mb-2">
            Denonciation envoyee avec succes
          </h2>
          <p className="text-green-700 mb-4">
            Votre signalement a ete enregistre de maniere anonyme. Un numero de
            suivi vous sera communique si vous avez fourni un moyen de contact.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              mutation.reset()
            }}
            className="px-4 py-2 text-sm bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
          >
            Effectuer un autre signalement
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Denonciation anonyme
        </h1>
        <p className="text-gray-600">
          Conformement aux articles 170 et 171 du Code des marches publics, toute
          personne peut denoncer des irregularites constatees dans les procedures
          de passation ou d'execution des marches publics.
        </p>
      </div>

      {/* Legal notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-1">
          Art. 171 — Protection des denonciateurs
        </h3>
        <p className="text-sm text-blue-700">
          L'identite du denonciateur est protegee. Aucune poursuite ne peut etre
          engagee contre une personne ayant signale de bonne foi des faits
          constitutifs d'une irregularite dans la commande publique. Ce formulaire
          ne requiert aucune inscription ni connexion.
        </p>
      </div>

      {/* Error state */}
      {mutation.isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            Erreur lors de l'envoi
          </h3>
          <p className="text-sm text-red-700">
            {(mutation.error as Error)?.message ||
              'Une erreur est survenue lors de l\'envoi de votre signalement. Veuillez reessayer.'}
          </p>
        </div>
      )}

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Informations sur l'irregularite
          </h2>

          {/* Type of irregularity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'irregularite <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Selectionnez un type</option>
              <option value="corruption">Corruption ou tentative de corruption</option>
              <option value="collusion">Pratiques collusoires entre soumissionnaires</option>
              <option value="fraude">Fraude documentaire</option>
              <option value="favoritisme">Favoritisme dans l'attribution</option>
              <option value="conflit">Conflit d'interets non declare</option>
              <option value="surfacturation">Surfacturation ou gonflement des couts</option>
              <option value="execution">Irregularite dans l'execution du marche</option>
              <option value="autre">Autre irregularite</option>
            </select>
          </div>

          {/* Concerned entity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autorite contractante ou entite concernee <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="entite"
              required
              placeholder="Nom de l'institution, ministere ou organisme concerne"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Market reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference du marche (si connue)
            </label>
            <input
              type="text"
              name="referenceMarche"
              placeholder="Ex: AOO-2025-0342"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description detaillee de l'irregularite <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={6}
              placeholder="Decrivez les faits constates, les circonstances, les personnes impliquees..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
            />
            <p className="text-xs text-gray-500 mt-1">
              Soyez aussi precis que possible. Les dates, lieux et noms aident au traitement du signalement.
            </p>
          </div>

          {/* Evidence upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pieces justificatives
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Glissez vos fichiers ici ou cliquez pour selectionner
                </p>
                <input
                  type="file"
                  multiple
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-400">
                  Formats acceptes : PDF, JPG, PNG, DOC, XLSX (max. 10 Mo par fichier)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Optional contact */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Contact (facultatif)
          </h2>
          <p className="text-sm text-gray-500">
            Ces informations sont facultatives et ne seront utilisees que pour vous
            communiquer le suivi de votre signalement. Votre anonymat est garanti.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                placeholder="votre.email@exemple.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero de telephone
              </label>
              <input
                type="tel"
                name="telephone"
                placeholder="+229 XX XX XX XX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> Champs obligatoires
          </p>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Envoi en cours...' : 'Envoyer le signalement'}
          </button>
        </div>
      </form>
    </div>
  )
}
