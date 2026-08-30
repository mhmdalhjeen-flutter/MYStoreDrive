import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { AnnouncementsService } from "./announcements.service";

@ApiTags("announcements")
@Controller("announcements")
@Public()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  findActive() {
    return this.announcementsService.findActivePublic();
  }
}
