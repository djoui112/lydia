document.getElementById("login-architect").addEventListener("submit", function(e) {
  e.preventDefault(); 

  const formData = new FormData(this);
  fetch("saveClient.php", { method: "POST", body: formData });
  
  window.location.href = "architect-interface.html";
});