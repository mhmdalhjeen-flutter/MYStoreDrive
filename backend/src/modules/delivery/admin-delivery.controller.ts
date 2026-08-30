import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { DeliveryService } from "./delivery.service";
import { CreateDeliveryAreaDto } from "./dtos/create-delivery-area.dto";
import { UpdateDeliveryAreaDto } from "./dtos/update-delivery-area.dto";
import { UserRole } from "../users/enums/user-role.enum";

@Controller("admin/delivery/areas")
@Roles(UserRole.ADMIN)
export class AdminDeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async findAll() {
    return this.deliveryService.getAllAreas();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.deliveryService.getAreaById(id);
  }

  @Post()
  async create(@Body() createDeliveryAreaDto: CreateDeliveryAreaDto) {
    return this.deliveryService.create(createDeliveryAreaDto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateDeliveryAreaDto: UpdateDeliveryAreaDto,
  ) {
    return this.deliveryService.update(id, updateDeliveryAreaDto);
  }

  @Patch(":id/activate")
  async activate(@Param("id") id: string) {
    return this.deliveryService.setActive(id, true);
  }

  @Patch(":id/deactivate")
  async deactivate(@Param("id") id: string) {
    return this.deliveryService.setActive(id, false);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.deliveryService.remove(id);
  }
}
