import { PartialType } from "@nestjs/swagger";
import { CreateDeliveryAreaDto } from "./create-delivery-area.dto";

export class UpdateDeliveryAreaDto extends PartialType(CreateDeliveryAreaDto) {}
