import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface JwtPayload {
    sub: number; 
    email: string;
   
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy , 
    'jwt',
) {
    constructor(config: ConfigService) {
        const jwtSecret = config.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in configuration');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret, 
        });
    }

    async validate(payload: JwtPayload): Promise<{ id: number; email: string }> {
        
        return { 
            id: payload.sub, 
            email: payload.email 
        };
    }
}