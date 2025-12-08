// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {   getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const isOwner = window.location.search.includes("admin");

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

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./service-worker.js')
      .then(function (registration) {
        console.log('ServiceWorker registrado com sucesso:', registration.scope);
      }, function (err) {
        console.log('ServiceWorker falhou:', err);
      });
  });
}




const firebaseConfig = {
  apiKey: "AIzaSyDQBIdJf6xbeT7L_eG9akCmQnObNZuoof4",
  authDomain: "lista-de-compras-56e84.firebaseapp.com",
  projectId: "lista-de-compras-56e84",
  storageBucket: "lista-de-compras-56e84.appspot.com",
  messagingSenderId: "995972787687",
  appId: "1:995972787687:web:76abec54fc95521be96142"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// -------------------------------
// CADASTRAR 
// -------------------------------

// -------------------------------
const authArea = document.getElementById("authArea");
const mainArea = document.getElementById("mainArea");
const btnCadastrar = document.getElementById("btnCadastrar");
const btnGoogle = document.getElementById("btnGoogle");
const logoutBtn = document.getElementById("logoutBtn");

// -------------------------------
function mostrarTela(usuario) {
    if (usuario) {
        authArea.style.display = "none";
        mainArea.style.display = "block";
    } else {
        authArea.style.display = "flex";
        mainArea.style.display = "none";
    }
}



// -------------------------------
onAuthStateChanged(auth, (user) => {
    mostrarTela(user);
});


// -------------------------------
// CADASTRAR OU ENTRAR COM EMAIL
// -------------------------------
btnCadastrar.addEventListener("click", async () => {

    const nome = document.getElementById("nomeCadastro").value.trim();
    const email = document.getElementById("emailCadastro").value.trim();
    const senha = document.getElementById("senhaCadastro").value.trim();

    if (!email || !senha) {
        alert("Digite email e senha!");
        return;
    }

    try {
        
        await createUserWithEmailAndPassword(auth, email, senha);
        alert("Conta criada com sucesso!");
    }
    catch (error) {
        
        if (error.code === "auth/email-already-in-use") {
            await signInWithEmailAndPassword(auth, email, senha);
        } else {
            alert(error.message);
        }
    }
});


// -------------------------------
// LOGIN COM GOOGLE
// -------------------------------
const provider = new GoogleAuthProvider();

btnGoogle.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error(error);
        alert("Erro ao logar com Google: " + error.message);
    }
});


// -------------------------------
// LOGOUT
// -------------------------------
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});


const listaRef = collection(db, "listaDeCompras");

async function adicionarItem() {
  const nome = document.getElementById("itemInput").value.trim();
  const categoria = document.getElementById("categoriaSelect").value;

  if (nome === "") {
    alert("Digite o nome do item.");
    return;
  }

  if (isOwner) {
    await addDoc(listaRef, {
      nome,
      categoria,
      comprado: false,
      ordem: lista.length
    });
  } else {
    lista.push({
      nome,
      categoria,
      comprado: false
    });
    salvarLista();
    renderizarLista();
  }

  document.getElementById("itemInput").value = "";
}

function renderizarLista(snapshot = null) {
  const div = document.getElementById("listasPorCategoria");
  div.innerHTML = "";

  let items = [];

  if (isOwner && snapshot) {
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
  } else {
    items = lista;
  }

  // Ordenar categorias (se quiser manter fixo)
  const ordemCategorias = ["Mercado", "Limpeza", "Açougue", "Hortifruti", "Adicionais"];
  const categorias = ordemCategorias.filter(cat =>
    items.some(item => item.categoria === cat)
  );

  categorias.forEach(categoria => {
    const catDiv = document.createElement("div");
    catDiv.className = "categoria";

    const titulo = document.createElement("h2");
    titulo.innerText = categoria;
    catDiv.appendChild(titulo);

    const ul = document.createElement("ul");
    
     ul.addEventListener("dragover", e => {
      e.preventDefault();
      const afterElement = getDragAfterElement(ul, e.clientY);
      const dragging = document.querySelector('.dragging');
      if (!dragging) return;

      if (afterElement == null) {
        ul.appendChild(dragging);
      } else {
        ul.insertBefore(dragging, afterElement);
      }
    });

    ul.addEventListener("drop", async e => {
      e.preventDefault();

      if (isOwner) {
        const lis = [...ul.querySelectorAll("li")];
        for (let i = 0; i < lis.length; i++) {
          const id = lis[i].dataset.id;
          await updateDoc(doc(db, "listaDeCompras", id), { ordem: i });
        }
      } else {
    
    const lis = [...ul.querySelectorAll("li")];
    lista = lis.map(li => {
      const nome = li.querySelector("span").innerText;
      const categoria = ul.dataset.categoria;
      const comprado = li.querySelector("input").checked;
      return { nome, categoria, comprado };
    });
        salvarLista();
      }
    });
    
    items
      .filter(i => i.categoria === categoria)
      .forEach(item => {
        const li = document.createElement("li");
        li.className = item.comprado ? "comprado" : "";
         li.draggable = true; 

        li.innerHTML = `
          <input type="checkbox" ${item.comprado ? "checked" : ""}>
          <span>${item.nome}</span>
          <button class="remove">X</button>
          
        `;
        
         li.addEventListener("dragstart", () => {
          li.classList.add("dragging");
        });

   
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });

        li.querySelector('input').addEventListener('change', async () => {
          if (isOwner) {
            await updateDoc(doc(db, "listaDeCompras", item.id), {
              comprado: !item.comprado
            });
          } else {
            item.comprado = !item.comprado;
            salvarLista();
            renderizarLista();
          }
          
        });

        li.querySelector('button').addEventListener('click', async () => {
          if (isOwner) {
            await deleteDoc(doc(db, "listaDeCompras", item.id));
          } else {
            lista = lista.filter(i => i !== item);
            salvarLista();
            renderizarLista();
          }
          
        });

        ul.appendChild(li);
      });

    catDiv.appendChild(ul);
    div.appendChild(catDiv);
  });
}

function salvarLista() {
  if (!isOwner) {
    localStorage.setItem("listaCompras", JSON.stringify(lista));
  }
}

function carregarLista() {
  if (!isOwner) {
    const data = localStorage.getItem("listaCompras");
    if (data) {
      lista = JSON.parse(data);
      renderizarLista();
    }
  }
}

window.onload = function() {
  if (isOwner) {
    const q = query(listaRef, orderBy("ordem"));
    onSnapshot(q, (snapshot) => {
      renderizarLista(snapshot);
    });
  } else {
    carregarLista();
  }
};



/* FUNÇAO BOTAO DESMARCAR*/ 
async function desmarcarTudo() {
  if (isOwner) {
       const snapshot = await getDocs(listaRef);
    snapshot.forEach(async (docSnap) => {
      await updateDoc(doc(db, "listaDeCompras", docSnap.id), {
        comprado: false
      });
    });
  } else {
    lista = lista.map(item => ({ ...item, comprado: false }));
    salvarLista();
    renderizarLista();
  }
}


document.getElementById("btnAdicionar").addEventListener("click", adicionarItem);
document.getElementById("btnDesmarcarTudo").addEventListener("click", desmarcarTudo);

