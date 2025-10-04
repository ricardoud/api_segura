// Archivo: frontend/app.js

const API_URL = "http://localhost:3000/api";

// ============================
// Selección de elementos
// ============================
const authView = document.getElementById("auth-view");
const productsView = document.getElementById("products-view");
const userSession = document.getElementById("user-session");
const welcomeMessage = document.getElementById("welcome-message");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");

const productForm = document.getElementById("product-form");
const myProductsList = document.getElementById("my-products-list");
const allProductsList = document.getElementById("all-products-list");

let editingProductId = null;

// ============================
// Funciones auxiliares
// ============================
function showView(view) {
  if (view === "auth") {
    authView.classList.remove("hidden");
    productsView.classList.add("hidden");
    userSession.classList.add("hidden");
  } else if (view === "products") {
    authView.classList.add("hidden");
    productsView.classList.remove("hidden");
    userSession.classList.remove("hidden");
  }
}

async function fetchWithAuth(url, options = {}) {
  options.credentials = "include"; // Importante para cookies HttpOnly
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error en la solicitud");
  }
  return res.json();
}

// ============================
// Registro
// ============================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    const data = await res.json();
    alert(data.message || "Usuario registrado");
    registerForm.reset();
  } catch (err) {
    alert(err.message);
  }
});

// ============================
// Login
// ============================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const data = await fetchWithAuth(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    welcomeMessage.textContent = `Bienvenido, ${username}`;
    showView("products");
    loadProducts();
    loginForm.reset();
  } catch (err) {
    alert(err.message);
  }
});

// ============================
// Logout
// ============================
logoutBtn.addEventListener("click", async () => {
  try {
    const data = await fetchWithAuth(`${API_URL}/auth/logout`, { method: "POST" });
    alert(data.message || "Sesión cerrada");
    showView("auth");
  } catch (err) {
    alert(err.message);
  }
});

// ============================
// Cargar productos
// ============================
async function loadProducts() {
  try {
    // Mis productos
    const myData = await fetchWithAuth(`${API_URL}/products/my`);
    myProductsList.innerHTML = myData.myProducts.map(p => `
      <div class="product">
        <h3>${p.name}</h3>
        <p>${p.description || ""}</p>
        <button onclick="editProduct(${p.id}, '${p.name}', '${p.description || ""}')">Editar</button>
        <button onclick="deleteProduct(${p.id})">Eliminar</button>
      </div>
    `).join("");

    // Todos los productos
    const allData = await fetchWithAuth(`${API_URL}/products`);
    allProductsList.innerHTML = allData.products.map(p => `
      <div class="product">
        <h3>${p.name}</h3>
        <p>${p.description || ""}</p>
        <small>Propietario: ${p.owner}</small>
      </div>
    `).join("");
  } catch (err) {
    console.error(err.message);
  }
}

// ============================
// Crear o actualizar producto
// ============================
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("product-name").value;
  const description = document.getElementById("product-description").value;

  try {
    if (editingProductId) {
      // Actualizar
      await fetchWithAuth(`${API_URL}/products/${editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      });
      editingProductId = null;
    } else {
      // Crear
      await fetchWithAuth(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      });
    }
    productForm.reset();
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
});

// ============================
// Editar producto
// ============================
window.editProduct = (id, name, description) => {
  editingProductId = id;
  document.getElementById("product-name").value = name;
  document.getElementById("product-description").value = description;
};

// ============================
// Eliminar producto
// ============================
window.deleteProduct = async (id) => {
  if (!confirm("¿Desea eliminar este producto?")) return;
  try {
    await fetchWithAuth(`${API_URL}/products/${id}`, { method: "DELETE" });
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
};

// ============================
// Inicialización
// ============================
showView("auth");
