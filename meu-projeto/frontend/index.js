let consultasAgendadas = [] // vai listar as consultas agendadas
let pacientesCadastrados = []

function cadastrarPaciente() {
  let nome = prompt("Digite o nome do paciente:")
  let telefone = prompt("Digite o telefone do paciente:")

  obterPacientes()
    .then((pacientes) => {
      // Verifica duplicidade de telefone
      if (pacientes.some((paciente) => paciente.telefone === telefone)) {
        alert("Paciente já cadastrado com esse telefone!")
        return
      }

      fetch("http://localhost:3000/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, telefone }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao cadastrar paciente")
          }
          return response.json()
        })
        .then((data) => {
          alert(data.message)
          mostrarPacientes()
        })
        .catch((error) => {
          console.error("Erro ao cadastrar paciente:", error)
          alert("Erro ao cadastrar paciente: " + error.message)
        })
    })
    .catch((error) => {
      console.error("Erro ao obter pacientes:", error)
      alert("Erro ao obter pacientes: " + error.message)
    })
}

function verificarDisponibilidadeConsulta(data, hora) {
  return consultasAgendadas.some(
    (consulta) => consulta.data === data && consulta.hora === hora
  )
}

function verificarDataValida(data) {
  let partesData = data.split("/")
  let dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`

  let hoje = new Date()
  let dataConsulta = new Date(dataFormatada)

  return dataConsulta >= hoje
}

function selecionarPaciente(pacientes) {
  if (pacientes.length === 0) {
    alert("Não há pacientes disponíveis.")
    return null // Retorna null se não houver pacientes
  }

  let escolha = prompt(
    "Selecione o número do paciente para marcar consulta:\n" +
      pacientes
        .map((paciente, index) => `${index + 1}. ${paciente.nome}`)
        .join("\n")
  )

  if (escolha === null) {
    return null // Retorna null se o usuário cancelar
  }

  let indice = parseInt(escolha) - 1
  if (isNaN(indice) || indice < 0 || indice >= pacientes.length) {
    alert("Escolha inválida. Tente novamente.")
    return selecionarPaciente(pacientes) // Chamada recursiva para escolher novamente
  }

  return pacientes[indice] // Retorna o paciente selecionado
}

async function obterPacientes() {
  try {
    const response = await fetch("http://localhost:3000/pacientes")
    if (!response.ok) {
      throw new Error("Erro ao obter pacientes")
    }
    return await response.json()
  } catch (error) {
    console.error("Erro ao obter pacientes:", error)
    throw error
  }
}

async function obterConsultas() {
  try {
    const response = await fetch("http://localhost:3000/consultas")
    if (!response.ok) {
      throw new Error("Erro ao obter consultas")
    }
    const consultas = await response.json()
    
    if(Array.isArray(consultas)) {
      consultasAgendadas = consultas.map(consulta => ({
        id: consulta.id,
        data: consulta.data,
        hora: consulta.hora,
        especialidade: consulta.especialdiade,
        paciente: {
          id: consulta.paciente_id,
          nome: consulta.paciente_nome,
        },
      }));
    } else {
      throw new Error("Dados de consultas inválidos")
    }

    return consultas
  } catch (error) {
    console.error("Erro ao obter consultas:", error)
    throw error
  }
}

function formatarData(data) {
  const partes = data.split('/')
  if(partes.length !== 3) {
    throw new Error('Formato de data inválido')
  }
  const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`
  return dataFormatada
}

