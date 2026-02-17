import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/create-role.dto';

@ApiTags('Rôles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des rôles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un rôle' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un rôle' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un rôle' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un rôle' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Attribuer un rôle à un utilisateur' })
  assignRole(@Body() dto: AssignRoleDto) {
    return this.rolesService.assignRole(dto);
  }

  @Delete('revoke/:userId/:roleId')
  @ApiOperation({ summary: 'Révoquer un rôle d\'un utilisateur' })
  revokeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rolesService.revokeRole(userId, roleId);
  }
}
