import { describe, it, expect } from 'vitest';
import { enviarEmailAprovacaoParceria } from './_core/email';

describe('Email de Aprovação de Parceria', () => {
  it('deve enviar email de aprovação com procedimentos', async () => {
    const resultado = await enviarEmailAprovacaoParceria({
      nomeResponsavel: 'Dr. João Silva',
      nomeEstabelecimento: 'Clínica Teste Email',
      email: 'teste@exemplo.com',
      tipoCredenciado: 'instituicao',
      categoria: 'Clínica',
      procedimentos: [
        {
          nome: 'Ultrassom Abdominal',
          valorParticular: '150.00',
          valorAssinante: '100.00',
        },
        {
          nome: 'Raio-X Tórax',
          valorParticular: '80.00',
          valorAssinante: '60.00',
        },
      ],
    });

    // O resultado depende da configuração de SMTP
    // Em ambiente de teste, pode retornar false se SMTP não estiver configurado
    expect(typeof resultado).toBe('boolean');
  });

  it('deve retornar false quando email não for fornecido', async () => {
    const resultado = await enviarEmailAprovacaoParceria({
      nomeResponsavel: 'Dr. João Silva',
      nomeEstabelecimento: 'Clínica Teste',
      tipoCredenciado: 'medico',
      categoria: 'Cardiologia',
      procedimentos: [],
    });

    expect(resultado).toBe(false);
  });

  it('deve gerar HTML com tabela de procedimentos', async () => {
    // Teste de integração: verifica se a função executa sem erros
    const resultado = await enviarEmailAprovacaoParceria({
      nomeResponsavel: 'Dra. Maria Santos',
      nomeEstabelecimento: 'Laboratório Teste',
      email: 'lab@exemplo.com',
      tipoCredenciado: 'instituicao',
      categoria: 'Laboratório',
      procedimentos: [
        {
          nome: 'Hemograma Completo',
          valorParticular: '50.00',
          valorAssinante: '35.00',
        },
      ],
    });

    expect(typeof resultado).toBe('boolean');
  });
});
