import { BadRequestException } from '@nestjs/common';
import { YamlParserService } from '../src/definitions/yaml-parser.service';

describe('YamlParserService', () => {
  let service: YamlParserService;

  beforeEach(() => {
    service = new YamlParserService();
  });

  const validYaml = `
nodes:
  - code: START
    label: Début
    type: START
    mandatory: true
  - code: REDACTION_DAO
    label: Rédaction du DAO
    type: ACTION
    assignee_role: AGENT_PPM
    sla_hours: 48
    mandatory: true
  - code: VALIDATION_PPM
    label: Validation PPM
    type: ACTION
    assignee_role: PPM
    sla_hours: 24
  - code: END
    label: Fin
    type: END
transitions:
  - from: START
    to: REDACTION_DAO
    action: DEMARRER
    label: Démarrer
  - from: REDACTION_DAO
    to: VALIDATION_PPM
    action: SOUMETTRE
    label: Soumettre pour validation
    requires_comment: true
  - from: VALIDATION_PPM
    to: END
    action: VALIDER
    label: Valider
    requires_signature: true
  - from: VALIDATION_PPM
    to: REDACTION_DAO
    action: REJETER
    label: Rejeter
    requires_comment: true
`;

  describe('parse', () => {
    it('devrait parser un YAML valide', () => {
      const result = service.parse(validYaml);

      expect(result.nodes).toHaveLength(4);
      expect(result.transitions).toHaveLength(4);
      expect(result.nodes[0].code).toBe('START');
      expect(result.nodes[0].type).toBe('START');
      expect(result.nodes[1].assignee_role).toBe('AGENT_PPM');
      expect(result.nodes[1].sla_hours).toBe(48);
    });

    it('devrait rejeter un YAML syntaxiquement invalide', () => {
      expect(() => service.parse('{{invalid yaml')).toThrow(BadRequestException);
    });

    it('devrait rejeter un workflow sans nœud START', () => {
      const yaml = `
nodes:
  - code: ACTION1
    label: Action
    type: ACTION
  - code: END
    label: Fin
    type: END
transitions:
  - from: ACTION1
    to: END
    action: TERMINER
    label: Terminer
`;
      expect(() => service.parse(yaml)).toThrow('exactement un nœud START');
    });

    it('devrait rejeter un workflow sans nœud END', () => {
      const yaml = `
nodes:
  - code: START
    label: Début
    type: START
  - code: ACTION1
    label: Action
    type: ACTION
transitions:
  - from: START
    to: ACTION1
    action: DEMARRER
    label: Démarrer
`;
      expect(() => service.parse(yaml)).toThrow('au moins un nœud END');
    });

    it('devrait rejeter une transition vers un nœud inexistant', () => {
      const yaml = `
nodes:
  - code: START
    label: Début
    type: START
  - code: END
    label: Fin
    type: END
transitions:
  - from: START
    to: NOEUD_INCONNU
    action: ALLER
    label: Aller
`;
      expect(() => service.parse(yaml)).toThrow('nœud cible inexistant');
    });

    it('devrait rejeter une transition partant d\'un nœud END', () => {
      const yaml = `
nodes:
  - code: START
    label: Début
    type: START
  - code: END
    label: Fin
    type: END
transitions:
  - from: START
    to: END
    action: TERMINER
    label: Terminer
  - from: END
    to: START
    action: REBOUCLER
    label: Reboucler
`;
      expect(() => service.parse(yaml)).toThrow('nœud END');
    });

    it('devrait rejeter un workflow sans transitions', () => {
      const yaml = `
nodes:
  - code: START
    label: Début
    type: START
  - code: END
    label: Fin
    type: END
transitions: []
`;
      expect(() => service.parse(yaml)).toThrow(BadRequestException);
    });

    it('devrait parser les guards dans les transitions', () => {
      const yaml = `
nodes:
  - code: START
    label: Début
    type: START
  - code: DECISION
    label: Décision
    type: DECISION
  - code: END
    label: Fin
    type: END
transitions:
  - from: START
    to: DECISION
    action: DEMARRER
    label: Démarrer
  - from: DECISION
    to: END
    action: APPROUVER
    label: Approuver
    guard:
      field: montant
      operator: lte
      value: 50000000
`;
      const result = service.parse(yaml);
      expect(result.transitions[1].guard).toEqual({
        field: 'montant',
        operator: 'lte',
        value: 50000000,
      });
    });

    it('devrait parser les nœuds avec triggers et config', () => {
      const yaml = `
nodes:
  - code: START
    label: Début
    type: START
  - code: NOTIFICATION
    label: Notification
    type: SYSTEM
    triggers:
      email: true
      sms: false
    config:
      template: notification_dao
  - code: END
    label: Fin
    type: END
transitions:
  - from: START
    to: NOTIFICATION
    action: DEMARRER
    label: Démarrer
  - from: NOTIFICATION
    to: END
    action: CONTINUER
    label: Continuer
`;
      const result = service.parse(yaml);
      expect(result.nodes[1].triggers).toEqual({ email: true, sms: false });
      expect(result.nodes[1].config).toEqual({ template: 'notification_dao' });
    });
  });
});
