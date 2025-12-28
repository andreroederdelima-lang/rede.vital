import { describe, it, expect } from 'vitest';
import { listarProcedimentosPorSolicitacao, criarProcedimentoSolicitacao, atualizarProcedimentoSolicitacao, excluirProcedimentoSolicitacao } from './db';

describe('Admin - Gerenciamento de Procedimentos em Solicitações', () => {
  it('deve listar procedimentos de uma solicitação', async () => {
    // Simula uma solicitação com ID 1
    const procedimentos = await listarProcedimentosPorSolicitacao(1);
    
    expect(Array.isArray(procedimentos)).toBe(true);
    // Se houver procedimentos, verifica estrutura
    if (procedimentos.length > 0) {
      expect(procedimentos[0]).toHaveProperty('id');
      expect(procedimentos[0]).toHaveProperty('nome');
      expect(procedimentos[0]).toHaveProperty('valorParticular');
      expect(procedimentos[0]).toHaveProperty('valorAssinante');
    }
  });

  it('deve criar um novo procedimento para solicitação', async () => {
    const novoProcedimento = {
      solicitacaoId: 1,
      nome: 'Teste Procedimento Admin',
      valorParticular: '150.00',
      valorAssinante: '100.00',
    };

    const id = await criarProcedimentoSolicitacao(novoProcedimento);
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);

    // Limpar após teste
    await excluirProcedimentoSolicitacao(id);
  });

  it('deve atualizar um procedimento existente', async () => {
    // Criar procedimento de teste
    const novoProcedimento = {
      solicitacaoId: 1,
      nome: 'Procedimento para Atualizar',
      valorParticular: '100.00',
      valorAssinante: '80.00',
    };
    const id = await criarProcedimentoSolicitacao(novoProcedimento);

    // Atualizar
    await atualizarProcedimentoSolicitacao(id, {
      nome: 'Procedimento Atualizado',
      valorParticular: '120.00',
    });

    // Verificar
    const procedimentos = await listarProcedimentosPorSolicitacao(1);
    const atualizado = procedimentos.find((p: any) => p.id === id);
    expect(atualizado?.nome).toBe('Procedimento Atualizado');
    expect(atualizado?.valorParticular).toBe('120.00');

    // Limpar
    await excluirProcedimentoSolicitacao(id);
  });

  it('deve excluir um procedimento', async () => {
    // Criar procedimento de teste
    const novoProcedimento = {
      solicitacaoId: 1,
      nome: 'Procedimento para Excluir',
      valorParticular: '100.00',
      valorAssinante: '80.00',
    };
    const id = await criarProcedimentoSolicitacao(novoProcedimento);

    // Excluir
    await excluirProcedimentoSolicitacao(id);

    // Verificar que foi excluído
    const procedimentos = await listarProcedimentosPorSolicitacao(1);
    const encontrado = procedimentos.find((p: any) => p.id === id);
    expect(encontrado).toBeUndefined();
  });
});
