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
    const token = this.tokenRepository.create(createTokenDto);
    return await this.tokenRepository.save(token);
  }

  async findAll(): Promise<Token[]> {
    return await this.tokenRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Token | null> {
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

  async assignPermissions(tokenId: string, permissionIds: number[]): Promise<void> {
    // Este método necesitará una tabla de relación token_permissions
    // Por ahora, lo dejamos como stub
    console.log(`Assigning permissions ${permissionIds} to token ${tokenId}`);
  }

  async update(id: string, updateTokenDto: UpdateTokenDto): Promise<Token | null> {
    await this.tokenRepository.update(id, updateTokenDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tokenRepository.delete(id);
  }
}
