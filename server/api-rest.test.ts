import { describe, it, expect, beforeAll } from 'vitest';
import { criarApiKey, listarApiKeys, toggleApiKey, deletarApiKey, estatisticasApiKey } from '../server/db';

describe('API REST - Gerenciamento de API Keys', () => {
  let apiKeyId: number;
  let apiKeyString: string;

  it('deve criar uma nova API Key', async () => {
    const apiKey = await criarApiKey('Teste API Key', 'test-user');
    
    expect(apiKey).toBeDefined();
    expect(apiKey.nome).toBe('Teste API Key');
    expect(apiKey.apiKey).toBeDefined();
    expect(apiKey.apiKey.length).toBe(64); // 32 bytes em hex = 64 caracteres
    expect(apiKey.ativa).toBe(1);
    expect(apiKey.requestCount).toBe(0);
    
    apiKeyId = apiKey.id;
    apiKeyString = apiKey.apiKey;
  });

  it('deve listar todas as API Keys', async () => {
    const apiKeys = await listarApiKeys();
    
    expect(Array.isArray(apiKeys)).toBe(true);
    expect(apiKeys.length).toBeGreaterThan(0);
    
    const createdKey = apiKeys.find(k => k.id === apiKeyId);
    expect(createdKey).toBeDefined();
    expect(createdKey?.nome).toBe('Teste API Key');
  });

  it('deve buscar estatísticas de uma API Key', async () => {
    const stats = await estatisticasApiKey(apiKeyId);
    
    expect(stats).toBeDefined();
    expect(stats.totalRequests).toBe(0);
    expect(stats.avgResponseTime).toBe(0);
    expect(stats.successRate).toBe(0);
    expect(stats.lastUsed).toBeNull();
  });

  it('deve desativar uma API Key', async () => {
    await toggleApiKey(apiKeyId, false);
    
    const apiKeys = await listarApiKeys();
    const updatedKey = apiKeys.find(k => k.id === apiKeyId);
    
    expect(updatedKey?.ativa).toBe(0);
  });

  it('deve reativar uma API Key', async () => {
    await toggleApiKey(apiKeyId, true);
    
    const apiKeys = await listarApiKeys();
    const updatedKey = apiKeys.find(k => k.id === apiKeyId);
    
    expect(updatedKey?.ativa).toBe(1);
  });

  it('deve deletar uma API Key', async () => {
    await deletarApiKey(apiKeyId);
    
    const apiKeys = await listarApiKeys();
    const deletedKey = apiKeys.find(k => k.id === apiKeyId);
    
    expect(deletedKey).toBeUndefined();
  });
});

describe('API REST - Validação de Formato', () => {
  it('deve gerar API Keys únicas', async () => {
    const apiKey1 = await criarApiKey('Test 1', 'test');
    const apiKey2 = await criarApiKey('Test 2', 'test');
    
    expect(apiKey1.apiKey).not.toBe(apiKey2.apiKey);
    
    // Limpar
    await deletarApiKey(apiKey1.id);
    await deletarApiKey(apiKey2.id);
  });

  it('deve validar formato hexadecimal da API Key', async () => {
    const apiKey = await criarApiKey('Test Hex', 'test');
    
    // Regex para validar hex (apenas 0-9 e a-f)
    const hexRegex = /^[0-9a-f]{64}$/;
    expect(hexRegex.test(apiKey.apiKey)).toBe(true);
    
    // Limpar
    await deletarApiKey(apiKey.id);
  });
});
