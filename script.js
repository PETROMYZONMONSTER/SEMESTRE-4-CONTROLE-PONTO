// Função para abrir o diálogo de confirmação de exclusão
function confirmDelete(id) {
    const dialogDelete = document.getElementById("dialog-delete");

    if (!dialogDelete) {
        console.error("Diálogo de exclusão não encontrado.");
        return;
    }

    // Configura o evento do botão "Sim"
    const confirmButton = document.getElementById("confirm-delete");
    confirmButton.onclick = () => {
        removeTask(id); // Chama a função para remover o item
        dialogDelete.close(); // Fecha o diálogo
    };

    dialogDelete.showModal(); // Exibe o diálogo
}



// Função para filtrar registros por semana, mês e ano
function filterRegisters(period) {
    const now = new Date();
    let filteredRegisters = registerLocalStorage.filter(register => {
        const registerDate = new Date(register.date.split('/').reverse().join('-')); // Converte para Date

        switch (period) {
            case 'week':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return registerDate >= oneWeekAgo;
            case 'month':
                return registerDate.getMonth() === now.getMonth() &&
                    registerDate.getFullYear() === now.getFullYear();
            case 'year':
                return registerDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    });

    displayFilteredRegisters(filteredRegisters);
}

// Função para exibir registros filtrados
function displayFilteredRegisters(filteredRegisters) {
    document.getElementById('tasksList').innerHTML = '';
    filteredRegisters.forEach(register => addTask(register));
}

// Adicionar eventos nos botões de filtro
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => filterRegisters(button.dataset.tab));
});

// Seleciona elementos do DOM para exibir data, hora e botões
const weekDay = document.getElementById("dia-semana"); // Elemento para exibir o dia da semana atual
const currentDate = document.getElementById("data-atual"); // Elemento para exibir a data atual
const currentHour = document.getElementById("hora-atual"); // Elemento para exibir a hora atual
const registerButton = document.getElementById("btn-registrar-ponto"); // Botão para registrar o ponto

// Adiciona um evento de clique ao botão "Registrar" para abrir o diálogo de registro
registerButton.addEventListener("click", register);

// Obtém o elemento de diálogo para registro de ponto
const dialogPonto = document.getElementById("dialog-ponto");

// Define a data, a hora e o dia atual no diálogo
const dialogDia = document.getElementById("dialog-dia");
dialogDia.textContent = getWeekday();

const dialogData = document.getElementById("dialog-data");
dialogData.textContent = getCurrentDate();

const dialogHora = document.getElementById("dialog-hora");
dialogHora.textContent = getCurrentTime();

// Obtém o elemento de seleção para o tipo de registro (entrada, intervalo, etc.)
const selectRegisterType = document.getElementById("register-type");

// Obtém o botão "Registrar" dentro do diálogo
const registerDialogButton = document.getElementById("btn-dialog-register");

const comentarioInput = document.getElementById("dialog-comentario");

registerDialogButton.addEventListener("click", async () => {
    let register = await getObjectRegister(selectRegisterType.value, comentarioInput.value);
    saveRegisterLocalStorage(register);
    addTask(register);
    localStorage.setItem("lastRegisterType", selectRegisterType.value);
    setRegisterType();
    dialogPonto.close();
});

// Função para definir o tipo de registro para a próxima entrada com base na última
function setRegisterType() {
    let lastType = localStorage.getItem("lastRegisterType");
    if (lastType === "Entrada") {
        selectRegisterType.value = "Intervalo";
    } else if (lastType === "Intervalo") {
        selectRegisterType.value = "Volta intervalo";
    } else if (lastType === "Volta intervalo") {
        selectRegisterType.value = "Saída";
    } else if (lastType === "Saída") {
        selectRegisterType.value = "Entrada";
    } else {
        // Valor padrão se nenhum lastType for encontrado
        selectRegisterType.value = "Entrada";
    }
}

// Função assíncrona para criar um objeto de registro com data, hora, localização, id e tipo atuais
async function getObjectRegister(registerType, comentario) {
    let location;
    try {
        location = await getUserLocation();
    } catch (error) {
        console.error('Erro ao obter a localização:', error);
        location = null;
    }
    return {
        "date": getCurrentDate(),
        "time": getCurrentTime(),
        "week": getWeekday(),
        "location": location,
        "id": Date.now(),
        "type": registerType,
        "comentario": comentario
    };
}

// Obtém o botão "Fechar" dentro do diálogo e adiciona um evento de clique para fechar o diálogo
const btnDialogFechar = document.getElementById("dialog-fechar");

btnDialogFechar.addEventListener("click", () => {
    dialogPonto.close();
});

// Obtém os registros do localStorage
let registerLocalStorage = getRegisterLocalStorage("register");

