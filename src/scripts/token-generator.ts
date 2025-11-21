import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TokensService } from '../tokens/tokens.service';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
import { v4 as uuidv4 } from 'uuid';

async function generateToken() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const tokensService = app.get(TokensService);
  const rolesService = app.get(RolesService);
  const permissionsService = app.get(PermissionsService);

  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.error('\n❌ Error: Debe proporcionar la plataforma y los permisos o rol\n');
      console.log('Uso:');
      console.log('  npm run token:generate -- --platform PLATFORM_ID PERMISSION1,PERMISSION2');
      console.log('  npm run token:generate -- --platform PLATFORM_ID --role ROLE_NAME');
      console.log('  npm run token:generate -- --platform PLATFORM_ID 1,2,3 (IDs de permisos)\n');
      console.log('Ejemplos:');
      console.log('  npm run token:generate -- --platform sitio-web-operaciones --role API');
      console.log('  npm run token:generate -- --platform byte-transfers WS_TRANSACTIONS_VIEW,DEPOSIT_CASH\n');
      process.exit(1);
    }

    let permissionIds: number[] = [];
    let roleName: string | null = null;
    let platformId: string;

    // Verificar que el primer argumento sea --platform
    if (args[0] !== '--platform' || !args[1]) {
      console.error('\n❌ Error: El primer argumento debe ser --platform seguido del ID de la plataforma\n');
      process.exit(1);
    }

    platformId = args[1];

    // Verificar si es un rol
    if (args[2] === '--role' && args[3]) {
      roleName = args[3];
      const role = await rolesService.findByName(roleName);
      
      if (!role) {
        console.error(`\n❌ Error: El rol "${roleName}" no existe\n`);
        process.exit(1);
      }

      // Obtener permisos del rol (necesitarás implementar este método)
      const rolePermissions = await rolesService.findRolePermissions(role.id);
      permissionIds = rolePermissions.map(p => p.id);
      
      console.log(`\n✓ Rol encontrado: ${role.name}`);
    } else {
      // Procesar permisos (desde args[2] en adelante)
      const input = args.slice(2).join(' ').split(',').map(p => p.trim());
      
      // Verificar si son IDs numéricos o códigos
      const isNumeric = input.every(p => !isNaN(Number(p)));
      
      if (isNumeric) {
        permissionIds = input.map(Number);
        
        // Validar que existan los permisos
        for (const id of permissionIds) {
          const permission = await permissionsService.findOne(id);
          if (!permission) {
            console.error(`\n❌ Error: El permiso con ID ${id} no existe\n`);
            process.exit(1);
          }
        }
      } else {
        // Son códigos de permisos
        for (const code of input) {
          const permission = await permissionsService.findByCode(code);
          if (!permission) {
            console.error(`\n❌ Error: El permiso "${code}" no existe\n`);
            process.exit(1);
          }
          permissionIds.push(permission.id);
        }
      }
    }

    if (permissionIds.length === 0) {
      console.error('\n❌ Error: No se encontraron permisos válidos\n');
      process.exit(1);
    }

    // Generar token
    const tokenValue = uuidv4();
    const timestamp = Date.now();
    
    const token = await tokensService.create({
      id: timestamp,
      platformId: platformId,
      isActive: true,
      jwt: tokenValue,
    });

    // Asociar permisos al token (necesitarás implementar este método)
    await tokensService.assignPermissions(token.id, permissionIds);

    // Obtener información de permisos para mostrar
    const permissions = (await Promise.all(
      permissionIds.map(id => permissionsService.findOne(id))
    )).filter(p => p !== null);

    // Mostrar resultado
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Token generado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nToken: ${tokenValue}`);
    console.log(`ID: ${token.id}`);
    console.log(`Plataforma: ${token.platformId}`);
    console.log(`Número de token de plataforma: ${token.platformTokenNumber}`);
    if (roleName) {
      console.log(`Rol: ${roleName}`);
    }
    console.log(`\nPermisos asignados (${permissions.length}):`);
    permissions.forEach(p => {
      if (p) {
        console.log(`  • ${p.code} - ${p.name}`);
      }
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error al generar token:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

generateToken();
