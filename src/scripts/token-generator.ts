import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TokensService } from '../tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

async function generateToken() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const tokensService = app.get(TokensService);
  const dataSource = app.get(DataSource);

  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.error('\n❌ Error: Debe proporcionar la plataforma\n');
      console.log('Uso:');
      console.log('  pnpm run token:generate --platform PLATFORM_ID\n');
      console.log('Ejemplos:');
      console.log('  pnpm run token:generate --platform sitio-web-operaciones');
      console.log('  pnpm run token:generate --platform byte-transfers\n');
      console.log('Los permisos se asignan automáticamente según la plataforma configurada en la BD.\n');
      process.exit(1);
    }

    let platformId: string;

    // Verificar que el primer argumento sea --platform
    if (args[0] !== '--platform' || !args[1]) {
      console.error('\n❌ Error: El primer argumento debe ser --platform seguido del ID de la plataforma\n');
      process.exit(1);
    }

    platformId = args[1];

    // Verificar que la plataforma exista
    const platform = await dataSource.query(
      'SELECT * FROM platforms WHERE id = $1',
      [platformId]
    );

    if (!platform || platform.length === 0) {
      console.error(`\n❌ Error: La plataforma "${platformId}" no existe\n`);
      process.exit(1);
    }

    console.log(`\n✓ Plataforma encontrada: ${platform[0].name}`);

    // Obtener permisos asignados a la plataforma
    const platformPermissions = await dataSource.query(`
      SELECT p.id, p.code, p.name, p.description
      FROM platform_permissions pp
      INNER JOIN permissions p ON pp.permission_id = p.id
      WHERE pp.platform_id = $1
      ORDER BY p.id
    `, [platformId]);

    if (!platformPermissions || platformPermissions.length === 0) {
      console.error(`\n❌ Error: La plataforma "${platformId}" no tiene permisos asignados\n`);
      console.log('Configure los permisos en la tabla platform_permissions de la base de datos.\n');
      process.exit(1);
    }

    console.log(`✓ Permisos de la plataforma: ${platformPermissions.length} permisos encontrados`);

    // Obtener configuración
    const configService = app.get(ConfigService);
    const jwtSecret = configService.get<string>('JWT_SECRET') || 'default-secret-key-change-in-production';
    const jwtExpiration = configService.get<string>('JWT_EXPIRATION') || '90d';

    if (!jwtSecret || jwtSecret === 'default-secret-key-change-in-production') {
      console.warn('\n⚠️  Advertencia: Usando JWT_SECRET por defecto. Configure JWT_SECRET en .env\n');
    }

    // Generar UUID para el token
    const tokenUuid = uuidv4();
    
    // Obtener el siguiente número de token para la plataforma
    const platformTokenNumber = await tokensService.getNextPlatformTokenNumber(platformId);

    // Calcular fecha de expiración
    const expiresAt = new Date();
    if (jwtExpiration.endsWith('d')) {
      expiresAt.setDate(expiresAt.getDate() + parseInt(jwtExpiration));
    } else if (jwtExpiration.endsWith('h')) {
      expiresAt.setHours(expiresAt.getHours() + parseInt(jwtExpiration));
    }

    // Crear payload del JWT (SOLO UUID - todo lo demás se consulta desde BD)
    const payload = {
      uuid: tokenUuid,
    };

    // Generar JWT firmado
    const jwtToken = jwt.sign(
      payload, 
      jwtSecret as jwt.Secret, 
      { 
        expiresIn: jwtExpiration,
        issuer: 'facturador-api',
      } as jwt.SignOptions
    );
    
    // Crear el token en la base de datos
    const token = await tokensService.create({
      id: tokenUuid,
      platformId: platformId,
      platformTokenNumber: platformTokenNumber,
      isActive: true,
      expiresAt: expiresAt,
      jwt: jwtToken,
    });

    // Mostrar resultado
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Token JWT generado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nToken JWT: ${jwtToken}`);
    console.log(`\nUUID: ${token.id}`);
    console.log(`Plataforma: ${token.platformId} (${platform[0].name})`);
    console.log(`Número de token: ${token.platformTokenNumber}`);
    console.log(`Expira: ${expiresAt.toISOString()}`);
    console.log(`\nPermisos de la plataforma (${platformPermissions.length}):`);
    platformPermissions.forEach(p => {
      console.log(`  • ${p.code} - ${p.name}`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Los permisos se validan dinámicamente desde la BD en cada request.');
    console.log('   Para cambiar permisos, actualiza la tabla platform_permissions.\n');

  } catch (error) {
    console.error('\n❌ Error al generar token:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

generateToken();
