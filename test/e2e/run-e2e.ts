/**
 * run-e2e.ts — Runner E2E : exécution du parcours complet
 *
 * Exécute séquentiellement les 8 phases du scénario en appelant
 * les APIs HTTP de chaque microservice. Peut fonctionner en 2 modes :
 *
 * 1. Mode "workflow-only" (par défaut) : utilise uniquement ms-workflow
 *    pour tester le chaînage des workflows sans dépendance aux autres services.
 *
 * 2. Mode "full" (--full) : appelle tous les microservices (IAM, planning,
 *    passation, submission, evaluation, contract, execution, payment, workflow).
 *
 * Usage:
 *   npx tsx test/e2e/run-e2e.ts              # workflow-only
 *   npx tsx test/e2e/run-e2e.ts --full       # full with all services
 */

import { SCENARIO, printScenarioSummary, type WorkflowPhase, type TransitionStep } from './scenario-marche-complet';
import { IDS, MARKET } from './seed-e2e';

const WORKFLOW_URL = process.env.MS_WORKFLOW_URL ?? 'http://localhost:3010';
const FULL_MODE = process.argv.includes('--full');

const BASE_URLS: Record<string, string> = {
  iam: process.env.MS_IAM_URL ?? 'http://localhost:3001',
  planning: process.env.MS_PLANNING_URL ?? 'http://localhost:3002',
  passation: process.env.MS_PASSATION_URL ?? 'http://localhost:3003',
  submission: process.env.MS_SUBMISSION_URL ?? 'http://localhost:3004',
  evaluation: process.env.MS_EVALUATION_URL ?? 'http://localhost:3005',
  contract: process.env.MS_CONTRACT_URL ?? 'http://localhost:3006',
  execution: process.env.MS_EXECUTION_URL ?? 'http://localhost:3007',
  payment: process.env.MS_PAYMENT_URL ?? 'http://localhost:3008',
  workflow: WORKFLOW_URL,
};

// ─── State tracking ──────────────────────────────────────────
interface PhaseResult {
  phase: number;
  name: string;
  workflow: string;
  instanceId: string;
  status: string;
  transitionCount: number;
  durationMs: number;
  events: unknown[];
}

const results: PhaseResult[] = [];
const createdIds: Record<string, string> = {};

