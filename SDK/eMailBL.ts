import * as nodemailer from "nodemailer";
import { Transport } from "nodemailer";
import { errors } from "./errors";
import { readFileSync } from "fs";

export interface IEmailCallback {
  (error: number): void;
}
export class eMailBL {
  private transport: Transport;
  private smtphost: string;
  private smtpport: number;
  private smtpauthuser: string;
  private smtpauthpass: string;

  constructor() {
    let data = readFileSync("./IdPSettings.json");
    let settings = JSON.parse(data.toString());
    this.smtphost = settings.smtphost;
    this.smtpport = settings.smtpport;
    this.smtpauthuser = settings.smtpauthuser;
    this.smtpauthpass = settings.smtpauthpass;

    this.transport = nodemailer.createTransport({
      host: this.smtphost,
      port: this.smtpport,
      secure: false,
      transport: "ses",
      auth: {
        user: this.smtpauthuser,
        pass: this.smtpauthpass
      }
    });
  }
  public sendMessage(
    fromemail: string,
    toemail: string,
    subject: string,
    body: string,
    emailCallback: IEmailCallback
  ) {
    const message = {
      from: fromemail,
      to: toemail,
      subject: subject,
      html: body
    };
    this.transport.sendMail(message, function(err, info) {
      if (err) {
        emailCallback(errors.EmailBLFailedToSendEmailCode);
      } else {
        emailCallback(errors.ErrorCodeOK);
      }
    });
  }
}
