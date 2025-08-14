/* 
This is a SAMPLE FILE to get you started.
Please, follow the project instructions to complete the tasks.
*/

/*document.addEventListener('DOMContentLoaded', () => {
  DO SOMETHING 
  });*/

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");
  const loginLink = document.getElementById("login-link");
// Check if the user is already logged in
  const token = getCookie("authToken");

  if (token) {
    if (loginLink) loginLink.style.display = "none";
  } else {
    if (loginLink) loginLink.style.display = "block";
  }
// Fetch and display places if the section exists
  if (placeDetailsSection) {
    fetchPlaces();
  }
// Handle login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMessage.textContent = "Error";

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
// Validate email and password
      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const errorData = await response.json();
          errorMessage.textContent = errorData.message || "Invalid credentials";
          return;
        }

        const data = await response.json();

        document.cookie = `authToken=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure`;
        window.location.href = "index.html";

      } catch (error) {
        console.error("Login error:", error);
        errorMessage.textContent = "Something went wrong. Please try again.";
      }
    });
  }
});
// Fetch places from the API and display them


// Get a cookie by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

