class errorsJSOIN {
    public errorcode: number;
    public errormessage: string;
}
export class errors {
    static ErrorCodeOK = 0;
    static ErrorCodeOKMsg = "Operation ended successfuly.";

    static ErrorCodeFatal = -1;

    static EmailBLFailedToSendEmailCode = 220001;
    static EmailBLFailedToSendEmailMsg = "Failed to send an email.";

    static AWSDynamoDBFailedToAddItem = 211001;
    static AWSDynamoDBFailedToAddItemMsg = "Failed to add item to the DB.";
    static AWSDynamoDBFailedToGetItem = 211002;
    static AWSDynamoDBFailedToGetItemMsg = "Failed to get item from the DB.";
    static AWSDynamoDBFailedToDeleteItem = 211003;
    static AWSDynamoDBFailedToDeleteItemMsg = "Failed to delete item from the DB.";
    static AWSDynamoDBFailedToLoginCode = 211004;
    static AWSDynamoDBFailedToLoginMsg = "Failed to login.";
    static AWSDynamoDBFailedToUpdateItemCode = 211005;
    static AWSDynamoDBFailedToUpdateItemMsg = "Failed to update item.";
    static AWSDynamoDBFailedToLoginWithSessionCode = 211006;
    static AWSDynamoDBFailedToLoginWithSessionMsg = "Failed to login.";
    static AWSDynamoDBFailedToRecoverCode = 211007;
    static AWSDynamoDBFailedToRecoverMsg = "Failed to recover.";

    static addNewUserSendEmailCode = 200001;
    static addNewUserSendEmailMsg = "New user was added, and a confirmetion email was sent.";
    static addNewUserFailedCode = 200002;
    static addNewUserFailedMsg = "Failed to add new user.";
    static addNewUserExistCode = 200003;
    static addNewUserExistMsg = "User already exist.";
    static getUserFailedCode = 200004;
    static getUserFailedMsg = "Failed to get the user.";
    static deleteUserFailedCode = 200005;
    static deleteUserFailedMsg = "Failed to delete the user.";
    static loginFailedCode = 200006;
    static loginFailedMsg = "Failed to login.";
    static confirmUserFailedCode = 200007;
    static confirmUserFailedMsg = "Failed to confirm the user.";
    static forgetPasswordFailedCode = 200008;
    static forgetPasswordFailedMsg = "Failed to add process forget password.";
    static recoverFailedCode = 200009;
    static recoverFailedMsg = "Failed to recover.";

    static createError(errorcode: number, errormessage: string) {
        let errorJSON = new errorsJSOIN();
        errorJSON.errorcode = errorcode;
        errorJSON.errormessage = errormessage;
        var s = JSON.stringify(errorJSON);
        return JSON.stringify(errorJSON);
    }
    static FatalError() {

    }
    static OK() {
        return errors.createError(errors.ErrorCodeOK, errors.ErrorCodeOKMsg);
    }
    static LoginFailed() {
        return errors.createError(errors.loginFailedCode, errors.loginFailedMsg);
    }
    static RecoverFailed() {
        return errors.createError(errors.recoverFailedCode, errors.recoverFailedMsg);
    }
    static addNewUserSendEmail() {
        return errors.createError(errors.addNewUserSendEmailCode, errors.addNewUserSendEmailMsg);
    }
    static addNewUserFailed() {
        return errors.createError(errors.addNewUserFailedCode, errors.addNewUserFailedMsg);
    }
    static forgetPasswordFailed() {
        return errors.createError(errors.forgetPasswordFailedCode, errors.forgetPasswordFailedMsg);
    }
    static getUserFailed() {
        return errors.createError(errors.getUserFailedCode, errors.getUserFailedMsg);
    }
    static deleteUserFailed() {
        return errors.createError(errors.deleteUserFailedCode, errors.deleteUserFailedMsg);
    }
    static confirmNewUserFailed() {
        return errors.createError(errors.confirmUserFailedCode, errors.confirmUserFailedMsg);
    }
    static addNewUserExist() {
        return errors.createError(errors.addNewUserExistCode, errors.addNewUserExistMsg);
    }
}
