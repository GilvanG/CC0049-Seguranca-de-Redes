import jsonwebtoken from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;


export const AuthMiddleware = (request, response, next) => {
    const { authorization } = request.headers;

    if (request.url === "/api/user/login" || request.url === "/api/user/create" && request.method === "POST") {
        return next()
    }

    if (!authorization) {
        return response.status(401).send({ message: "Authorization not found" });
    }

    const [, token] = authorization.split(" ");

    try {
        const payload = jsonwebtoken.verify(token, JWT_SECRET);
        
        request.user = payload;
    } catch (error) {
        return response.status(401).send({ message: "Token Invalid" });
    }

    next();
}