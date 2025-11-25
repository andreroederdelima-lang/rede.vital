import { describe, it, expect } from 'vitest';
import { getDb, criarMedico, atualizarMedico, buscarMedicoPorId } from './db';

describe('Testes de Integração - Fluxos Completos', () => {
  it('deve criar médico com todos os campos obrigatórios', async () => {
    const db = await getDb();
    if (!db) {
      console.log('⚠️  Banco de dados não disponível - pulando teste');
      return;
    }

    const novoMedico = {
      nome: 'Dr. Teste Integração',
      especialidade: 'Cardiologia',
      municipio: 'Timbó',
      tipoAtendimento: 'presencial' as const,
      endereco: 'Rua Teste, 123',
      whatsappSecretaria: '(47) 99999-9999',
      fotoUrl: 'https://example.com/foto.jpg',
      whatsappParceria: '(47) 98888-8888',
      contatoParceria: 'Maria Teste',
      valorParticular: '200.00',
      valorAssinanteVital: '150.00',
      ativo: true
    };

    const id = await criarMedico(novoMedico);
    expect(id).toBeGreaterThan(0);

    // Buscar médico criado
    const medico = await buscarMedicoPorId(id);
    expect(medico).toBeDefined();
    expect(medico?.nome).toBe('Dr. Teste Integração');
    expect(medico?.valorParticular).toBe('200.00');
    expect(medico?.valorAssinanteVital).toBe('150.00');

    console.log('✅ Médico criado com sucesso! ID:', id);
  });

  it('deve atualizar dados de médico existente', async () => {
    const db = await getDb();
    if (!db) {
      console.log('⚠️  Banco de dados não disponível - pulando teste');
      return;
    }

    // Criar médico para testar atualização
    const id = await criarMedico({
      nome: 'Dr. Para Atualizar',
      especialidade: 'Clínico Geral',
      municipio: 'Timbó',
      tipoAtendimento: 'presencial' as const,
      endereco: 'Rua Original, 456',
      whatsappSecretaria: '(47) 99999-9999',
      fotoUrl: 'https://example.com/foto.jpg',
      whatsappParceria: '(47) 98888-8888',
      contatoParceria: 'João Original',
      valorParticular: '180.00',
      valorAssinanteVital: '140.00',
      ativo: true
    });

    // Atualizar dados
    await atualizarMedico(id, {
      endereco: 'Rua Atualizada, 789',
      valorParticular: '220.00',
      valorAssinanteVital: '170.00'
    });

    // Verificar atualização
    const medicoAtualizado = await buscarMedicoPorId(id);
    expect(medicoAtualizado?.endereco).toBe('Rua Atualizada, 789');
    expect(medicoAtualizado?.valorParticular).toBe('220.00');
    expect(medicoAtualizado?.valorAssinanteVital).toBe('170.00');

    console.log('✅ Médico atualizado com sucesso!');
  });
});
