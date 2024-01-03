//API indexDB

//indexDB es una DB no SQL, orientada a objetos, asíncrona (es decir que no hace falta actualizar para que se hagan cambios) y trabaja con objetos del DOM

"use strict";

// const IDBRequest = indexedDB;

// console.log(IDBRequest);    //Esto da la "fábrica" de base de datos, ya que como tal todavía no es una petición ni nada

const IDBRequest = indexedDB.open("usuarios", 1);   //Esto indica que si existe una base de datos con un nombre, en este caso 'usuarios', se abre, y si no existe se crea; el siguiente parámetro indica la versión

// console.log(IDBRequest);

IDBRequest.addEventListener("upgradeneeded", ()=> { //Esto se encarga de crear la base de datos
    console.log("Se creó correctamente");
    const db = IDBRequest.result;   //Se está pidiendo abrir la base de datos
    db.createObjectStore("nombres", {  //Se comienza con la creación de los objetos, para este caso su nombre es 'nombres'
        autoIncrement: true //Aqui se registra lo que es el key, indicando aquí que el valor se auto incremente para así ser único
    });
});

IDBRequest.addEventListener("success", ()=> {
    console.log("Todo correcto");
    leerObjetos();
});

IDBRequest.addEventListener("error", ()=> console.log("ocurrió un error al abrir la DB"));

document.getElementById('add').addEventListener("click", ()=> {
    let nombre = document.getElementById("nombre").value;
    if(nombre.length > 0) {
        if(document.querySelector(".posible") != undefined) {
            if(confirm("Hay elementos sin guardar, ¿Seguro que quieres continuar sin guardarlos?")) {
                addObjeto({nombre:nombre});
                leerObjetos();
            }
        } else {
            addObjeto({nombre:nombre});
            leerObjetos();
        }

    }
})

const addObjeto = objeto=> {
    const IDBData = getIDBData("readwrite", "objeto agregado");
    IDBData.add(objeto);
}

const leerObjetos = ()=> {
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    const fragment = document.createDocumentFragment();
    document.querySelector(".nombres").innerHTML = "";
    // document.getElementById("nombreInput").innerHTML = "";
    cursor.addEventListener("success", ()=> {
        if(cursor.result) {
            let elemento = nombresHTML(cursor.result.key, cursor.result.value);
            // console.log(cursor.result.value); //se borra esto para agregar lo de abajo
            fragment.appendChild(elemento);
            cursor.result.continue();
        } else document.querySelector(".nombres").appendChild(fragment);
    })
}
//Al escribir en la consola la función 'leerObjetos()' se leen todos los objetos de nuestra db

const modificarObjeto = (key, objeto) => {
    const IDBData = getIDBData("readwrite", "objeto modificado");
    IDBData.put(objeto, key);
}

const eliminarObjeto = key=> {
    const IDBData = getIDBData("readwrite", "Objeto Eliminado");
    IDBData.delete(key);
}

const getIDBData = (mode, msg)=> {
    const db = IDBRequest.result;
    const IDBtransaction = db.transaction("nombres", mode);
    const objectStore = IDBtransaction.objectStore("nombres");
    IDBtransaction.addEventListener("complete", ()=> {
        console.log(msg);
    })
    return objectStore;
}

//----- NUEVO ------

const nombresHTML = (id, name)=> {
    const container = document.createElement("DIV");
    const h2 = document.createElement("h2");
    const options = document.createElement("DIV");
    const saveButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    container.classList.add("nombre");
    options.classList.add("options");
    saveButton.classList.add("imposible");
    deleteButton.classList.add("delete");

    saveButton.textContent = "Guardar";
    deleteButton.textContent = "Eliminar";
    h2.textContent = name.nombre;
    h2.setAttribute("contenteditable", "true");
    h2.setAttribute("spellcheck", "false");

    //------ appendChild -------
    options.appendChild(saveButton);
    options.appendChild(deleteButton);

    container.appendChild(h2);
    container.appendChild(options);

    h2.addEventListener("keyup", ()=> {
        saveButton.classList.replace("imposible", "posible");
    });

    saveButton.addEventListener("click", ()=> {
        if(saveButton.className == "posible") {
            modificarObjeto(id, {nombre : h2.textContent});
            saveButton.classList.replace("posible", "imposible");
        }
    });

    deleteButton.addEventListener("click", ()=> {
        eliminarObjeto(id);
        document.querySelector(".nombres").removeChild(container);
    })

    return container;
}

