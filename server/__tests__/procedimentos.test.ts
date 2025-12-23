import { describe, it, expect } from 'vitest';
import { createAdminContext, createCaller } from './helpers';

describe('Sistema de Procedimentos', () => {
  it('deve criar e listar procedimentos', async () => {
    const ctx = createAdminContext();
    const caller = createCaller(ctx);

    // Criar instituição de teste
    const inst = await caller.instituicoes.criar({
      nome: 'Clínica Teste Procedimentos',
      tipoServico: 'servicos_saude',
      categoria: 'clinica',
      municipio: 'Timbó',
      endereco: 'Rua Teste, 123',
      telefone: '(47) 3333-4444',
      whatsappSecretaria: '47999998888',
      email: 'clinica@teste.com',
      valorParticular: '150.00',
      valorAssinanteVital: '100.00',
      descontoPercentual: 33,
      observacoes: 'Clínica para teste',
      contatoParceria: 'João Silva',
      whatsappParceria: '47999997777',
    });

    // Criar procedimento
    const result = await caller.procedimentos.criar({
      instituicaoId: inst.id,
      nome: 'Endoscopia Digestiva Alta',
      valorParticular: '450.00',
      valorAssinanteVital: '350.00',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeTypeOf('number');

    // Listar procedimentos
    const procedimentos = await caller.procedimentos.listar({ instituicaoId: inst.id });
    expect(Array.isArray(procedimentos)).toBe(true);
    expect(procedimentos.length).toBeGreaterThan(0);
    expect(procedimentos[0]).toHaveProperty('nome');
  });

  it('deve atualizar procedimento', async () => {
    const ctx = createAdminContext();
    const caller = createCaller(ctx);

    // Criar instituição
    const inst = await caller.instituicoes.criar({
      nome: 'Clínica Teste 2',
      tipoServico: 'servicos_saude',
      categoria: 'laboratorio',
      municipio: 'Blumenau',
      endereco: 'Rua Teste, 456',
      telefone: '(47) 3333-5555',
      whatsappSecretaria: '47999997777',
      email: 'lab@teste.com',
      valorParticular: '200.00',
      valorAssinanteVital: '150.00',
      descontoPercentual: 25,
      observacoes: 'Lab teste',
      contatoParceria: 'Maria Silva',
      whatsappParceria: '47999996666',
    });

    // Criar procedimento
    const created = await caller.procedimentos.criar({
      instituicaoId: inst.id,
      nome: 'Colonoscopia',
      valorParticular: '550.00',
      valorAssinanteVital: '450.00',
    });

    // Atualizar
    const updated = await caller.procedimentos.atualizar({
      id: created.id,
      nome: 'Colonoscopia com Biópsia',
      valorParticular: '600.00',
    });

    expect(updated.success).toBe(true);
  });

  it('deve excluir procedimento', async () => {
    const ctx = createAdminContext();
    const caller = createCaller(ctx);

    // Criar instituição
    const inst = await caller.instituicoes.criar({
      nome: 'Clínica Teste 3',
      tipoServico: 'servicos_saude',
      categoria: 'clinica',
      municipio: 'Indaial',
      endereco: 'Rua Teste, 789',
      telefone: '(47) 3333-6666',
      whatsappSecretaria: '47999995555',
      email: 'clinica3@teste.com',
      valorParticular: '180.00',
      valorAssinanteVital: '130.00',
      descontoPercentual: 28,
      observacoes: 'Clínica 3',
      contatoParceria: 'Pedro Silva',
      whatsappParceria: '47999994444',
    });

    // Criar procedimento
    const created = await caller.procedimentos.criar({
      instituicaoId: inst.id,
      nome: 'Ultrassom',
      valorParticular: '200.00',
      valorAssinanteVital: '150.00',
    });

    // Excluir
    const deleted = await caller.procedimentos.excluir(created.id);
    expect(deleted.success).toBe(true);

    // Verificar que não aparece mais na lista
    const procedimentos = await caller.procedimentos.listar({ instituicaoId: inst.id });
    const encontrado = procedimentos.find((p: any) => p.id === created.id);
    expect(encontrado).toBeUndefined();
  });
});
