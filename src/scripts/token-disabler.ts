import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TokensService } from '../tokens/tokens.service';

async function disableToken() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const tokensService = app.get(TokensService);

  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('\n❌ Error: Debe proporcionar el token a deshabilitar\n');
      console.log('Uso:');
      console.log('  npm run token:disable -- <token-uuid>\n');
      console.log('Ejemplo:');
      console.log('  npm run token:disable -- a1b2c3d4-e5f6-7890-abcd-ef1234567890\n');
      process.exit(1);
    }

    const tokenValue = args[0];

    // Buscar el token por su valor JWT
    const token = await tokensService.findByJwt(tokenValue);

    if (!token) {
      console.error(`\n❌ Error: El token "${tokenValue}" no existe\n`);
      process.exit(1);
    }

    if (!token.isActive) {
      console.warn(`\n⚠️  Advertencia: El token ya estaba deshabilitado\n`);
      process.exit(0);
    }

    // Deshabilitar el token
    await tokensService.update(token.id, { isActive: false });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Token deshabilitado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nToken: ${tokenValue}`);
    console.log(`ID: ${token.id}`);
    console.log(`Plataforma: ${token.platformId}`);
    console.log(`Número de token: ${token.platformTokenNumber}`);
    console.log(`Estado: DESHABILITADO`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error al deshabilitar token:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

disableToken();