// Função para salvar um registro no localStorage
function saveRegisterLocalStorage(register) {
    // Adiciona o novo registro à lista existente
    registerLocalStorage.push(register);
    // Atualiza o localStorage com a lista atualizada de registros
    localStorage.setItem("register", JSON.stringify(registerLocalStorage));
}

// Função para obter registros do localStorage
function getRegisterLocalStorage(key) {
    let registers = localStorage.getItem(key);

    if (!registers) {
        // Se nenhum registro for encontrado, retorna um array vazio
        return [];
    }

    // Converte a string JSON em um objeto JavaScript
    return JSON.parse(registers);
}

// Função para carregar os registros do localStorage e exibi-los na lista de tarefas
function loadRegisters() {
    let registers = getRegisterLocalStorage("register");
    // Atualiza a variável registerLocalStorage com os registros obtidos
    registerLocalStorage = registers;
    // Adiciona cada registro à lista de tarefas
    registers.forEach(register => {
        addTask(register);
    });
}

// Função para abrir o diálogo de registro
function register() {
    dialogPonto.showModal();
}

// Função para remover uma tarefa (registro) pelo ID
function removeTask(id) {
    // Obtém a lista de registros do localStorage
    let registers = getRegisterLocalStorage("register");

    // Filtra a lista para remover o registro com o ID especificado
    registers = registers.filter(register => register.id !== id);

    // Atualiza o localStorage com a nova lista
    localStorage.setItem("register", JSON.stringify(registers));

    // Atualiza a variável registerLocalStorage em memória
    registerLocalStorage = registers;

    // Remove o elemento <li> da lista exibida
    let li = document.querySelector(`li[data-id='${id}']`);
    if (li) {
        li.parentNode.removeChild(li);
    }
}

// Função para atualizar a hora atual exibida
function updateContentHour() {
    currentHour.textContent = getCurrentTime();
}

// Define o dia da semana e a data atuais nos elementos correspondentes
weekDay.textContent = getWeekday();
currentDate.textContent = getCurrentDate();

// Função para obter a hora atual formatada como HH:mm:ss
function getCurrentTime() {
    const date = new Date();
    return String(date.getHours()).padStart(2, '0') + ":"
        + String(date.getMinutes()).padStart(2, '0') + ":"
        + String(date.getSeconds()).padStart(2, '0');
}

// Função para obter a data atual formatada como dd/mm/aaaa
function getCurrentDate() {
    const date = new Date();
    return date.toLocaleDateString("pt-br");
}

// Função para obter o dia da semana atual em português
function getWeekday() {
    const weekday = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const d = new Date();
    return weekday[d.getDay()];
}

// Função para adicionar uma tarefa à lista de tarefas
function addTask(register) {
    let li = document.createElement('li');
    li.setAttribute('data-id', register.id);

    li.innerHTML = `<h4>${register.type}</h4>
    <br><p>${register.date}</p>
    </br><p>${register.time}</p>
    <div class="comment-container">
    <br>${register.comentario || ''}
    </div>`;

    // Botão para editar o registro
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => openEditDialog(register));

    // Botão para remover o registro
    let removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.addEventListener('click', () => confirmDelete(register.id));

    li.appendChild(editBtn);
    li.appendChild(removeBtn);
    document.getElementById('tasksList').appendChild(li);
}

function openEditDialog(register) {
    const dialogEdit = document.getElementById('dialog-edit');
    const editDate = document.getElementById('edit-date');
    const editTime = document.getElementById('edit-time');
    const editComment = document.getElementById('edit-comment');

    // Preencher o formulário com os dados atuais do registro
    editDate.value = register.date.split('/').reverse().join('-'); // Converte para o formato YYYY-MM-DD
    editTime.value = register.time;
    editComment.value = register.comentario || '';

    // Configurar o botão de salvar
    document.getElementById('edit-dialog-save').onclick = () => {
        register.date = editDate.value.split('-').reverse().join('/');
        register.time = editTime.value;
        register.comentario = editComment.value;

        saveEditedRegister(register);
        dialogEdit.close(); // Fechar o diálogo
    };

    // Abrir o diálogo de edição
    dialogEdit.showModal();
}

function saveEditedRegister(editedRegister) {
    // Encontrar o índice do registro a ser editado
    const index = registerLocalStorage.findIndex(r => r.id === editedRegister.id);

    if (index !== -1) {
        // Atualizar o registro no array
        registerLocalStorage[index] = editedRegister;

        // Salvar no localStorage
        localStorage.setItem('register', JSON.stringify(registerLocalStorage));

        // Recarregar a lista de registros
        loadRegisters();
    }
}

document.getElementById('edit-dialog-cancel').onclick = () => {
    const dialogEdit = document.getElementById('dialog-edit');
    dialogEdit.close();
};

// Atualiza a hora atual imediatamente
updateContentHour();

