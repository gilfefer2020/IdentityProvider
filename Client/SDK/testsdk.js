function init() {
  document.getElementById("url").value = "http://localhost:3000";
}
const getPing = () => {
  const xhttp = new XMLHttpRequest();
  var url = document.getElementById("url").value;

  xhttp.open("GET", url, false);
  xhttp.send();

  const messages = xhttp.responseText;

  document.getElementById("helpmsg").innerHTML = messages;
};
const NewUser = () => {
  var url = document.getElementById("url").value;

  var data = {};
  data.userfullname = document.getElementById("userfullname").value;
  data.useremail = document.getElementById("useremail").value;
  data.userpassword = sha256(document.getElementById("userpassword").value);
  var json = JSON.stringify(data);

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", url + "/user", false);
  xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttp.send(json);
  document.getElementById("createnewusermsg").innerHTML = xhttp.responseText;
};
const ConfirmNewUser = () => {
  var url = document.getElementById("url").value;

  var data = {};
  data.useremail = document.getElementById("confirmuseremail").value;
  data.userpassword = sha256(
    document.getElementById("confirmuserpassword").value
  );
  var json = JSON.stringify(data);

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", url + "/confirmuser", false);
  xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttp.send(json);
  document.getElementById("confirmnewusermsg").innerHTML = xhttp.responseText;
};
const ForgetPassword = () => {
  var url = document.getElementById("url").value;

  var data = {};
  data.useremail = document.getElementById("forgetpasswordemail").value;
  var json = JSON.stringify(data);

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", url + "/forgetpassword", false);
  xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttp.send(json);
  document.getElementById("forgetpasswordmsg").innerHTML = xhttp.responseText;
};
const RecoverPassword = () => {
  var url = document.getElementById("url").value;

  var data = {};
  data.useremail = document.getElementById("recoverpasswordemail").value;
  data.recoversession = document.getElementById("recoverpasswordsession").value;
  data.newpassword = sha256(
    document.getElementById("recoverpasswordnewpassword").value
  );
  var json = JSON.stringify(data);

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", url + "/recoverpassword", false);
  xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttp.send(json);
  document.getElementById("recoverpasswordmsg").innerHTML = xhttp.responseText;
};
const getUser = () => {
  const xhttp = new XMLHttpRequest();
  var url = document.getElementById("url").value;

  let useremail = document.getElementById("getuseremail").value;
  let usersession = document.getElementById("loginusersession").value;
  xhttp.open("GET", url + "/user/" + useremail, false);
  xhttp.setRequestHeader("usersession", usersession);
  xhttp.send();

  document.getElementById("getusermsg").innerHTML = xhttp.responseText;
};
const deleteUser = () => {
  const xhttp = new XMLHttpRequest();
  var url = document.getElementById("url").value;

  let useremail = document.getElementById("deleteuseremail").value;
  xhttp.open("DELETE", url + "/user/" + useremail, false);
  xhttp.send();

  document.getElementById("deleteusermsg").innerHTML = xhttp.responseText;
};
const Login = () => {
  const xhttp = new XMLHttpRequest();
  var url = document.getElementById("url").value;

  var data = {};
  data.useremail = document.getElementById("loginuseremail").value;
  data.userpassword = sha256(
    document.getElementById("loginuserpassword").value
  );
  var json = JSON.stringify(data);

  xhttp.open("POST", url + "/login", false);
  xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttp.send(json);

  const logindata = JSON.parse(xhttp.responseText);
  document.getElementById("loginusermsg").innerHTML = xhttp.responseText;
  document.getElementById("loginusersession").value = logindata.usersession;
};

init();
