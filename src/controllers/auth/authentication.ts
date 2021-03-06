import bcrypt from "bcrypt";
import { User } from "../../models/user";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";

export class Authentication {
  static initialize(app: any) {
    // passport 初期化
    app.use(passport.initialize());
    /*
    app.use(passport.session());

    passport.serializeUser(this.serializeUser);
    passport.deserializeUser(this.deserializeUser);
*/
  }
  /*
  static serializeUser(user: any, done: any) {
    console.log(`serialize: ${user}`);
    return done(null, user);
  }
  static deserializeUser(user: any, done: any) {
    console.log(`deserialize: ${user}`);

    User.findByPk(user.id)
      .then((user) => {
        return done(null, user);
      })
      .catch(() => {
        return done(null, false);
      });
  }
*/
  static verifyLocal(username: string, password: string, done: any) {
    User.findOne({
      where: {
        email: username,
        deleted_at: null,
      },
    })
      .then((user) => {
        if (user && bcrypt.compareSync(password, user.hash)) {
          const opts = {
            issuer: process.env.ISSUER,
            audience: process.env.AUDIENCE,
            expiresIn: process.env.EXPIRES,
          };
          const secret: string = process.env.SECRET || "secret";
          const token: string = jwt.sign(
            {
              email: user.email,
              id: user.id,
              user_name: user.last_name + " " + user.first_name,
            },
            secret,
            opts
          );
          return done(null, token);
        }
        return done(true, "authentication error");
      })
      .catch((err) => done(true, err));
  }

  static setLocalStrategy() {
    // passport.local の認証定義
    const field = {
      usernameField: "user",
      passwordField: "password",
    };
    passport.use(new LocalStrategy(field, this.verifyLocal));
  }
}