// Atualiza a hora atual a cada segundo
setInterval(updateContentHour, 1000);

// Carrega os registros do localStorage e os exibe
loadRegisters();

function initializeTabContainer(tabContainer) {
    const tabButtons = tabContainer.querySelectorAll('.tab-button');
    const tabBackground = tabContainer.querySelector('.tab-background');
    const tabContentContainer = tabContainer.nextElementSibling;
    const tabItems = tabContentContainer.querySelectorAll('.ta-tab-item');
    let currentActiveTab = 0;

    function setActiveTab(newTabIndex) {
        const currentTab = tabButtons[currentActiveTab];
        const newTab = tabButtons[newTabIndex];

        tabButtons.forEach(button => button.classList.remove('active'));
        newTab.classList.add('active');

        tabItems.forEach(item => {
            if (item.dataset.tab === newTab.dataset.tab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const currentRect = currentTab.getBoundingClientRect();
        const newRect = newTab.getBoundingClientRect();
        const containerRect = tabButtons[0].parentElement.getBoundingClientRect();

        if (newTabIndex > currentActiveTab) {
            // Moving right
            tabBackground.style.width = `${newRect.right - currentRect.left}px`;
            tabBackground.style.left = `${currentRect.left - containerRect.left}px`;

            setTimeout(() => {
                tabBackground.style.width = `${newRect.width}px`;
                tabBackground.style.left = `${newRect.left - containerRect.left}px`;
            }, 150);
        } else {
            // Moving left
            tabBackground.style.width = `${currentRect.right - newRect.left}px`;
            tabBackground.style.left = `${newRect.left - containerRect.left}px`;

            setTimeout(() => {
                tabBackground.style.width = `${newRect.width}px`;
            }, 150);
        }

        currentActiveTab = newTabIndex;
    }

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => setActiveTab(index));
    });

    // Initialize the first tab as active
    setActiveTab(0);
}

// Seleção de elementos do DOM
const btnRegistrarAusencia = document.getElementById("btn-registrar-ausencia");
const dialogAusencia = document.getElementById("dialog-ausencia");
const saveAbsenceButton = document.getElementById("save-absence");
const absenceCommentInput = document.getElementById("absence-comment");
const absenceFileInput = document.getElementById("absence-file");
const tasksList = document.getElementById('tasksList');

// Evento para abrir o diálogo de justificativa de ausência
btnRegistrarAusencia.addEventListener("click", () => {
    dialogAusencia.showModal();
});

// Função para salvar a justificativa de ausência
saveAbsenceButton.addEventListener("click", () => {
    const comment = absenceCommentInput.value;
    const file = absenceFileInput.files[0];
    const absenceData = {
        comment: comment,
        fileName: file ? file.name : null,
        date: getCurrentDate(),
        id: Date.now(),
    };

    saveAbsenceLocalStorage(absenceData);
    addAbsenceToHistory(absenceData);
    dialogAusencia.close();
});

document.getElementById('ausencia-fechar').onclick = () => {
    const dialogClose = document.getElementById('dialog-ausencia');
    dialogClose.close();
};

// Função para salvar a ausência no localStorage
function saveAbsenceLocalStorage(absence) {
    let absences = getAbsencesLocalStorage();
    absences.push(absence);
    localStorage.setItem("absences", JSON.stringify(absences));
}

// Função para obter ausências do localStorage
function getAbsencesLocalStorage() {
    let absences = localStorage.getItem("absences");
    return absences ? JSON.parse(absences) : [];
}

// Função para adicionar a ausência ao histórico
function addAbsenceToHistory(absence) {
    let li = document.createElement('li');
    li.setAttribute('data-id', absence.id);

    let fileText = absence.fileName ? `Arquivo: ${absence.fileName}` : "Sem arquivo anexado";
    li.innerHTML = `<h4>Ausência</h4>
    <p>${absence.date}</p>
    <div class="comment-container">
        ${absence.comment}
        <hr>
        <h5><u>${fileText}</u></h5>
    </div>`;

    let removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.addEventListener('click', () => {
        removeTask(absence.id);
    });

    li.appendChild(removeBtn);
    tasksList.appendChild(li);
}

// Função para cancelar a exclusão e fechar o diálogo
const cancelDeleteButton = document.getElementById("cancel-delete");
cancelDeleteButton.onclick = () => {
    const dialogDelete = document.getElementById("dialog-delete");
    dialogDelete.close();
};


let removeBtn = document.createElement('button');
removeBtn.textContent = 'Remover';
removeBtn.addEventListener('click', () => {
    confirmDelete(register.id); // Chama a função para abrir o diálogo de confirmação
});

// Logs de depuração no console
console.log(getWeekday());
console.log(getCurrentTime());
console.log(getCurrentDate());

// Initialize all tab containers
document.querySelectorAll('.tab-container').forEach(initializeTabContainer);
