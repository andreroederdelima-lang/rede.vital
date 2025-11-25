import { describe, it, expect } from 'vitest';
import { validateMedicoForm, validateInstituicaoForm } from '../client/src/lib/validation';

describe('Validação de Formulários', () => {
  describe('validateMedicoForm', () => {
    it('deve retornar erros quando campos obrigatórios estão vazios', () => {
      const dadosIncompletos = {
        nome: '',
        municipio: '',
        tipoAtendimento: '',
        endereco: '',
        whatsappSecretaria: '',
        fotoUrl: '',
        whatsappParceria: '',
        contatoParceria: '',
        valorParticular: '',
        valorAssinanteVital: ''
      };

      const errors = validateMedicoForm(dadosIncompletos);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'nome')).toBe(true);
      expect(errors.some(e => e.field === 'valorParticular')).toBe(true);
      expect(errors.some(e => e.field === 'valorAssinanteVital')).toBe(true);
    });

    it('deve retornar array vazio quando todos os campos obrigatórios estão preenchidos', () => {
      const dadosCompletos = {
        nome: 'Dr. João Silva',
        municipio: 'Timbó',
        tipoAtendimento: 'presencial',
        endereco: 'Rua Principal, 123',
        whatsappSecretaria: '(47) 99999-9999',
        fotoUrl: 'https://example.com/foto.jpg',
        whatsappParceria: '(47) 98888-8888',
        contatoParceria: 'Maria Silva',
        valorParticular: 'R$ 200,00',
        valorAssinanteVital: 'R$ 150,00'
      };

      const errors = validateMedicoForm(dadosCompletos);
      expect(errors.length).toBe(0);
    });
  });

  describe('validateInstituicaoForm', () => {
    it('deve retornar erros quando campos obrigatórios estão vazios', () => {
      const dadosIncompletos = {
        nome: '',
        municipio: '',
        tipoAtendimento: '',
        endereco: '',
        whatsappSecretaria: '',
        fotoUrl: '',
        whatsappParceria: '',
        contatoParceria: '',
        valorParticular: '',
        valorAssinanteVital: ''
      };

      const errors = validateInstituicaoForm(dadosIncompletos);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve retornar array vazio quando todos os campos obrigatórios estão preenchidos', () => {
      const dadosCompletos = {
        nome: 'Clínica Saúde Total',
        municipio: 'Timbó',
        tipoAtendimento: 'presencial',
        endereco: 'Av. Brasil, 456',
        whatsappSecretaria: '(47) 99999-9999',
        fotoUrl: 'https://example.com/foto.jpg',
        whatsappParceria: '(47) 98888-8888',
        contatoParceria: 'Pedro Santos',
        valorParticular: 'R$ 300,00',
        valorAssinanteVital: 'R$ 250,00'
      };

      const errors = validateInstituicaoForm(dadosCompletos);
      expect(errors.length).toBe(0);
    });
  });
});
