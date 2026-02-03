const urlBase = 'http://labfor4331.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
  userId = 0;
  firstName = "";
  lastName = "";

  const login = document.getElementById("loginName")?.value.trim() ?? "";
  const password = document.getElementById("loginPassword")?.value ?? "";

  const out = document.getElementById("loginResult");
  if (out) out.innerHTML = "";

  const payload = JSON.stringify({ login: login, password: password });
  const url = `${urlBase}/Login.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function ()
  {
    if (xhr.readyState !== 4) return;
    if (xhr.status !== 200)
    {
      if (out) out.innerHTML = `Login failed (HTTP ${xhr.status}).`;
      console.error("Login error:", xhr.status, xhr.responseText);
      return;
    }

    let json;
    try
    {
      json = JSON.parse(xhr.responseText);
    }
    catch (e)
    {
      if (out) out.innerHTML = "Login failed (server returned non-JSON).";
      console.error("Login non-JSON response:", xhr.responseText);
      return;
    }

    if (!json.id || json.id < 1)
    {
      const msg = (json.error && json.error.length > 0)
        ? json.error
        : "User/Password combination incorrect";
      if (out) out.innerHTML = msg;
      return;
    }

    userId = json.id;
    firstName = json.firstName || "";
    lastName = json.lastName || "";

    saveCookie();
    window.location.href = "home.html";
  };

  xhr.send(payload);
}

function doRegister()
{
  const login = document.getElementById("registerLoginName")?.value.trim() ?? "";
  const password = document.getElementById("registerPassword")?.value ?? "";
  const f = document.getElementById("registerFirstName")?.value.trim() ?? "";
  const l = document.getElementById("registerLastName")?.value.trim() ?? "";

  const out = document.getElementById("registerResult");
  if (out) out.innerHTML = "";

  if (!login || !password || !f || !l)
  {
    if (out) out.innerHTML = "Please fill in all fields.";
    return;
  }

  const payload = JSON.stringify({
    loginName: login,
    password: password,
    firstName: f,
    lastName: l
  });

  const url = `${urlBase}/Register.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function ()
  {
    if (xhr.readyState !== 4) return;

    if (xhr.status !== 200)
    {
      if (out) out.innerHTML = `Register failed (HTTP ${xhr.status}).`;
      console.error("Register error:", xhr.status, xhr.responseText);
      return;
    }

    let json;
    try
    {
      json = JSON.parse(xhr.responseText);
    }
    catch (e)
    {
      if (out) out.innerHTML = "Register failed (server returned non-JSON).";
      console.error("Register non-JSON response:", xhr.responseText);
      return;
    }

    if (json.error && json.error.length > 0)
    {
      if (out) out.innerHTML = json.error;
      return;
    }

    if (!json.id || json.id < 1)
    {
      if (out) out.innerHTML = "Registration failed (no user id returned).";
      return;
    }

    userId = json.id;
    firstName = json.firstName || f;
    lastName = json.lastName || l;

    saveCookie();
    window.location.href = "home.html";
  };

  xhr.send(payload);
}

function doLogout()
{
  userId = 0;
  firstName = "";
  lastName = "";

  document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  window.location.href = "index.html";
}

function saveCookie()
{
  const minutes = 20;
  const date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));

  document.cookie = `firstName=${encodeURIComponent(firstName)}; expires=${date.toUTCString()}; path=/`;
  document.cookie = `lastName=${encodeURIComponent(lastName)}; expires=${date.toUTCString()}; path=/`;
  document.cookie = `userId=${encodeURIComponent(userId)}; expires=${date.toUTCString()}; path=/`;
}

function readCookie()
{


  const cookies = document.cookie.split(";").map(c => c.trim());
  const map = {};

  for (const c of cookies)
  {
    const idx = c.indexOf("=");
    if (idx === -1) continue;
    const k = c.slice(0, idx);
    const v = c.slice(idx + 1);
    map[k] = decodeURIComponent(v);
  }

  firstName = map.firstName || "";
  lastName = map.lastName || "";
  userId = map.userId ? parseInt(map.userId, 10) : 0;

  return (userId && userId > 0);
}

function requireLogin()
{
  const ok = readCookie();
  if (!ok)
  {
    window.location.href = "index.html";
  }
}


function addColor()
{
  const newColor = document.getElementById("colorText")?.value ?? "";
  const out = document.getElementById("colorAddResult");
  if (out) out.innerHTML = "";

  if (!userId || userId < 1)
  {
    if (out) out.innerHTML = "Please login first.";
    return;
  }

  const payload = JSON.stringify({ color: newColor, userId: userId });
  const url = `${urlBase}/AddColor.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function ()
  {
    if (xhr.readyState !== 4) return;

    if (xhr.status === 200)
    {
      if (out) out.innerHTML = "Color has been added";
    }
    else
    {
      if (out) out.innerHTML = `Add failed (HTTP ${xhr.status}).`;
      console.error("AddColor error:", xhr.status, xhr.responseText);
    }
  };

  xhr.send(payload);
}

function searchColor()
{
  const srch = document.getElementById("searchText")?.value ?? "";
  const out = document.getElementById("colorSearchResult");
  if (out) out.innerHTML = "";

  if (!userId || userId < 1)
  {
    if (out) out.innerHTML = "Please login first.";
    return;
  }

  const payload = JSON.stringify({ search: srch, userId: userId });
  const url = `${urlBase}/SearchColors.${extension}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  xhr.onreadystatechange = function ()
  {
    if (xhr.readyState !== 4) return;

    if (xhr.status !== 200)
    {
      if (out) out.innerHTML = `Search failed (HTTP ${xhr.status}).`;
      console.error("SearchColors error:", xhr.status, xhr.responseText);
      return;
    }

    let json;
    try
    {
      json = JSON.parse(xhr.responseText);
    }
    catch (e)
    {
      if (out) out.innerHTML = "Search failed (server returned non-JSON).";
      console.error("SearchColors non-JSON response:", xhr.responseText);
      return;
    }

    if (out) out.innerHTML = "Color(s) has been retrieved";

    const results = Array.isArray(json.results) ? json.results : [];
    const html = results.map(x => `${x}`).join("<br/>\r\n");

    // Your old code wrote into the first <p> tag; keep same behavior:
    const p = document.getElementsByTagName("p")[0];
    if (p) p.innerHTML = html;
  };

  xhr.send(payload);
}
