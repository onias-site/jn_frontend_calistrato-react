const express = require('express');
const { Pool } = require('pg');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
});

//TODO : VAGAS

const JSON_SERVER_URL = 'http://localhost:3333'; // URL do JSON Server

// Rota para buscar todas as vagas do JSON Server
app.get('/vagas', async (req, res) => {
    try {
        const response = await axios.get(`${JSON_SERVER_URL}/vagas`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados' });
    }
});

// Rota para buscar uma vaga específica do JSON Server
app.get('/vagas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${JSON_SERVER_URL}/vagas/${id}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados' });
    }
});

// Rota para criar uma nova vaga no JSON Server
app.post('/vagas', async (req, res) => {
    try {
        const response = await axios.post(`${JSON_SERVER_URL}/vagas`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao inserir dados', error: error.toString() });
    }
});

// Rota para atualizar uma vaga no JSON Server
app.patch('/vagas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.patch(`${JSON_SERVER_URL}/vagas/${id}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar dados', error: error.toString() });
    }
});

// Rota para excluir uma vaga no JSON Server
app.delete('/vagas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.delete(`${JSON_SERVER_URL}/vagas/${id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir dados', error: error.toString() });
    }
});



app.listen(3333, () => {
    console.log('Servidor rodando na porta 3333');
});
