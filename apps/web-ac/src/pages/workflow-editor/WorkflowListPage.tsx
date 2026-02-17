import { useNavigate } from 'react-router-dom'
import { CATEGORIES, WORKFLOWS, type CategoryId } from './data/workflow-catalog'

const CATEGORY_ICONS: Record<CategoryId, string> = {
  passation: '📋',
  attribution: '🏆',
  execution: '⚙️',
  paiement: '💰',
  recours: '⚖️',
  administration: '🏛️',
}

export default function WorkflowListPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Workflows réglementaires
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          22 workflows du Décret 2025-169 relatif aux marchés publics.
          Cliquez sur un workflow pour le visualiser et le modifier dans l'éditeur.
        </p>
      </div>

      {/* Categories */}
      {CATEGORIES.map((cat) => {
        const workflows = WORKFLOWS.filter((w) => w.category === cat.id)
        if (workflows.length === 0) return null

        return (
          <section key={cat.id}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{CATEGORY_ICONS[cat.id]}</span>
              <h2 className={`text-sm font-semibold uppercase tracking-wide ${cat.color}`}>
                {cat.label}
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bgColor} ${cat.color}`}>
                {workflows.length}
              </span>
            </div>

            {/* Workflow cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => navigate(`/workflow-editor/${wf.id}`)}
                  className={`
                    bg-white rounded-xl shadow-sm border border-gray-100
                    hover:shadow-md hover:border-gray-200
                    transition-all text-left p-4 group
                  `}
                >
                  {/* Top row: icon + node count */}
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-9 h-9 rounded-lg ${cat.iconBg} flex items-center justify-center`}>
                      <span className={`text-xs font-bold ${cat.color}`}>
                        {wf.nodeCount}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {wf.articleRef}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 mb-1">
                    {wf.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {wf.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 group-hover:text-gray-500">
                    <span>Ouvrir dans l'éditeur</span>
                    <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
