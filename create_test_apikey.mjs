import { criarApiKey } from './server/db.js';

async function main() {
  try {
    const apiKey = await criarApiKey('Plataforma Cartão Benefícios - TESTE', 'admin');
    console.log('\n=== API KEY CRIADA COM SUCESSO ===\n');
    console.log('Nome:', apiKey.nome);
    console.log('API Key:', apiKey.apiKey);
    console.log('ID:', apiKey.id);
    console.log('Ativa:', apiKey.ativa ? 'Sim' : 'Não');
    console.log('Criada em:', apiKey.createdAt);
    console.log('\n=================================\n');
  } catch (error) {
    console.error('Erro ao criar API Key:', error);
  }
  process.exit(0);
}

main();
