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
import { SeccionesService } from './secciones.service';
import { CreateSeccionDto, UpdateSeccionDto } from './dto';

@Controller('secciones')
export class SeccionesController {
  constructor(private readonly seccionesService: SeccionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSeccionDto: CreateSeccionDto) {
    return this.seccionesService.create(createSeccionDto);
  }

  @Get()
  findAll() {
    return this.seccionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seccionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeccionDto: UpdateSeccionDto) {
    return this.seccionesService.update(+id, updateSeccionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.seccionesService.remove(+id);
  }
}
