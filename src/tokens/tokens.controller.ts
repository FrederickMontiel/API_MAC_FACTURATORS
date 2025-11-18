import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto, UpdateTokenDto } from './dto';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Get()
  findAll() {
    return this.tokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tokensService.findOne(+id);
  }

  @Get('platform/:platform')
  findByPlatform(@Param('platform') platform: string) {
    return this.tokensService.findByPlatform(platform);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
    return this.tokensService.update(+id, updateTokenDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tokensService.remove(+id);
  }
}
