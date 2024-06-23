CREATE DATABASE clinica_consultas;
USE clinica_consultas;

CREATE TABLE pacientes (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

CREATE TABLE consultas (
	id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    especialidade VARCHAR(255) NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

SELECT consultas.id, consultas.data, consultas.hora, consultas.especialidade, pacientes.id AS paciente_id, pacientes.nome AS paciente_nome
FROM consultas
JOIN pacientes ON consultas.paciente_id = pacientes.id;

