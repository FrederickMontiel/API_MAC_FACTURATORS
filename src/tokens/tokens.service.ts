import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { CreateTokenDto, UpdateTokenDto } from './dto';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  /**
   * Genera un ID aleatorio único entre 100000 y 999999
   */
  private async generateUniqueId(): Promise<number> {
    const MIN_ID = 100000;
    const MAX_ID = 999999;
    const MAX_ATTEMPTS = 100;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const randomId = Math.floor(Math.random() * (MAX_ID - MIN_ID + 1)) + MIN_ID;
      
      // Verificar si el ID ya existe
      const existingToken = await this.tokenRepository.findOne({
        where: { id: randomId },
      });

      if (!existingToken) {
        return randomId;
      }
    }

    throw new ConflictException(
      'No se pudo generar un ID único después de múltiples intentos',
    );
  }

  /**
   * Obtiene el siguiente número de token para una plataforma específica
   */
  async getNextPlatformTokenNumber(platformId: string): Promise<number> {
    const lastToken = await this.tokenRepository.findOne({
      where: { platformId },
      order: { platformTokenNumber: 'DESC' },
    });

    return lastToken ? lastToken.platformTokenNumber + 1 : 1;
  }

  async create(createTokenDto: CreateTokenDto): Promise<Token> {
    const uniqueId = await this.generateUniqueId();
    
    // Generar el número de token para la plataforma si no se proporciona
    const platformTokenNumber = createTokenDto.platformTokenNumber || 
      await this.getNextPlatformTokenNumber(createTokenDto.platformId);

    const token = this.tokenRepository.create({
      id: uniqueId,
      ...createTokenDto,
      platformTokenNumber,
    });

    return await this.tokenRepository.save(token);
  }

  async findAll(): Promise<Token[]> {
    return await this.tokenRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Token | null> {
    return await this.tokenRepository.findOne({ where: { id } });
  }

  async findByPlatform(platformId: string): Promise<Token[]> {
    return await this.tokenRepository.find({ 
      where: { platformId },
      order: { platformTokenNumber: 'ASC' },
    });
  }

  async findByJwt(jwt: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({ where: { jwt } });
  }

  async assignPermissions(tokenId: number, permissionIds: number[]): Promise<void> {
    // Este método necesitará una tabla de relación token_permissions
    // Por ahora, lo dejamos como stub
    console.log(`Assigning permissions ${permissionIds} to token ${tokenId}`);
  }

  async update(id: number, updateTokenDto: UpdateTokenDto): Promise<Token | null> {
    await this.tokenRepository.update(id, updateTokenDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tokenRepository.delete(id);
  }
}