function marcarConsulta() {
  obterPacientes()
    .then((pacientes) => {
      if (pacientes.length === 0) {
        alert("Não há pacientes cadastrados para marcar consulta.")
        return
      }

      let pacienteIndex = prompt(
        "Selecione o número do paciente para marcar consulta:\n" +
          pacientes
            .map((paciente, index) => `${index + 1}. ${paciente.nome}`)
            .join("\n")
      )

      if (pacienteIndex === null) {
        return // cancelado pelo usuário
      }

      pacienteIndex = parseInt(pacienteIndex) - 1

      if (pacienteIndex < 0 || pacienteIndex >= pacientes.length) {
        alert("Número de paciente inválido.")
        return
      }

      let pacienteSelecionado = pacientes[pacienteIndex]
      let data = prompt("Digite a data da consulta (DD/MM/AAAA):")
      let hora = prompt("Digite a hora da consulta (HH:MM):")
      let especialidade = prompt("Digite a especialidade da consulta:")

      const dataFormatada = formatarData(data)

      // Verifica data válida
      if (!verificarDataValida(data)) {
        alert("A data da consulta não pode ser retroativa.")
        return
      }

      // Verifica disponibilidade de consulta
      if (verificarDisponibilidadeConsulta(data, hora)) {
        alert("Já existe uma consulta marcada para esta data e hora.")
        return
      }

      fetch("http://localhost:3000/consultas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paciente_id: pacienteSelecionado.id,
          data: dataFormatada,
          hora,
          especialidade,
        })
      })
      
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao marcar consulta")
          }
          return response.json()
        })
        .then((consulta) => {
          consultasAgendadas.push(consulta)
          alert("Consulta marcada com sucesso!")
          mostrarPacientes()
        })
        .catch((error) => {
          console.error("Erro ao marcar consulta:", error)
          alert("Erro ao marcar consulta: " + error.message)
        })
    })
    .catch((error) => {
      console.error("Erro ao obter pacientes:", error)
      alert("Erro ao obter pacientes: " + error.message)
    })
}


async function cancelarConsulta() {
  
  try {
   // Obter consultas agendadas
   let consultas = await obterConsultas();

   // Verificar se consultas é um array válido
   if (!Array.isArray(consultas)) {
     throw new Error("Dados de consultas inválidos");
   }

    // Mapeia os dados das consultas para a estrutura desejada
    if (Array.isArray(consultas)) {
      consultasAgendadas = consultas.map((consulta) => ({
        id: consulta.id,
        data: consulta.data,
        hora: consulta.hora,
        especialidade: consulta.especialidade,
        paciente: {
          id: consulta.paciente_id,
          nome: consulta.paciente_nome,
        },
      }));
    } else {
      throw new Error("Dados de consultas inválidos");
    }

    // Criar lista de opções válidas para seleção
    let consultasValidas = consultasAgendadas.map((consulta, index) => {
      const pacienteNome = consulta.paciente && consulta.paciente.nome ? consulta.paciente.nome : "Nome indisponível"
      const data = consulta.data ? new Date(consulta.data).toLocaleDateString('pt-BR') : "Data indisponível";
      const hora = consulta.hora ? consulta.hora : "Hora indisponível";
      return `${index + 1}. ${pacienteNome} - ${data} ${hora}`;
    }).join("\n");

    // Exibir prompt para seleção de consulta
    let consultaIndex = prompt(
      "Selecione o número da consulta para cancelar:\n" + consultasValidas
    );

      // Verificar se consultasAgendadas está corretamente preenchido
    if (consultasAgendadas.length === 0) {
      alert("Não há consultas agendadas para cancelar.");
      return;
    }

    if (consultaIndex === null) {
      return; // cancelado pelo usuário
    }

    consultaIndex = parseInt(consultaIndex) - 1;

    if (isNaN(consultaIndex) || consultaIndex < 0 || consultaIndex >= consultasAgendadas.length) {
      alert("Número de consulta inválido.");
      return;
    }

    let consultaCancelada = consultasAgendadas[consultaIndex];

    // Verificar se os dados da consulta e do paciente estão disponíveis
    if (!consultaCancelada || !consultaCancelada.paciente || !consultaCancelada.paciente.nome) {
      alert("Consulta inválida. Não pode ser cancelada.");
      return;
    }

    let confirmacao = confirm(
      `Tem certeza que deseja cancelar a consulta de ${consultaCancelada.paciente.nome} no dia ${consultaCancelada.data} às ${consultaCancelada.hora}?`
    );

    if (confirmacao) {
      // Remove a consulta da lista de consultas agendadas
      consultasAgendadas.splice(consultaIndex, 1);
      alert("Consulta cancelada com sucesso!");
      mostrarPacientes();
    }
  } catch (error) {
    console.error("Erro ao cancelar consulta:", error);
    alert("Erro ao cancelar consulta: " + error.message);
  }
}

