import { describe, it, expect } from 'vitest';

describe('Cadastro de Indicador', () => {
  it('deve cadastrar indicador com sucesso via HTTP', async () => {
    const timestamp = Date.now();
    const email = `teste${timestamp}@vitest.com`;
    
    const response = await fetch('http://localhost:3000/api/trpc/indicacoes.cadastroPublico?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        0: {
          input: {
            tipo: 'promotor',
            nome: 'Teste Vitest',
            email,
            telefone: '(47) 99999-7777',
            pix: email,
          },
        },
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    expect(response.ok).toBe(true);
    
    if (Array.isArray(data)) {
      expect(data[0].result.data.success).toBe(true);
      expect(data[0].result.data.userId).toBeTypeOf('number');
    } else {
      expect(data.result.data.success).toBe(true);
      expect(data.result.data.userId).toBeTypeOf('number');
    }
  });
});
