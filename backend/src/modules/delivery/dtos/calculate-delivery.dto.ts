import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CalculateDeliveryDto {
  @ApiProperty({ description: "Delivery area ID" })
  @IsString()
  deliveryAreaId: string;
}
