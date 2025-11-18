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

  async create(createTokenDto: CreateTokenDto): Promise<Token> {
    const uniqueId = await this.generateUniqueId();

    const token = this.tokenRepository.create({
      id: uniqueId,
      ...createTokenDto,
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

  async findByPlatform(platform: string): Promise<Token[]> {
    return await this.tokenRepository.find({ where: { platform } });
  }

  async update(id: number, updateTokenDto: UpdateTokenDto): Promise<Token | null> {
    await this.tokenRepository.update(id, updateTokenDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tokenRepository.delete(id);
  }
}
