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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { CreateTokenDto, UpdateTokenDto } from './dto';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new token with random ID (100000-999999)' })
  @ApiResponse({ status: 201, description: 'Token created successfully' })
  @ApiResponse({ status: 409, description: 'Could not generate unique ID' })
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tokens' })
  @ApiResponse({ status: 200, description: 'List of all tokens' })
  findAll() {
    return this.tokensService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get token by ID' })
  @ApiParam({ name: 'id', description: 'Token ID', example: 123456 })
  @ApiResponse({ status: 200, description: 'Token found' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  findOne(@Param('id') id: string) {
    return this.tokensService.findOne(+id);
  }

  @Get('platform/:platform')
  @ApiOperation({ summary: 'Get tokens by platform' })
  @ApiParam({ name: 'platform', description: 'Platform name', example: 'byte-transfers' })
  @ApiResponse({ status: 200, description: 'List of tokens for the platform' })
  findByPlatform(@Param('platform') platform: string) {
    return this.tokensService.findByPlatform(platform);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update token' })
  @ApiParam({ name: 'id', description: 'Token ID', example: 123456 })
  @ApiResponse({ status: 200, description: 'Token updated successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
    return this.tokensService.update(+id, updateTokenDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete token' })
  @ApiParam({ name: 'id', description: 'Token ID', example: 123456 })
  @ApiResponse({ status: 204, description: 'Token deleted successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  remove(@Param('id') id: string) {
    return this.tokensService.remove(+id);
  }
}
