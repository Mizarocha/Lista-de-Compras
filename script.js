let lista = [];


function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

// /*navegador */ 
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./service-worker.js')
    .then(function(registration) {
      console.log('ServiceWorker registrado com sucesso:', registration.scope);
    }, function(err) {
      console.log('ServiceWorker falhou:', err);
    });
  });
}

// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDQBIdJf6xbeT7L_eG9akCmQnObNZuoof4",
     authDomain: "lista-de-compras-56e84.firebaseapp.com",
  projectId: "lista-de-compras-56e84",
  storageBucket: "lista-de-compras-56e84.firebasestorage.app",
  messagingSenderId: "995972787687",
  appId: "1:995972787687:web:76abec54fc95521be96142"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const listaRef = collection(db, "listaDeCompras");

async function adicionarItem() {
    const nome = document.getElementById("itemInput").value.trim();
    const categoria = document.getElementById("categoriaSelect").value;

    if (nome === "") {
        alert("Digite o nome do item.");
        return;
    }

    await addDoc(listaRef, {
        nome,
        categoria,
        comprado: false
    });

    document.getElementById("itemInput").value = "";
}

function renderizarLista(snapshot) {
    const div = document.getElementById("listasPorCategoria");
    div.innerHTML = "";

    const items = [];
    snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
    });

    const categorias = [...new Set(items.map(item => item.categoria))];

    categorias.forEach(categoria => {
        const catDiv = document.createElement("div");
        catDiv.className = "categoria";

        const titulo = document.createElement("h2");
        titulo.innerText = categoria;
        catDiv.appendChild(titulo);

        const ul = document.createElement("ul");

        items.filter(i => i.categoria === categoria).forEach(item => {
            const li = document.createElement("li");
            li.className = item.comprado ? "comprado" : "";

            li.innerHTML = `
                <input type="checkbox" ${item.comprado ? "checked" : ""}>
                <span>${item.nome}</span>
                <button class="remove">X</button>
            `;

            li.querySelector('input').addEventListener('change', async () => {
                await updateDoc(doc(db, "listaDeCompras", item.id), {
                    comprado: !item.comprado
                });
            });

            li.querySelector('button').addEventListener('click', async () => {
                await deleteDoc(doc(db, "listaDeCompras", item.id));
            });

            ul.appendChild(li);
        });

        catDiv.appendChild(ul);
        div.appendChild(catDiv);
    });
}

// 🔥 Escuta em tempo real
onSnapshot(listaRef, (snapshot) => {
    renderizarLista(snapshot);
});

document.getElementById("btnAdicionar").addEventListener("click", adicionarItem);
