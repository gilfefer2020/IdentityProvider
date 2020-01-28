import * as AWS from "aws-sdk";
import { errors } from "./errors";
import { Guid } from "guid-typescript";
import sha256, { Hash, HMAC } from "fast-sha256";
import { TextDecoder } from "text-encoding";

export interface IUserCallback {
  (error: Number): void;
}
export interface IGetUserCallback {
  (error: Number, user: object): void;
}
export interface IUserSessionCallback {
  (error: Number, usersession: string): void;
}

export class DynamoDB {
  private ddb: any;

  constructor() {
    AWS.config.loadFromPath("./AWSCredentials.json");
    this.ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
    var dtparams = {
      TableName: "users"
    };
    this.ddb.describeTable(dtparams, function(err, data) {
      if (err) {
        var ctparams = {
          AttributeDefinitions: [
            {
              AttributeName: "useremail",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "useremail",
              KeyType: "HASH"
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          TableName: "Users",
          StreamSpecification: {
            StreamEnabled: false
          }
        };

        let ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
        // Call DynamoDB to create the table
        ddb.createTable(ctparams, function(err, data) {
          if (err) {
          }
        });
      }
    });
  }
  addUser(user: any, userCallback: IUserCallback) {
    var params = {
      TableName: "Users",
      Item: {
        userfullname: user.userfullname,
        useremail: user.useremail,
        confirmed: user.confirmed,
        userpassword: user.userpassword
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.put(params, function(err, data) {
      if (err) {
        userCallback(errors.AWSDynamoDBFailedToAddItem);
      } else {
        userCallback(errors.ErrorCodeOK);
      }
    });
  }
  getUser(
    useremail: string,
    usersession: string,
    getUserCallback: IGetUserCallback
  ) {
    let usersDB: DynamoDB = new DynamoDB();
    usersDB.loginWithSession(useremail, usersession, (error: Number): void => {
      if (error == errors.ErrorCodeOK) {
        var params = {
          TableName: "Users",
          Key: {
            useremail: useremail
          }
        };
        var docClient = new AWS.DynamoDB.DocumentClient();
        docClient.get(params, function(err, data) {
          if (err) {
            getUserCallback(errors.AWSDynamoDBFailedToGetItem, null);
          } else {
            getUserCallback(errors.ErrorCodeOK, data.Item);
          }
        });
      } else {
        getUserCallback(errors.AWSDynamoDBFailedToGetItem, null);
      }
    });
  }
  userExist(useremail: string, getUserCallback: IGetUserCallback) {
    var params = {
      TableName: "Users",
      Key: {
        useremail: useremail
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.get(params, function(err, data) {
      if (err) {
        getUserCallback(errors.AWSDynamoDBFailedToGetItem, null);
      } else {
        getUserCallback(errors.ErrorCodeOK, data.Item);
      }
    });
  }
  deleteUser(useremail: string, userCallback: IUserCallback) {
    var params = {
      TableName: "Users",
      Key: {
        useremail: useremail
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.delete(params, function(err, data) {
      if (err) {
        userCallback(errors.AWSDynamoDBFailedToDeleteItem);
      } else {
        userCallback(errors.ErrorCodeOK);
      }
    });
  }
  login(
    useremail: string,
    userpassword: string,
    userSessionCallback: IUserSessionCallback
  ) {
    var params = {
      TableName: "Users",
      KeyConditionExpression: "#ue = :useremail",
      ExpressionAttributeNames: {
        "#up": "userpassword",
        "#ue": "useremail",
        "#cf": "confirmed"
      },
      FilterExpression: "#up= :userpassword and #cf= :confirmed",
      ExpressionAttributeValues: {
        ":useremail": useremail,
        ":userpassword": userpassword,
        ":confirmed": "true"
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.query(params, function(err, data) {
      if (err) {
        userSessionCallback(errors.AWSDynamoDBFailedToLoginCode, "");
      } else {
        if (data.Count == 0) {
          userSessionCallback(errors.AWSDynamoDBFailedToLoginCode, "");
        } else {
          // Create a session
          let usersDB: DynamoDB = new DynamoDB();
          usersDB.updateUserSession(
            useremail,
            userpassword,
            (error: Number, usersession: string): void => {
              userSessionCallback(error, usersession);
            }
          );
        }
      }
    });
  }
  loginWithSession(
    useremail: string,
    usersession: string,
    userCallback: IUserCallback
  ) {
    var params = {
      TableName: "Users",
      KeyConditionExpression: "#ue = :useremail",
      ExpressionAttributeNames: {
        "#us": "usersession",
        "#ue": "useremail"
      },
      FilterExpression: "#us= :usersession",
      ExpressionAttributeValues: {
        ":useremail": useremail,
        ":usersession": usersession
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.query(params, function(err, data) {
      if (err) {
        userCallback(errors.AWSDynamoDBFailedToLoginWithSessionCode);
      } else {
        if (data.Count == 0) {
          userCallback(errors.AWSDynamoDBFailedToLoginWithSessionCode);
        } else {
          userCallback(errors.ErrorCodeOK);
        }
      }
    });
  }
  updateUserSession(
    useremail: string,
    userpassword: string,
    userSessionCallback: IUserSessionCallback
  ) {
    let buffer: Buffer = new Buffer(Guid.create().toString());
    let usersessionsha256: Uint8Array = sha256(buffer);
    let buffer1: Buffer = new Buffer(usersessionsha256);
    let usersession: string = buffer1.toString("base64");
    var params = {
      TableName: "Users",
      Key: {
        useremail: useremail
      },
      UpdateExpression: "set usersession = :s",
      ConditionExpression: "#up= :userpassword",
      ExpressionAttributeValues: {
        ":s": usersession,
        ":userpassword": userpassword
      },
      ExpressionAttributeNames: {
        "#up": "userpassword"
      },
      ReturnValues: "UPDATED_NEW"
    };

    var docClient = new AWS.DynamoDB.DocumentClient();

    docClient.update(params, function(err, data) {
      if (err) {
        userSessionCallback(errors.AWSDynamoDBFailedToUpdateItemCode, "");
      } else {
        userSessionCallback(errors.ErrorCodeOK, usersession);
      }
    });
  }
  forgetpassword(useremail: string, userSessionCallback: IUserSessionCallback) {
    let buffer: Buffer = new Buffer(Guid.create().toString());
    let forgetpasswordsessionsha256: Uint8Array = sha256(buffer);
    let buffer1: Buffer = new Buffer(forgetpasswordsessionsha256);
    let forgetpasswordsession: string = buffer1.toString("base64");
    var params = {
      TableName: "Users",
      Key: {
        useremail: useremail
      },
      ConditionExpression: "#ue = :useremail",
      UpdateExpression: "set forgetpasswordsession = :s",
      ExpressionAttributeValues: {
        ":s": forgetpasswordsession,
        ":useremail": useremail
      },
      ExpressionAttributeNames: {
        "#ue": "useremail"
      },
      ReturnValues: "UPDATED_NEW"
    };

    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.update(params, function(err, data) {
      if (err) {
        userSessionCallback(errors.AWSDynamoDBFailedToUpdateItemCode, "");
      } else {
        userSessionCallback(errors.ErrorCodeOK, forgetpasswordsession);
      }
    });
  }
  recoverpassword(
    useremail: string,
    newassword: string,
    recoversession: string,
    userCallback: IUserCallback
  ) {
    var params = {
      TableName: "Users",
      KeyConditionExpression: "#ue = :useremail",
      ExpressionAttributeNames: {
        "#up": "forgetpasswordsession",
        "#ue": "useremail"
      },
      FilterExpression: "#up= :forgetpasswordsession",
      ExpressionAttributeValues: {
        ":useremail": useremail,
        ":forgetpasswordsession": recoversession
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.query(params, function(err, data) {
      if (err) {
        userCallback(errors.AWSDynamoDBFailedToRecoverCode);
      } else {
        if (data.Count == 0) {
          userCallback(errors.AWSDynamoDBFailedToRecoverCode);
        } else {
          // Create a session
          let usersDB: DynamoDB = new DynamoDB();
          usersDB.updateUserNewPassword(
            useremail,
            newassword,
            recoversession,
            (error: Number): void => {
              userCallback(errors.ErrorCodeOK);
            }
          );
        }
      }
    });
  }
  updateUserNewPassword(
    useremail: string,
    newassword: string,
    recoversession: string,
    userCallback: IUserCallback
  ) {
    let buffer: Buffer = new Buffer(Guid.create().toString());
    let usersessionsha256: Uint8Array = sha256(buffer);
    let buffer1: Buffer = new Buffer(usersessionsha256);
    let usersession: string = buffer1.toString("base64");
    var params = {
      TableName: "Users",
      Key: {
        useremail: useremail
      },
      UpdateExpression:
        "set usersession = :s, forgetpasswordsession = :s, userpassword = :p",
      ConditionExpression: "#ufs= :recoversession",
      ExpressionAttributeValues: {
        ":s": usersession,
        ":p": newassword,
        ":recoversession": recoversession
      },
      ExpressionAttributeNames: {
        "#ufs": "forgetpasswordsession"
      },
      ReturnValues: "UPDATED_NEW"
    };

    var docClient = new AWS.DynamoDB.DocumentClient();

    docClient.update(params, function(err, data) {
      if (err) {
        userCallback(errors.AWSDynamoDBFailedToUpdateItemCode);
      } else {
        userCallback(errors.ErrorCodeOK);
      }
    });
  }
  confirmnewUser(user: any, userCallback: IUserCallback) {
    var params = {
      TableName: "Users",
      Key: {
        useremail: user.useremail
      },
      UpdateExpression: "set confirmed = :c",
      ConditionExpression: "#up= :userpassword and #cf= :currentconfirmed",
      ExpressionAttributeValues: {
        ":c": user.confirmed,
        ":userpassword": user.userpassword,
        ":currentconfirmed": "false"
      },
      ExpressionAttributeNames: {
        "#up": "userpassword",
        "#cf": "confirmed"
      },
      ReturnValues: "UPDATED_NEW"
    };

    var docClient = new AWS.DynamoDB.DocumentClient();

    docClient.update(params, function(err, data) {
      if (err) {
        userCallback(errors.AWSDynamoDBFailedToUpdateItemCode);
      } else {
        userCallback(errors.ErrorCodeOK);
      }
    });
  }
}
