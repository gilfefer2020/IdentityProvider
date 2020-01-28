import * as express from "express";
import { Application } from "express";
import { idpusers } from "./IdPUsers";
import * as bodyParser from "body-parser";
import * as cors from "cors";

class IdPMain {
  private app: Application;
  private idpusersObj: idpusers;

  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    let port = parseInt(process.env.port, 10);
    let sdkurl = process.env.sdkurl;
    this.idpusersObj = new idpusers(port, sdkurl);

    // Ping
    this.app.get("/", (req: any, res: any) => {
      res.send("<h4>I'm a live</h4>");
    });
    // Add new user
    this.app.post("/user", (req: any, res: any) => {
      this.idpusersObj.addnewuser(req, res);
    });
    // Get the user
    this.app.get("/user/:useremail", (req: any, res: any) => {
      this.idpusersObj.getuser(req, res);
    });
    // Delete the user
    this.app.delete("/user/:useremail", (req: any, res: any) => {
      this.idpusersObj.deleteuser(req, res);
    });
    // Confirm user
    this.app.post("/confirmuser", (req: any, res: any) => {
      this.idpusersObj.confirmnewuser(req, res);
    });
    this.app.get(
      "/confirmuser/:useremail/:userpassword",
      (req: any, res: any) => {
        this.idpusersObj.confirmnewuser(req, res);
      }
    );
    // Forget password
    this.app.post("/forgetpassword", (req: any, res: any) => {
      this.idpusersObj.forgetpassword(req, res);
    });
    // Recover password
    this.app.post("/recoverpassword", (req: any, res: any) => {
      this.idpusersObj.recoverpassword(req, res);
    });
    // The Login
    this.app.post("/login", (req: any, res: any) => {
      this.idpusersObj.login(req, res);
    });
    // Start to listen
    this.app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
  }
}

let IdPMain1 = new IdPMain();
