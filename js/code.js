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

  const jsonPayload = JSON.stringify({ login: login, password: password });
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
    window.location.href = "contactManager.html"; // Go to contact page if successful.
  };

  xhr.send(jsonPayload);
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

  const jsonPayload = JSON.stringify({
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
    window.location.href = "contactManager.html";
  };

  xhr.send(jsonPayload);
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


function addContact()
{
  const out = document.getElementById("addContactResult");
  if (out) out.innerHTML = "";

  if (!readCookie())
  {
    if (out) out.innerHTML = "Session expired. Please log in again.";
    window.location.href = "index.html";
    return;
  }

  const firstNameInput = document.getElementById("addFirstName");
  const lastNameInput = document.getElementById("addLastName");
  const contactFirstName = firstNameInput.value.trim();
  const contactLastName = lastNameInput.value.trim();
  const phoneInput = document.getElementById("addPhone");
  const emailInput = document.getElementById("addEmail");
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();

  if (!phoneInput.checkValidity())
  {
    phoneInput.reportValidity();
    return;
  }

  if (!emailInput.checkValidity())
  {
    emailInput.reportValidity();
    return;
  }

  let jsonPayload = JSON.stringify({
        firstName: contactFirstName,
        lastName: contactLastName,
        phone: phone,
        email: email,
        userId: userId
    });

  let url = `${urlBase}/AddContact.${extension}`;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try
    {
        xhr.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                if (out) out.innerHTML = "Contact has been added";
                firstNameInput.value = "";
                lastNameInput.value = "";
                phoneInput.value = "";
                emailInput.value = "";
                searchContacts();
                closeAddModal();
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        if (out) out.innerHTML = err.message;
    }
}

/* 
    Searches for a user the database. 
    Takes a text input that should be correlated to a name.
    Returns array of JSON object listing all relevant contacts (email, #, fName, lName)
*/
function searchContacts() {
    // 1. Pull the latest userId from the cookie
    readCookie(); 

    const searchInput = document.getElementById("searchText");
    if (!searchInput) return;

    let srch = searchInput.value;
    const contactContainer = document.getElementById("contactCardsContainer");
    const contactCardTemplate = document.getElementById("contactCardTemplate");

    if (!contactContainer || !contactCardTemplate) return;

    // 2. Stop if the user isn't logged in
    if (!userId || userId < 1) {
        console.error("No valid user session found.");
        return;
    }

    contactContainer.innerHTML = '<p style="color:white; grid-column: 1/-1; text-align:center;">Searching...</p>';

    let jsonPayload = JSON.stringify({ search: srch, userId: userId });
    const url = `${urlBase}/SearchContacts.${extension}`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        contactContainer.innerHTML = "";

        if (xhr.status !== 200) {
            contactContainer.innerHTML = `<p style="color:red; grid-column: 1/-1;">Error: ${xhr.status}</p>`;
            return;
        }

        try {
            const json = JSON.parse(xhr.responseText);
            if (!json.results || json.results.length === 0) {
                contactContainer.innerHTML = `<p style="color:white; grid-column: 1/-1; text-align:center;">No contacts found.</p>`;
                return;
            }

            json.results.forEach(contact => {
                const card = contactCardTemplate.content.cloneNode(true);

                if (card.querySelector(".firstName")) card.querySelector(".firstName").innerText = contact.firstName || contact.first || "";
                if (card.querySelector(".lastName")) card.querySelector(".lastName").innerText = contact.lastName || contact.last || "";
                if (card.querySelector(".Email")) card.querySelector(".Email").innerText = contact.email || "";
                if (card.querySelector(".Phone")) card.querySelector(".Phone").innerText = contact.phone || "";

                contactContainer.appendChild(card);
            });
        } catch (e) {
            contactContainer.innerHTML = `<p style="color:red; grid-column: 1/-1;">Server error.</p>`;
        }
    };
    xhr.send(jsonPayload);
}


/*
function searchContacts() {
    const srch = document.getElementById("searchText")?.value ?? "";
    const contactContainer = document.getElementById("contactCardsContainer");
    const contactCardTemplate = document.getElementById("contactCardTemplate");

    if (!contactContainer || !contactCardTemplate) {
        console.error("HTML elements missing. Check your IDs!");
        return;
    }

    // 1. Show the user something is happening
    contactContainer.innerHTML = '<p style="color:white; text-align:center;">Searching...</p>';

    // 2. This is your EXACT API structure
    const mockResponse = {
        "results": [
            {
                "first": "Jane",
                "last": "Doe",
                "email": "jane@example.com",
                "phone": "321-555-0199"
            },
            {
                "first": "Gemini",
                "last": "Test",
                "email": "gemini@ucf.edu",
                "phone": "407-555-0123"
            }
        ],
        "error": ""
    };

    // 3. Simulate the delay of the database
    setTimeout(() => {
        contactContainer.innerHTML = ""; // Clear "Searching..."

        if (mockResponse.results.length === 0) {
            contactContainer.innerHTML = '<p style="color:white;">No results found.</p>';
            return;
        }

        mockResponse.results.forEach(contact => {
            const card = contactCardTemplate.content.cloneNode(true);
            
            // Note: These must match the CLASS names in your HTML <template>
            // and the KEY names in your JSON (contact.first, contact.email, etc.)
            card.querySelector(".firstName").innerText = contact.first;
            card.querySelector(".lastName").innerText = contact.last;
            card.querySelector(".Email").innerText = contact.email;
            card.querySelector(".Phone").innerText = contact.phone;

            contactContainer.appendChild(card);
        });
    }, 400); 
}
*/
function openAddModal() {
    document.getElementById("addModal").classList.remove("hide");
}

function closeAddModal() {
    document.getElementById("addModal").classList.add("hide");
    // Optional: Clear the result message when closing
    document.getElementById("addContactResult").innerHTML = "";
}


// Update your existing addContact to close the modal on success
// After document.getElementById("addContactResult").innerHTML = "Contact has been added";
// Add: setTimeout(closeAddModal, 1500);

