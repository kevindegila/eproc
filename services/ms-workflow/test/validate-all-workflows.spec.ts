import * as fs from 'fs';
import * as path from 'path';
import { YamlParserService } from '../src/definitions/yaml-parser.service';

describe('Validation de tous les 22 workflows YAML', () => {
  let service: YamlParserService;
  const workflowsDir = path.join(__dirname, '..', 'workflows');

  beforeAll(() => {
    service = new YamlParserService();
  });

  const expectedWorkflows = [
    // PASSATION (3)
    'wf-dac',
    'wf-dac-modification',
    'wf-eclaircissement',
    // SOUMISSION (1)
    'wf-soumission',
    // EVALUATION (2)
    'wf-ouverture',
    'wf-evaluation',
    // CONTRAT (2)
    'wf-contrat',
    'wf-avenant',
    // EXECUTION (4)
    'wf-ordre-service',
    'wf-attachement',
    'wf-rapport-technique',
    'wf-reception',
    // PAIEMENT (4)
    'wf-avance',
    'wf-facture',
    'wf-penalites',
    'wf-garantie',
    // RECOURS (5)
    'wf-recours-prealable',
    'wf-recours-armp',
    'wf-arbitrage',
    'wf-conciliation',
    'wf-denonciation',
    // TRANSVERSES (1)
    'wf-inscription',
  ];

  it('devrait avoir exactement 22 fichiers YAML', () => {
    const files = fs.readdirSync(workflowsDir).filter((f) => f.endsWith('.yaml'));
    expect(files).toHaveLength(22);
  });

  for (const name of expectedWorkflows) {
    describe(`${name}.yaml`, () => {
      let yamlContent: string;
      let parsed: ReturnType<YamlParserService['parse']>;

      beforeAll(() => {
        const filePath = path.join(workflowsDir, `${name}.yaml`);
        yamlContent = fs.readFileSync(filePath, 'utf-8');
        parsed = service.parse(yamlContent);
      });

      it('devrait etre parsable et valide', () => {
        expect(parsed).toBeDefined();
        expect(parsed.nodes.length).toBeGreaterThanOrEqual(2);
        expect(parsed.transitions.length).toBeGreaterThanOrEqual(1);
      });

      it('devrait avoir exactement un noeud START', () => {
        const starts = parsed.nodes.filter((n) => n.type === 'START');
        expect(starts).toHaveLength(1);
      });

      it('devrait avoir au moins un noeud END', () => {
        const ends = parsed.nodes.filter((n) => n.type === 'END');
        expect(ends.length).toBeGreaterThanOrEqual(1);
      });

      it('devrait avoir au moins un noeud mandatory', () => {
        const mandatoryNodes = parsed.nodes.filter((n) => n.mandatory);
        expect(mandatoryNodes.length).toBeGreaterThanOrEqual(1);
      });

      it('ne devrait pas avoir de codes de noeud en doublon', () => {
        const codes = parsed.nodes.map((n) => n.code);
        const unique = new Set(codes);
        expect(unique.size).toBe(codes.length);
      });

      it('toutes les transitions doivent reference des noeuds existants', () => {
        const codes = new Set(parsed.nodes.map((n) => n.code));
        for (const t of parsed.transitions) {
          expect(codes.has(t.from)).toBe(true);
          expect(codes.has(t.to)).toBe(true);
        }
      });

      it('aucune transition ne doit partir d\'un noeud END', () => {
        const endCodes = new Set(
          parsed.nodes.filter((n) => n.type === 'END').map((n) => n.code),
        );
        for (const t of parsed.transitions) {
          expect(endCodes.has(t.from)).toBe(false);
        }
      });

      it('le noeud START doit avoir au moins une transition sortante', () => {
        const startCode = parsed.nodes.find((n) => n.type === 'START')!.code;
        const outgoing = parsed.transitions.filter((t) => t.from === startCode);
        expect(outgoing.length).toBeGreaterThanOrEqual(1);
      });
    });
  }
});
