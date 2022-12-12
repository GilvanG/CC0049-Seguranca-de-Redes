import CryptoJS from "crypto-js";
import jsonwebtoken from "jsonwebtoken";
import { mongoWrapper } from "../database/mongo.js";

class UserController {
  index(req, res) {
    res.json({ message: `Olá, ${req.user.username}` });
  }
  async create(req, res) {
    const username = req.body.username,
      password = req.body.password;
    const passwordCifrer =
      CryptoJS.AES.encrypt(password, process.env.KEY_HASH) + "";

    const userExist = await mongoWrapper
      .getModel("users")
      .findOne({ username: username });
    if (!userExist) {
      const _newUser = await mongoWrapper
        .getModel("users")
        .create({ username: username, password: passwordCifrer });
      return res.status(201).json({
        message: "Cadastro Feito com sucesso",
        user: { username: username },
      });
    }
    return res.status(406).json({
      message: `Selecione outro username, ${username} já está em uso`,
    });
  }

  async list(req, res) {
    const autohorizationIsValid = req.user.roles.find(
      (role) => role === "ADMINISTRATOR" || role === "READER"
    );
    if (autohorizationIsValid) {
      const users = await mongoWrapper.getModel("users").find();
      return res.send(users);
    }
    return res
      .status(401)
      .json({ message: "Você não tem Autorização para essa funcionalidade" });
  }

  async login(req, res) {
    const username = req.body.username,
      password = req.body.password;

    const user = await mongoWrapper
      .getModel("users")
      .findOne({ username: username });
    if (!user) {
      return res.status(409).json({ message: "Usuario ou senha incorreto" });
    }
    let passwordMongo = CryptoJS.AES.decrypt(
      user.password,
      process.env.KEY_HASH
    ).toString(CryptoJS.enc.Utf8);
    if (passwordMongo === password) {
      delete user["_doc"].password;
      delete user["_doc"].__v;
      delete user["_doc"]._id;
      passwordMongo = "";
      const token = jsonwebtoken.sign(
        { ...user["_doc"] },
        process.env.JWT_SECRET
      );
      return res.status(200).json({ ...user["_doc"], token });
    }
    return res.status(409).json({ message: "Username ou password incorreto" });
  }

  async insertRole(req, res) {
    const autohorizationIsValid = req.user.roles.find(
      (role) => role === "ADMINISTRATOR"
    );
    if (autohorizationIsValid) {
      const userInsertRole = req.body.username,
        role = req.body.role.toUpperCase();
      if (role === "ADMINISTRATOR") {
        return res.status(406).json({ message: "Invalid role" });
      }
      const user = await mongoWrapper
        .getModel("users")
        .findOne({ username: userInsertRole });
      if (!user) {
        return res.status(404).json({ message: "Usuario não encontrado" });
      }
      await mongoWrapper
        .getModel("users")
        .findOneAndUpdate(
          { username: userInsertRole, __v: user.__v },
          { roles: [...user.roles, role], __v: user.__v + 1 }
        );
      return res
        .status(202)
        .json({ message: `Papel de ${role} dado a ${user.username}` });
    }
    return res
      .status(401)
      .json({ message: "Você não tem Autorização para essa funcionalidade" });
  }
}

export default UserController;
