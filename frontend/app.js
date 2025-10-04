const API_URL = "http://localhost:3000/api";

// Elementos del DOM
const authView = document.getElementById("auth-view");
const productsView = document.getElementById("products-view");
const userSession = document.getElementById("user-session");
const welcomeMessage = document.getElementById("welcome-message");
const logoutBtn = document.getElementById("logout-btn");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const productForm = document.getElementById("product-form");
const myProductsList = document.getElementById("my-products-list");
const allProductsList = document.getElementById("all-products-list");

let editingProductId = null;

// ======================
// Registro
// ======================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message || data.error);
});

// ======================
// Login
// ======================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });

  const data = await res.json();

  if (res.ok) {
    welcomeMessage.textContent = `Bienvenido, ${username}`;
    authView.classList.add("hidden");
    productsView.classList.remove("hidden");
    userSession.classList.remove("hidden");
    loadProducts();
  } else {
    alert(data.error || "Error al iniciar sesión");
  }
});

// ======================
// Logout
// ======================
logoutBtn.addEventListener("click", async () => {
  // No hay endpoint logout en el backend, solo se borra la cookie manualmente
  document.cookie = "token=; Max-Age=0; path=/;";
  authView.classList.remove("hidden");
  productsView.classList.add("hidden");
  userSession.classList.add("hidden");
  alert("Sesión cerrada");
});

// ======================
// Cargar productos
// ======================
async function loadProducts() {
  const resAll = await fetch(`${API_URL}/products`);
  const resMy = await fetch(`${API_URL}/products/my`, { credentials: "include" });

  const all = await resAll.json();
  const my = await resMy.json();

  renderProducts(allProductsList, all.products);
  renderMyProducts(myProductsList, my.myProducts);
}

function renderProducts(container, products) {
  container.innerHTML = "";
  if (!products || products.length === 0) {
    container.innerHTML = "<p>No hay productos.</p>";
    return;
  }
  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <strong>${p.name}</strong> - ${p.description || ""}
      <em>(Dueño: ${p.owner})</em>
    `;
    container.appendChild(div);
  });
}

function renderMyProducts(container, products) {
  container.innerHTML = "";
  if (!products || products.length === 0) {
    container.innerHTML = "<p>No tienes productos.</p>";
    return;
  }

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <strong>${p.name}</strong> - ${p.description || ""}
      <button onclick="editProduct(${p.id}, '${p.name}', '${p.description || ""}')">✏️</button>
      <button onclick="deleteProduct(${p.id})">🗑️</button>
    `;
    container.appendChild(div);
  });
}

// ======================
// Crear / Editar Producto
// ======================
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("product-name").value;
  const description = document.getElementById("product-description").value;

  if (!name.trim()) {
    alert("El nombre es obligatorio.");
    return;
  }

  let url = `${API_URL}/products`;
  let method = "POST";

  if (editingProductId) {
    url = `${API_URL}/products/${editingProductId}`;
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
    credentials: "include"
  });

  const data = await res.json();
  alert(data.message || data.error);

  editingProductId = null;
  productForm.reset();
  loadProducts();
});

window.editProduct = function (id, name, description) {
  editingProductId = id;
  document.getElementById("product-name").value = name;
  document.getElementById("product-description").value = description;
};

// ======================
// Eliminar producto
// ======================
window.deleteProduct = async function (id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await res.json();
  alert(data.message || data.error);
  loadProducts();
};
