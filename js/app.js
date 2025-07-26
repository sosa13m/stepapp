// app.js

// === OCR con Tesseract ===
async function leerReceta() {
    const file = document.getElementById("recipeInput").files[0];
    if (!file) return;
    const output = document.getElementById("ocr-output");
    output.innerText = "Procesando imagen...";
    const { data: { text } } = await Tesseract.recognize(file, 'spa');
    output.innerText = text;

    // Guardar en Firestore (opcional)
    const user = auth.currentUser;
    if (user) {
        await db.collection("recetas").add({
            uid: user.uid,
            receta: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

// === Autenticación Admin ===
async function login() {
    const email = document.getElementById("adminEmail").value;
    const pass = document.getElementById("adminPass").value;
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        document.getElementById("login-section").style.display = "none";
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("admin-panel").style.display = "block";
        cargarMedidas();
        cargarRecetas();
    } catch (e) {
        alert("Login fallido: " + e.message);
    }
}

function logout() {
    auth.signOut();
    document.getElementById("login-section").style.display = "block";
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("admin-panel").style.display = "none";
}

async function cargarMedidas() {
    const snap = await db.collection("mediciones").orderBy("timestamp", "desc").get();
    const tbody = document.querySelector("#medidas-table tbody");
    tbody.innerHTML = "";
    snap.forEach(doc => {
        const d = doc.data();
        tbody.innerHTML += `<tr><td>${d.uid}</td><td>${d.medida} cm</td><td><button>Eliminar</button></td></tr>`;
    });
}

async function cargarRecetas() {
    const snap = await db.collection("recetas").orderBy("timestamp", "desc").get();
    const tbody = document.querySelector("#recetas-table tbody");
    tbody.innerHTML = "";
    snap.forEach(doc => {
        const d = doc.data();
        tbody.innerHTML += `<tr><td>${d.uid}</td><td>${d.receta.substring(0, 100)}...</td><td><button>Eliminar</button></td></tr>`;
    });
}

// Inicializar Firebase (asegúrate de que firebase-config.js esté cargado)