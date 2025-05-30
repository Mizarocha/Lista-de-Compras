// let lista = [];

// window.onload = function() {
//     const data = localStorage.getItem("listaCompras");
//     if (data) {
//         lista = JSON.parse(data);
//         renderizarLista();
//     }
// };

// function adicionarItem() {
//     const input = document.getElementById("itemInput");
//     const categoria = document.getElementById("categoriaSelect").value;
//     const nomeItem = input.value.trim();

//     if (nomeItem === "") {
//         alert("Digite o nome do item.");
//         return;
//     }

//     lista.push({ nome: nomeItem, comprado: false, categoria });
//     input.value = "";
//     salvarLista();
//     renderizarLista();
// }

// function toggleItem(index) {
//     lista[index].comprado = !lista[index].comprado;
//     salvarLista();
//     renderizarLista();
// }

// function removerItem(index) {
//     if (confirm("Deseja remover este item?")) {
//         lista.splice(index, 1);
//         salvarLista();
//         renderizarLista();
//     }
// }

// function salvarLista() {
//     localStorage.setItem("listaCompras", JSON.stringify(lista));
// }

// function renderizarLista() {
//     const div = document.getElementById("listasPorCategoria");
//     div.innerHTML = "";

//     const categoriasUnicas = [...new Set(lista.map(item => item.categoria))];

//     categoriasUnicas.forEach(categoria => {
//         const categoriaDiv = document.createElement("div");
//         categoriaDiv.className = "categoria";

//         const titulo = document.createElement("h2");
//         titulo.innerText = categoria;
//         categoriaDiv.appendChild(titulo);

//         const ul = document.createElement("ul");
//         ul.dataset.categoria = categoria;

//         ul.addEventListener("dragover", e => {
//             e.preventDefault();
//             const afterElement = getDragAfterElement(ul, e.clientY);
//             const dragging = document.querySelector('.dragging');
//             if (afterElement == null) {
//                 ul.appendChild(dragging);
//             } else {
//                 ul.insertBefore(dragging, afterElement);
//             }
//         });

//         ul.addEventListener("drop", e => {
//             e.preventDefault();
//             const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
//             const draggedItem = lista[draggedIndex];
//             const targetCategoria = ul.dataset.categoria;

//             // Filtrar itens dessa categoria
//             const itensCategoria = lista
//                 .map((item, idx) => ({ ...item, idx }))
//                 .filter(item => item.categoria === targetCategoria);

//             const domItems = [...ul.children];
//             const novaOrdem = domItems.map(li => li.querySelector('span').innerText);

//             // Organiza a lista conforme a nova ordem dentro da categoria
//             const novosItensCategoria = novaOrdem.map(nome => itensCategoria.find(item => item.nome === nome));

//             // Remove antigos da lista geral
//             lista = lista.filter(item => item.categoria !== targetCategoria);

//             // Adiciona na ordem nova
//             novosItensCategoria.forEach(item => {
//                 lista.push({ nome: item.nome, comprado: item.comprado, categoria: item.categoria });
//             });

//             salvarLista();
//             renderizarLista();
//         });

//         lista.forEach((item, index) => {
//             if (item.categoria === categoria) {
//                 const li = document.createElement("li");
//                 li.className = item.comprado ? "comprado" : "";

//                 li.draggable = true;
//                 li.addEventListener("dragstart", e => {
//                     li.classList.add("dragging");
//                     e.dataTransfer.setData("text/plain", index);
//                 });
//                 li.addEventListener("dragend", () => {
//                     li.classList.remove("dragging");
//                 });

//                 li.innerHTML = `
//                     <input type="checkbox" ${item.comprado ? "checked" : ""} onchange="toggleItem(${index})">
//                     <span>${item.nome}</span>
//                     <button class="remove" onclick="removerItem(${index})">X</button>
//                 `;

//                 ul.appendChild(li);
//             }
//         });

//         categoriaDiv.appendChild(ul);
//         div.appendChild(categoriaDiv);
//     });
// }

// function getDragAfterElement(container, y) {
//     const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

//     return draggableElements.reduce((closest, child) => {
//         const box = child.getBoundingClientRect();
//         const offset = y - box.top - box.height / 2;

//         if (offset < 0 && offset > closest.offset) {
//             return { offset: offset, element: child };
//         } else {
//             return closest;
//         }
//     }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
// }

// /*navegador */ 
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', function() {
//     navigator.serviceWorker.register('./service-worker.js')
//     .then(function(registration) {
//       console.log('ServiceWorker registrado com sucesso:', registration.scope);
//     }, function(err) {
//       console.log('ServiceWorker falhou:', err);
//     });
//   });
// }

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

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