function removerPaciente() {
  obterPacientes()
    .then((pacientes) => {
      if (pacientes.length === 0) {
        alert("Não há pacientes cadastrados para remover.")
        return
      }

      let pacienteIndex = prompt(
        "Selecione o número do paciente para remover:\n" +
          pacientes
            .map((paciente, index) => `${index + 1}. ${paciente.nome}`)
            .join("\n")
      )

      if (pacienteIndex === null) {
        return // cancelado pelo usuário
      }

      pacienteIndex = parseInt(pacienteIndex) - 1

      if (pacienteIndex < 0 || pacienteIndex >= pacientes.length) {
        alert("Número de paciente inválido.")
        return
      }

      let pacienteRemovido = pacientes[pacienteIndex]

      fetch(`http://localhost:3000/pacientes/${pacienteRemovido.id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao remover paciente")
          }
          return response.text()
        })
        .then((data) => {
          alert(data)
          mostrarPacientes()
          // Atualiza a lista de pacientes após a remoção
          obterPacientes()
            .then((pacientesAtualizados) => {
              pacientesCadastrados = pacientesAtualizados
            })
            .catch((error) => {
              console.error("Erro ao obter pacientes:", error)
              alert("Erro ao obter pacientes: " + error.message)
            })
        })
        .catch((error) => {
          console.error("Erro ao remover paciente:", error)
          alert("Erro ao remover paciente: " + error.message)
        })
    })
    .catch((error) => {
      console.error("Erro ao obter pacientes:", error)
      alert("Erro ao obter pacientes: " + error.message)
    })
}

function formatarConsulta(consulta) {
  return consulta ? "Sim" : "Não"
}

function formatarDataParaMostrar(dataString) {
  const data = new Date(dataString);
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const ano = data.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

async function mostrarPacientes() {
  try {
    const [pacientes, consultas] = await Promise.all([
      obterPacientes(),
      obterConsultas(),
    ])

    const pacientesTable = document.createElement("table")
    pacientesTable.innerHTML = `
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Consulta Marcada</th>
          <th>Data</th>
          <th>Horário</th>
          <th>Especialidade</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `
    const tbody = pacientesTable.querySelector("tbody")

    pacientes.forEach((paciente) => {
      const consulta = consultas.find((c) => c.paciente_id === paciente.id)
      const pacienteRow = document.createElement("tr")
      pacienteRow.innerHTML = `
        <td>${paciente.nome}</td>
        <td>${paciente.telefone}</td>
        <td>${formatarConsulta(consulta)}</td>
        <td>${consulta ? formatarDataParaMostrar(consulta.data) : "-"}</td>
        <td>${consulta ? consulta.hora : "-"}</td>
        <td>${consulta ? consulta.especialidade : "-"}</td>
      `
      tbody.appendChild(pacienteRow)
    })

    const pacientesContainer = document.getElementById("pacientesContainer")
    pacientesContainer.innerHTML = ""
    pacientesContainer.appendChild(pacientesTable)

    // Esconde o botão de mostrar pacientes cadastrados
    document.getElementById("btnMostrarPacientes").style.display = "none"

    // Adiciona botão para não mostrar pacientes
    const btnEsconderPacientes = document.createElement("button")
    btnEsconderPacientes.textContent = "Não Mostrar Pacientes Cadastrados"
    btnEsconderPacientes.addEventListener("click", esconderPacientes)
    pacientesContainer.appendChild(btnEsconderPacientes)
  } catch (error) {
    console.error("Erro ao mostrar pacientes:", error)
    alert("Erro ao mostrar pacientes: " + error.message)
  }
}

function esconderPacientes() {
  const pacientesContainer = document.getElementById("pacientesContainer")
  pacientesContainer.innerHTML = ""

  const btnMostrarPacientes = document.createElement("button")
  btnMostrarPacientes.textContent = "Mostrar Pacientes Cadastrados"
  btnMostrarPacientes.addEventListener("click", mostrarPacientes)
  pacientesContainer.appendChild(btnMostrarPacientes)
}

document
  .getElementById("btnCadastrar")
  .addEventListener("click", cadastrarPaciente)
document
  .getElementById("btnMostrarPacientes")
  .addEventListener("click", mostrarPacientes)
document
  .getElementById("btnRemoverPaciente")
  .addEventListener("click", removerPaciente)
document
  .getElementById("btnMarcarConsulta")
  .addEventListener("click", marcarConsulta)
document
  .getElementById("btnCancelarConsulta")
  .addEventListener("click", cancelarConsulta)
