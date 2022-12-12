import { createConnection } from "mongoose";
import { UserSchema } from "../models/UserSchema.js";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 60000,
};

const connect = (mongoUri) => {
  if (mongoUri) {
    return createConnection(mongoUri, mongoOptions);
  } else {
    throw new DatabaseConnectionError();
  }
};

class MongoWrapper {
  connectMongo = (mongoUri) => {
    if (mongoUri) {
      return createConnection(mongoUri, mongoOptions);
    } else {
      throw new DatabaseConnectionError();
    }
  };
  _connections = new Map();

  async connectToMongo() {
    try {
      console.log(`[mongo] Criando conexão`);
      const connection = await connect(process.env.MONGO_URI);
      this._connections.set("segRedes", connection);
      console.log(`[mongo] Conectado ao DB`);
      return connection;
    } catch (err) {
      console.log(`[mongo] Erro ao conectar com Mongo`, err);
    }
  }

  // Retorna um Model
  getModel(modelName) {
    let tenantConn = this._connections.get("segRedes");

    return tenantConn.model(modelName, UserSchema);
  }
}

export const mongoWrapper = new MongoWrapper();
