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
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(+id, updateSectionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(+id);
  }
}