// ─── HTTP Helpers ────────────────────────────────────────────
async function post(url: string, body: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST ${url} → ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function put(url: string, body: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PUT ${url} → ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function get(url: string): Promise<unknown> {
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

// ─── Workflow API Calls ──────────────────────────────────────

async function startWorkflow(phase: WorkflowPhase): Promise<string> {
  const payload = {
    entityType: phase.entityType,
    entityId: phase.entityId,
    procedureType: phase.procedureType,
    actorId: phase.startActorId,
    organisationId: IDS.ORG_MINSANTE,
    context: phase.context,
  };

  console.log(`    → POST /workflow-instances (entityType=${phase.entityType})`);
  const result = await post(`${WORKFLOW_URL}/workflow-instances`, payload) as { id: string };
  return result.id;
}

async function transitionWorkflow(
  instanceId: string,
  step: TransitionStep,
  phaseContext: Record<string, unknown>,
): Promise<unknown> {
  const mergedContext = { ...phaseContext, ...step.context };
  const payload: Record<string, unknown> = {
    action: step.action,
    actorId: step.actorId,
    context: mergedContext,
  };
  if (step.comment) payload.comment = step.comment;
  if (step.signatureId) payload.signatureId = step.signatureId;
  if (step.attachments) payload.attachments = step.attachments;

  console.log(`    → POST /workflow-instances/${instanceId}/transition  action=${step.action}  (${step.actorRole})`);
  return post(`${WORKFLOW_URL}/workflow-instances/${instanceId}/transition`, payload);
}

async function getInstanceState(instanceId: string): Promise<unknown> {
  return get(`${WORKFLOW_URL}/workflow-instances/${instanceId}/state`);
}

async function getInstanceHistory(instanceId: string): Promise<unknown> {
  return get(`${WORKFLOW_URL}/workflow-instances/${instanceId}/history`);
}

// ─── Service Call Execution ──────────────────────────────────

async function executeServiceCall(
  call: { service: string; method: string; path: string; body?: Record<string, unknown>; description: string },
) {
  if (!FULL_MODE) {
    console.log(`    [SKIP] ${call.description} (mode workflow-only)`);
    return;
  }

  const baseUrl = BASE_URLS[call.service];
  if (!baseUrl) {
    console.log(`    [WARN] Service "${call.service}" non configuré, skip`);
    return;
  }

  const url = `${baseUrl}${call.path}`;
  console.log(`    [${call.service.toUpperCase()}] ${call.description}`);

  if (call.method === 'POST') {
    return post(url, call.body ?? {});
  } else if (call.method === 'PUT') {
    return put(url, call.body ?? {});
  } else {
    return get(url);
  }
}

// ─── Phase Execution ─────────────────────────────────────────

async function executePhase(phase: WorkflowPhase): Promise<PhaseResult> {
  const start = Date.now();
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  PHASE ${phase.phase}: ${phase.name}`);
  console.log(`  Workflow: ${phase.workflow}  |  Entity: ${phase.entityType}:${phase.entityId}`);
  console.log(`${'═'.repeat(60)}`);

  // Execute before_workflow service calls
  for (const call of phase.serviceCalls?.filter((c) => c.when === 'before_workflow') ?? []) {
    await executeServiceCall(call);
  }

  // Start workflow instance
  const instanceId = await startWorkflow(phase);
  createdIds[`${phase.workflow}_instanceId`] = instanceId;
  console.log(`    Instance créée : ${instanceId}`);

  // Execute each transition
  let transitionCount = 0;
  for (const step of phase.transitions) {
    try {
      await transitionWorkflow(instanceId, step, phase.context);
      transitionCount++;

      // Execute service calls triggered after this transition
      const afterCalls = phase.serviceCalls?.filter(
        (c) => c.when === 'during' && c.afterTransition === step.action,
      ) ?? [];
      for (const call of afterCalls) {
        await executeServiceCall(call);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    ✗ ERREUR transition "${step.action}": ${msg}`);
      throw err;
    }
  }

  // Verify final state
  const state = await getInstanceState(instanceId) as { status: string; currentNode?: { code: string } };
  const history = await getInstanceHistory(instanceId) as unknown[];

  console.log(`\n    Résultat : status=${state.status}, noeud=${state.currentNode?.code ?? 'N/A'}`);
  console.log(`    Transitions exécutées : ${transitionCount}/${phase.transitions.length}`);
  console.log(`    Événements totaux : ${Array.isArray(history) ? history.length : 'N/A'}`);

  // Execute after_workflow service calls
  for (const call of phase.serviceCalls?.filter((c) => c.when === 'after_workflow') ?? []) {
    await executeServiceCall(call);
  }

  const duration = Date.now() - start;
  return {
    phase: phase.phase,
    name: phase.name,
    workflow: phase.workflow,
    instanceId,
    status: state.status,
    transitionCount,
    durationMs: duration,
    events: Array.isArray(history) ? history : [],
  };
}

// ─── DNCMP Task Queue Check ─────────────────────────────────

async function checkDncmpQueue() {
  console.log(`\n${'─'.repeat(60)}`);
  console.log('  VÉRIFICATION : File DNCMP transversale');
  console.log(`${'─'.repeat(60)}`);

  try {
    const allTasks = await get(
      `${WORKFLOW_URL}/workflow-instances/tasks?assigneeRole=DNCMP`,
    ) as { data: unknown[]; meta: { total: number } };
    console.log(`    Tâches DNCMP (toutes AC) : ${allTasks.meta.total}`);

    const orgTasks = await get(
      `${WORKFLOW_URL}/workflow-instances/tasks?assigneeRole=DNCMP&organisationId=${IDS.ORG_MINSANTE}`,
    ) as { data: unknown[]; meta: { total: number } };
    console.log(`    Tâches DNCMP (MinSanté)  : ${orgTasks.meta.total}`);
  } catch (err) {
    console.log(`    [SKIP] Endpoint tasks non disponible : ${err instanceof Error ? err.message : err}`);
  }
}

// ─── Final Verification ──────────────────────────────────────

