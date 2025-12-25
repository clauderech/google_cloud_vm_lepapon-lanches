/**
 * Script de debug para verificar se as variáveis de ambiente estão sendo carregadas
 */

require('dotenv').config();

console.log('\n========================================');
console.log('🔍 DEBUG - Verificando Variáveis de Ambiente');
console.log('========================================\n');

// Variáveis esperadas
const requiredVars = [
  'WHATSAPP_VERIFY_TOKEN',
  'WHATSAPP_PHONE_ID',
  'WHATSAPP_BUSINESS_ACCOUNT_ID',
  'WHATSAPP_ACCESS_TOKEN',
  'PORT'
];

console.log('✅ VARIÁVEIS CARREGADAS:\n');

let allLoaded = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  
  if (value) {
    // Mostrar apenas os primeiros e últimos caracteres por segurança
    let displayValue = value;
    
    if (varName.includes('TOKEN') || varName.includes('ACCESS')) {
      displayValue = value.substring(0, 20) + '...' + value.substring(value.length - 10);
    }
    
    console.log(`✓ ${varName}`);
    console.log(`  Valor: ${displayValue}`);
    console.log(`  Tamanho: ${value.length} caracteres\n`);
  } else {
    console.log(`✗ ${varName}`);
    console.log(`  ❌ NÃO CARREGADO\n`);
    allLoaded = false;
  }
});

console.log('========================================\n');

if (allLoaded) {
  console.log('✅ RESULTADO: Todas as variáveis foram carregadas corretamente!\n');
  console.log('🚀 Você está pronto para iniciar a aplicação.\n');
  process.exit(0);
} else {
  console.log('❌ RESULTADO: Algumas variáveis não foram carregadas!\n');
  console.log('⚠️  VERIFIQUE:\n');
  console.log('1. O arquivo .env existe em: ./google_cloud_vm_lepapon-lanches/.env');
  console.log('2. As variáveis estão definidas no arquivo');
  console.log('3. Não há espaços extra ou caracteres especiais\n');
  
  // Verificar se o arquivo existe
  const fs = require('fs');
  const envPath = './.env';
  
  if (fs.existsSync(envPath)) {
    console.log('📂 Arquivo .env encontrado em:');
    console.log(`   ${envPath}\n`);
    
    // Mostrar conteúdo (mascarado)
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      console.log('📝 Variáveis definidas no arquivo:');
      lines.forEach(line => {
        const [key] = line.split('=');
        console.log(`   - ${key}`);
      });
    } catch (error) {
      console.log('⚠️  Erro ao ler arquivo:', error.message);
    }
  } else {
    console.log('❌ Arquivo .env NÃO encontrado em:');
    console.log(`   ${envPath}\n`);
  }
  
  process.exit(1);
}
