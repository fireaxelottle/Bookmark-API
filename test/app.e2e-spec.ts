import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto } from '../src/bookmark/dto';
describe('App e2e', () => {
  let app: INestApplication;
  beforeAll(async () => {
    let prisma: PrismaService;
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDB();
  });

  afterAll(() => {
    app.close();
  });

  let baseUrl = 'http://localhost:3333/';

  describe('Auth', () => {
    //
    const dto: AuthDto = {
      email: 'email232@gmail.com',
      password: '12e12',
    };
    //
    describe('Signup', () => {
      //
      // //
      it('should not signup <No Email>', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      //
      it('should not signup <No Dto>', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/signup')
          .expectStatus(400);
      });
      //
      it('should not signup <No Password>', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/signup')
          .withBody({ email: dto.password })
          .expectStatus(400);
      });
      //
      it('should signup', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      //
      it('should not login <No Email>', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/login')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      //
      it('should not login <No Dto>', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/login')
          .expectStatus(400);
      });
      //
      it('should not login <No Password>', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/login')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      //
      it('should login', () => {
        return pactum
          .spec()
          .post(baseUrl + 'auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      //
    });
    //
  });

  describe('User', () => {
    ////
    describe('Get Me', () => {
      //
      it('should get user', () => {
        return pactum
          .spec()
          .get(baseUrl + 'users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
      //
      it('should not get user <No Autherization>', () => {
        return pactum
          .spec()
          .get(baseUrl + 'users/me')
          .expectStatus(401);
      });
      //
    });
    ////
    describe('Edit Me', () => {
      //
      it('should edit user', () => {
        const dto: EditUserDto = {
          email: 'user@gmail.com',
          firstName: 'Ali',
        };
        return pactum
          .spec()
          .patch(baseUrl + 'users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
      //
      it('should not edit user <No Autherization>', () => {
        const dto: EditUserDto = {
          email: 'user@gmail.com',
          firstName: 'Ali',
        };
        return pactum
          .spec()
          .patch(baseUrl + 'users/me')
          .withBody(dto)
          .expectStatus(401);
      });
    });
  });

  describe('Bookmarks', () => {
    /////
    describe('Get empty Bookmarks', () => {
      it('Give Empty Bookmarks' , ()=>{
        return pactum
        .spec()
        .get(baseUrl + 'bookmarks/all')
         .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      })
    });
    ////
    describe('Create Bookmark', () => {
      //
      const dto : CreateBookmarkDto = {
        title: "First",
        url: "https://www.youtube.com/watch?v=GHTA143_b-s"
      } 
      //
      it('Should Create Bookmark' , ()=>{
        return pactum
        .spec()
        .post(baseUrl + 'bookmarks/create')
         .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      })
    });
    ////
     describe('Get Bookmarks', () => {
      it('Give  Bookmarks' , ()=>{
        return pactum
        .spec()
        .get(baseUrl + 'bookmarks/all')
        .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
        .expectStatus(200)
        .expectJsonLength(1);
      })
    });
    ////  
    describe('Edit Bookmark by id', () => {
      const dto : CreateBookmarkDto = {
        title: "First Bookmark",
        description: "asdasdasdadasdadasdasd",
        url: "https://www.youtube.com/watch?v=GHTA143_b-s"
      } 
      //
      it('Should Edit Bookmark' , ()=>{
        return pactum
        .spec()
        .patch(baseUrl + 'bookmarks/$S{bookmarkId}')
         .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          
      })
    });

   

    describe('Get Bookmark by id', () => {
      it('Give  Bookmark by id' , ()=>{
        return pactum
        .spec()
        .get(baseUrl + 'bookmarks/$S{bookmarkId}')
        .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
      })
    });

  
    describe('Delete Bookmark by id', () => {
       it('Delete Bookmark by id' , ()=>{
        return pactum
        .spec()
        .delete(baseUrl + 'bookmarks/$S{bookmarkId}')
        .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
      })
    });
  });
});
