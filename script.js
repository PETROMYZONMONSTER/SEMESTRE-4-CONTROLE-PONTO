// Função para obter a localização geográfica atual do usuário (retorna uma Promise)
function getUserLocation() {
    return new Promise((resolve, reject) => {
        // Solicita a posição atual do usuário
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Em caso de sucesso, resolve a Promise com as coordenadas da posição
                resolve({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                });
            },
            (error) => {
                // Em caso de erro (por exemplo, se o usuário negar a permissão), rejeita a Promise
                reject(error);
            }
        );
    });
}

// Seleciona elementos do DOM para exibir data, hora e botões
const diaSemana = document.getElementById("dia-semana"); // Elemento para exibir o dia da semana atual
const dataAtual = document.getElementById("data-atual"); // Elemento para exibir a data atual
const horaAtual = document.getElementById("hora-atual"); // Elemento para exibir a hora atual
const btnRegistrarPonto = document.getElementById("btn-registrar-ponto"); // Botão para registrar o ponto

// Adiciona um evento de clique ao botão "Registrar" para abrir o diálogo de registro
btnRegistrarPonto.addEventListener("click", register);

// Obtém o elemento de diálogo para registro de ponto
const dialogPonto = document.getElementById("dialog-ponto");

// Define a data e hora atuais no diálogo
const dialogData = document.getElementById("dialog-data");
dialogData.textContent = getCurrentDate();

const dialogHora = document.getElementById("dialog-hora");
dialogHora.textContent = getCurrentTime();

// Obtém o elemento de seleção para o tipo de registro (entrada, intervalo, etc.)
const selectRegisterType = document.getElementById("register-type");

// Obtém o botão "Registrar" dentro do diálogo
const btnDialogRegister = document.getElementById("btn-dialog-register");

// Adiciona um evento de clique ao botão "Registrar" dentro do diálogo
btnDialogRegister.addEventListener("click", async () => {
    // Cria um novo objeto de registro com o tipo selecionado
    let register = await getObjectRegister(selectRegisterType.value);

    // Salva o registro no localStorage
    saveRegisterLocalStorage(register);

    // Adiciona o registro à lista de tarefas (histórico)
    addTask(register);

    // Salva o último tipo de registro no localStorage
    localStorage.setItem("lastRegisterType", selectRegisterType.value);

    // Atualiza o tipo de registro para a próxima vez
    setRegisterType();

    // Fecha o diálogo
    dialogPonto.close();
});

// Função para definir o tipo de registro para a próxima entrada com base na última
function setRegisterType() {
    let lastType = localStorage.getItem("lastRegisterType");
    if (lastType === "entrada") {
        selectRegisterType.value = "intervalo";
    } else if (lastType === "intervalo") {
        selectRegisterType.value = "volta-intervalo";
    } else if (lastType === "volta-intervalo") {
        selectRegisterType.value = "saida";
    } else if (lastType === "saida") {
        selectRegisterType.value = "entrada";
    } else {
        // Valor padrão se nenhum lastType for encontrado
        selectRegisterType.value = "entrada";
    }
}

// Função assíncrona para criar um objeto de registro com data, hora, localização, id e tipo atuais
async function getObjectRegister(registerType) {
    let location;
    try {
        // Aguarda a localização do usuário
        location = await getUserLocation();
    } catch (error) {
        // Se houver erro (por exemplo, se o usuário negar a permissão), define a localização como nula
        console.error('Erro ao obter a localização:', error);
        location = null;
    }
    return {
        "date": getCurrentDate(),
        "time": getCurrentTime(),
        "location": location, // Localização do usuário ou null se indisponível
        "id": Date.now(), // ID único baseado no timestamp atual
        "type": registerType
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
    horaAtual.textContent = getCurrentTime();
}

// Define o dia da semana e a data atuais nos elementos correspondentes
diaSemana.textContent = getWeekday();
dataAtual.textContent = getCurrentDate();

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

// Função para adicionar uma tarefa (registro) à lista de tarefas (histórico)
function addTask(register) {
    let li = document.createElement('li');
    li.setAttribute('data-id', register.id); // Atribui o ID único ao elemento <li>

    li.textContent = `${register.type}: ${register.date} ${register.time}`;

    // Cria um botão de remover para a tarefa
    let removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.addEventListener('click', () => {
        removeTask(register.id);
    });

    li.appendChild(removeBtn);
    document.getElementById('tasksList').appendChild(li);
}

// Atualiza a hora atual imediatamente
updateContentHour();

// Atualiza a hora atual a cada segundo
setInterval(updateContentHour, 1000);

// Carrega os registros do localStorage e os exibe
loadRegisters();

// Logs de depuração no console
console.log(getWeekday());
console.log(getCurrentTime());
console.log(getCurrentDate());
