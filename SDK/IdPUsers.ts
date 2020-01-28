import { logger } from "./logger";
import { errors } from "./errors";
import { Category } from "typescript-logging";
import { DynamoDB } from "./AWSDynamoDB";
import { eMailBL } from "./eMailBL";
import { readFileSync } from "fs";

var loggerObj: Category;

export class idpusers {
  private usersDB: DynamoDB;
  private emailfrom: string;

  private port: number;
  private sdkurl: string;

  constructor(port: number, sdkurl: string) {
    this.port = port;
    this.sdkurl = sdkurl;

    loggerObj = logger.InitializeLogger("IdPUsers");
    this.usersDB = new DynamoDB();
    let data = readFileSync("./IdPSettings.json");
    let settings = JSON.parse(data.toString());
    this.emailfrom = settings.emailfrom;
  }
  public addnewuser(req: any, res: any) {
    loggerObj.trace("Enter addnewuser(req.body: )" + req.body);

    try {
      let user = req.body;
      let useremail = user.useremail;
      let userpassword = user.userpassword;
      this.usersDB.userExist(
        useremail,
        (error: Number, currentuser: any): void => {
          if (error == errors.ErrorCodeOK) {
            if (currentuser && currentuser.useremail == user.useremail) {
              res.send(errors.addNewUserExist());
            } else {
              user.confirmed = "false";
              this.usersDB.addUser(user, (error: Number): void => {
                if (error == errors.ErrorCodeOK) {
                  let emailbl = new eMailBL();
                  emailbl.sendMessage(
                    this.emailfrom,
                    req.body.useremail,
                    "Confirmation email",
                    '<html><body><h1>Confirmation email</h1><p>Please click on the link to <a href="http:/' +
                      this.sdkurl +
                      ":" +
                      this.port +
                      "/confirmuser/" +
                      useremail +
                      "/" +
                      userpassword +
                      '">confirm</a> your email</p></body></html>',
                    (error: Number): void => {
                      if (error == errors.ErrorCodeOK) {
                        res.send(errors.addNewUserSendEmail());
                      } else {
                        res.send(errors.addNewUserFailed());
                      }
                    }
                  );
                } else {
                  res.send(errors.addNewUserFailed());
                }
              });
            }
          } else {
            res.send(errors.addNewUserFailed());
          }
        }
      );
    } catch (e) {
      loggerObj.trace("Error - " + e);
      res.send(-1);
    }
    loggerObj.trace("Exit addnewuser()");
  }
  public confirmnewuser(req: any, res: any) {
    loggerObj.trace("Enter confirmnewuser(req.body: )" + req.body);

    try {
      let user = req.body;
      if (typeof req.params.useremail !== "undefined") {
        user = req.params;
      }
      user.confirmed = "true";
      this.usersDB.confirmnewUser(user, (error: Number): void => {
        if (error == errors.ErrorCodeOK) {
          res.send(errors.OK());
        } else {
          res.send(errors.confirmNewUserFailed());
        }
      });
    } catch (e) {
      loggerObj.trace("Error - " + e);
      res.send(-1);
    }
    loggerObj.trace("Exit confirmnewuser()");
  }
  public forgetpassword(req: any, res: any) {
    loggerObj.trace("Enter forgetpassword(req.body: )" + req.body);

    try {
      let user = req.body;
      this.usersDB.forgetpassword(
        user.useremail,
        (error: Number, forgetpasswordsession: string): void => {
          if (error == errors.ErrorCodeOK) {
            let emailbl = new eMailBL();
            emailbl.sendMessage(
              this.emailfrom,
              req.body.useremail,
              "Forget Password",
              "<h1>Forget Password</h1><p>Use the following as your recover session when using the Recover Password http POST: " +
                forgetpasswordsession +
                "</p>",
              (error: Number): void => {
                if (error == errors.ErrorCodeOK) {
                  res.send(errors.OK());
                } else {
                  res.send(errors.OK());
                }
              }
            );
          } else {
            res.send(errors.OK());
          }
        }
      );
    } catch (e) {
      loggerObj.trace("Error - " + e);
      res.send(-1);
    }
    loggerObj.trace("Exit forgetpassword()");
  }
  public getuser(req: any, res: any) {
    loggerObj.trace("Enter getuser(req.body: )" + req.body);
    let usersession: string = req.header("usersession");
    try {
      let useremail = req.params.useremail;
      this.usersDB.getUser(
        useremail,
        usersession,
        (error: Number, currentuser: any): void => {
          if (error == errors.ErrorCodeOK) {
            var params = {
              errorcode: error,
              user: currentuser
            };
            res.send(JSON.stringify(params));
          } else {
            res.send(errors.getUserFailed());
          }
        }
      );
    } catch (e) {
      loggerObj.trace("Error - " + e);
      res.send(-1);
    }
    loggerObj.trace("Exit getuser()");
  }
  public deleteuser(req: any, res: any) {
    loggerObj.trace("Enter deleteuser(req.body: )" + req.body);

    try {
      let useremail = req.params.useremail;
      this.usersDB.deleteUser(useremail, (error: Number): void => {
        if (error == errors.ErrorCodeOK) {
          res.send(errors.OK());
        } else {
          res.send(errors.deleteUserFailed());
        }
      });
    } catch (e) {
      loggerObj.trace("Error - " + e);
      res.send(-1);
    }
    loggerObj.trace("Exit deleteuser()");
  }
  public login(req: any, res: any) {
    loggerObj.trace("Enter login(req.body: )" + req.body);

    try {
      let user = req.body;
      let useremail = user.useremail;
      let userpassword = user.userpassword;
      this.usersDB.login(
        useremail,
        userpassword,
        (error: Number, usersession: string): void => {
          if (error == errors.ErrorCodeOK) {
            var params = {
              errorcode: error,
              usersession: usersession
            };
            res.send(JSON.stringify(params));
          } else {
            res.send(errors.LoginFailed());
          }
        }
      );
    } catch (e) {
      loggerObj.trace("Error - " + e);
      res.send(-1);
    }
    loggerObj.trace("Exit login()");
  }
  public recoverpassword(req: any, res: any) {
    loggerObj.trace("Enter login(req.body: )" + req.body);

    try {
      let user = req.body;
      let useremail = user.useremail;
      let recoversession = user.recoversession;
      let newpassword = user.newpassword;
      this.usersDB.recoverpassword(
        useremail,
        newpassword,
        recoversession,
        (error: Number): void => {
          if (error == errors.ErrorCodeOK) {
            res.send(errors.OK());
          } else {
            res.send(errors.RecoverFailed());
          }
        }
      );
    } catch (e) {
      loggerObj.trace("Error - " + e);
      res.send(-1);
    }
    loggerObj.trace("Exit login()");
  }
}
