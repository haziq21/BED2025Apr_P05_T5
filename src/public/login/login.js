const Baseapiurl = "http://localhost:3000";
const token5 = localStorage.getItem("token");
// Switch Tabs
// @ts-ignore
function clickTab(evt, tabName) {
  const contents = document.getElementsByClassName("tabContent");
  // @ts-ignore
  for (const c of contents) c.style.display = "none";
  // @ts-ignore
  document.getElementById(tabName).style.display = "block";
}

async function requestOTP() {
  // @ts-ignore
  const phone = document.getElementById("login_phone").value.trim();
  if (!phone) {
    alert("Please enter your phone number");
    return;
  }

  const res = await fetch(`${Baseapiurl}/api/auth/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber: phone }),
  });

  const result = await res.json();
  if (res.ok) {
    alert("OTP sent to your phone!");
    // @ts-ignore
    document.getElementById("Login").style.display = "none";
    // @ts-ignore
    document.getElementById("OTPSection").style.display = "block";
  } else {
    alert(result.error || "Failed to send OTP");
  }
}

async function verifyOTP() {
  // @ts-ignore
  const phone = document.getElementById("login_phone").value.trim();
  // @ts-ignore
  const otp = document.getElementById("otp").value.trim();

  if (!otp) {
    alert("Enter the OTP");
    return;
  }

  const res = await fetch(`${Baseapiurl}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber: phone, otp }),
  });

  const result = await res.json();
  if (res.ok) {
    localStorage.setItem("token", result.token);
    alert("Login successful!");
    window.location.href = "../index.html"; 
  } else {
    alert(result.error || "Invalid OTP");
  }
}
async function resendOTP() {
  // @ts-ignore
  const phone = document.getElementById("login_phone").value.trim();
  if (!phone) {
    alert("Please enter your phone number");
    return;
  }

  const res = await fetch(`${Baseapiurl}/api/auth/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber: phone }),
  });

  const result = await res.json();
  if (res.ok) {
    alert("A new OTP has been sent to your phone!");
  } else {
    alert(result.error || "Failed to resend OTP");
  }
}
async function signUp() {
  // @ts-ignore
  const name = document.getElementById("signup_name").value.trim();
  // @ts-ignore
  const phone = document.getElementById("signup_phone").value.trim();

  if (!name || !phone) {
    alert("Please fill in all fields");
    return;
  }

  const res = await fetch(`${Baseapiurl}/api/auth/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Name: name, PhoneNumber: phone }),
  });

  const result = await res.json();
  if (res.ok) {
    alert("Sign up successful! Please login now.");
    clickTab(null, "Login");
  } else {
    alert(result.error || "Failed to sign up");
  }
}
