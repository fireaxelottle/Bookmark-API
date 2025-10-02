import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
    return bookmark;
  }

  async editBookmark(userId: number, dto: EditBookmarkDto, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.update({
      where: {
        userId,
        id: bookmarkId,
      },

      data: {
        ...dto,
      },
    });
  }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
        id : bookmarkId,
      },
    });
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
   const deleted = this.prisma.bookmark.delete({
    where: {
      userId,
      id: bookmarkId,
    }
   });
   return deleted
  }
}
