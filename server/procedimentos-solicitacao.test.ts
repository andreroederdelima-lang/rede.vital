import { describe, it, expect, beforeAll } from 'vitest';
import { criarSolicitacaoParceria, criarProcedimentoSolicitacao, listarProcedimentosPorSolicitacao, transferirProcedimentosSolicitacaoParaInstituicao, listarProcedimentosPorInstituicao } from '../server/db';

describe('Procedimentos em Solicitações de Parceria', () => {
  let solicitacaoId: number;
  let instituicaoId: number;

  it('deve criar uma solicitação de parceria', async () => {
    solicitacaoId = await criarSolicitacaoParceria({
      tipoCredenciado: 'instituicao',
      nomeResponsavel: 'João Silva',
      nomeEstabelecimento: 'Clínica Teste Procedimentos',
      categoria: 'Clínica',
      cidade: 'Timbó',
      endereco: 'Rua Teste, 123',
      telefone: '(47) 99999-9999',
      whatsappSecretaria: '(47) 99999-9999',
      descontoPercentual: 15,
      status: 'pendente',
    });

    expect(solicitacaoId).toBeGreaterThan(0);
  });

  it('deve adicionar procedimentos à solicitação', async () => {
    const proc1Id = await criarProcedimentoSolicitacao({
      solicitacaoId,
      nome: 'Ultrassom Abdominal',
      valorParticular: '150.00',
      valorAssinante: '100.00',
    });

    const proc2Id = await criarProcedimentoSolicitacao({
      solicitacaoId,
      nome: 'Raio-X Tórax',
      valorParticular: '80.00',
      valorAssinante: '60.00',
    });

    expect(proc1Id).toBeGreaterThan(0);
    expect(proc2Id).toBeGreaterThan(0);
  });

  it('deve listar procedimentos da solicitação', async () => {
    const procedimentos = await listarProcedimentosPorSolicitacao(solicitacaoId);
    
    expect(procedimentos).toHaveLength(2);
    expect(procedimentos[0].nome).toBe('Ultrassom Abdominal');
    expect(procedimentos[1].nome).toBe('Raio-X Tórax');
  });

  it('deve transferir procedimentos para instituição aprovada', async () => {
    // Simular ID de instituição criada (normalmente viria de criarInstituicao)
    instituicaoId = 9999; // ID fictício para teste
    
    const resultado = await transferirProcedimentosSolicitacaoParaInstituicao(solicitacaoId, instituicaoId);
    
    expect(resultado.success).toBe(true);
    expect(resultado.count).toBe(2);
  });

  it('deve verificar procedimentos na instituição após transferência', async () => {
    const procedimentos = await listarProcedimentosPorInstituicao(instituicaoId);
    
    expect(procedimentos).toHaveLength(2);
    expect(procedimentos.some(p => p.nome === 'Ultrassom Abdominal')).toBe(true);
    expect(procedimentos.some(p => p.nome === 'Raio-X Tórax')).toBe(true);
  });
});