function printFinalReport() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  RAPPORT FINAL');
  console.log(`${'═'.repeat(60)}\n`);

  const totalTransitions = results.reduce((acc, r) => acc + r.transitionCount, 0);
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);
  const allCompleted = results.every((r) => r.status === 'COMPLETED');

  console.log(`  Phases exécutées      : ${results.length}/${SCENARIO.length}`);
  console.log(`  Transitions totales   : ${totalTransitions}`);
  console.log(`  Statut global         : ${allCompleted ? 'SUCCÈS' : 'ÉCHEC'}`);
  console.log('');

  // Per-phase summary
  console.log('  ┌─────┬──────────────────────────────────────────┬───────────┬─────────────┐');
  console.log('  │ Ph. │ Nom                                      │ Statut    │ Transitions │');
  console.log('  ├─────┼──────────────────────────────────────────┼───────────┼─────────────┤');

  for (const r of results) {
    const name = r.name.padEnd(40).substring(0, 40);
    const status = r.status === 'COMPLETED' ? 'COMPLETED' : r.status.padEnd(9);
    const trans = `${r.transitionCount}`.padStart(5);
    console.log(`  │  ${r.phase}  │ ${name} │ ${status} │     ${trans}   │`);
  }

  console.log('  └─────┴──────────────────────────────────────────┴───────────┴─────────────┘');
  console.log('');

  // Actors involved
  const allActors = new Set<string>();
  for (const phase of SCENARIO) {
    for (const t of phase.transitions) {
      if (t.actorRole !== 'SYSTEM') allActors.add(t.actorRole);
    }
  }
  console.log(`  Acteurs impliqués : ${[...allActors].join(', ')}`);

  // Workflow chain
  const chain = SCENARIO.map((p) => p.workflow).join(' → ');
  console.log(`  Chaîne de workflows : ${chain}`);

  // DNCMP interventions
  const dncmpSteps = SCENARIO.flatMap((p) =>
    p.transitions.filter((t) => t.actorRole === 'DNCMP').map((t) => ({
      phase: p.phase,
      action: t.action,
    })),
  );
  console.log(`  Interventions DNCMP : ${dncmpSteps.length} (phases ${[...new Set(dncmpSteps.map((d) => d.phase))].join(', ')})`);

  if (!allCompleted) {
    console.log('\n  ⚠ Certaines phases ne sont pas COMPLETED :');
    for (const r of results.filter((r) => r.status !== 'COMPLETED')) {
      console.log(`    Phase ${r.phase} (${r.name}): ${r.status}`);
    }
    process.exit(1);
  }

  console.log('\n  Parcours complet terminé avec succès.\n');
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  printScenarioSummary();

  console.log(`Mode : ${FULL_MODE ? 'FULL (tous les microservices)' : 'WORKFLOW-ONLY (ms-workflow uniquement)'}`);
  console.log(`Workflow URL : ${WORKFLOW_URL}`);

  // Check workflow service health
  try {
    await get(`${WORKFLOW_URL}/health`);
    console.log('ms-workflow : OK');
  } catch {
    console.error('ERREUR : ms-workflow non joignable sur ' + WORKFLOW_URL);
    console.error('Démarrez le service avec : cd services/ms-workflow && npm run dev');
    process.exit(1);
  }

  // Execute each phase sequentially
  for (const phase of SCENARIO) {
    try {
      const result = await executePhase(phase);
      results.push(result);

      // Brief pause between phases
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`\n  ERREUR FATALE en phase ${phase.phase} (${phase.name}):`);
      console.error(`  ${err instanceof Error ? err.message : err}`);

      // Record partial result
      results.push({
        phase: phase.phase,
        name: phase.name,
        workflow: phase.workflow,
        instanceId: createdIds[`${phase.workflow}_instanceId`] ?? 'N/A',
        status: 'ERREUR',
        transitionCount: 0,
        durationMs: 0,
        events: [],
      });
      break;
    }
  }

  // Check DNCMP queue (non-blocking)
  await checkDncmpQueue().catch(() => {});

  // Final report
  printFinalReport();
}

main().catch((err) => {
  console.error('Erreur non gérée :', err);
  process.exit(1);
});
