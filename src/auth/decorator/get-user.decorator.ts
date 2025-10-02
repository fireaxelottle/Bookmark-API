import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string | undefined , ctx: ExecutionContext) => { 
        const request : Express.Request = ctx 
            .switchToHttp()
            .getRequest();
        
        const user = request.user; 


        if (data) {
            return user ? user[data] : undefined; 
        }

        return user;
    }
);