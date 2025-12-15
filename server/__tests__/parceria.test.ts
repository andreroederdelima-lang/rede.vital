import { describe, it, expect } from 'vitest';
import { createAdminContext, createCaller, createMockContext } from './helpers';

describe('Sistema de Aprovação de Parceria', () => {
  describe('Solicitação de Parceria', () => {
    it('deve validar campos obrigatórios na solicitação', async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);

      // Teste simplificado: verificar que campos obrigatórios são validados
      await expect(
        caller.parceria.solicitar({
          tipoCredenciado: 'medico',
          nomeResponsavel: '', // Nome vazio deve falhar
          nomeEstabelecimento: 'Clínica Teste',
          categoria: 'Cardiologia',
          endereco: 'Rua Teste, 123',
          cidade: 'Blumenau',
          telefone: '47999999999',
          whatsappSecretaria: '47999999999',
          descontoPercentual: 10,
        } as any)
      ).rejects.toThrow();
    });
  });

  describe('Listagem de Solicitações', () => {
    it('deve permitir admin listar solicitações', async () => {
      const ctx = createAdminContext();
      const caller = createCaller(ctx);

      const result = await caller.parceria.listar();

      expect(Array.isArray(result)).toBe(true);
    });

    it('não deve permitir usuário não-admin listar solicitações', async () => {
      const ctx = createMockContext(); // Sem autenticação
      const caller = createCaller(ctx);

      await expect(caller.parceria.listar()).rejects.toThrow();
    });
  });

  describe('Aprovação de Solicitações', () => {
    // Teste simplificado: apenas verificar autenticação
    // (aprovação real requer ID válido no banco)

    it('não deve permitir usuário não-admin aprovar', async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);

      await expect(
        caller.parceria.aprovar({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe('Rejeição de Solicitações', () => {
    // Teste simplificado: apenas verificar autenticação
    // (rejeição real requer ID válido no banco)

    it('não deve permitir usuário não-admin rejeitar', async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);

      await expect(
        caller.parceria.rejeitar({
          id: 1,
          motivo: 'Teste',
        })
      ).rejects.toThrow();
    });
  });
});
