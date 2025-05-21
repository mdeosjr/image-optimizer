# Image Optimizer

## Descrição

O Image Optimizer é uma solução baseada em microsserviços para upload, processamento e otimização de imagens. Ele permite que usuários façam upload de imagens, que são então processadas de forma assíncrona, gerando versões otimizadas em diferentes qualidades e tamanhos. O sistema utiliza Node.js, Express, MongoDB, RabbitMQ e Sharp, com arquitetura desacoplada entre API e worker.

## Arquitetura

- **API**: Recebe uploads, armazena metadados e envia tarefas para a fila RabbitMQ.
- **Worker**: Consome tarefas da fila, processa as imagens (gera versões low, medium, high) e atualiza o status no MongoDB.
- **MongoDB**: Armazena informações das tarefas e metadados das imagens.
- **RabbitMQ**: Gerencia a fila de processamento assíncrono.
- **Volumes**: Imagens originais e otimizadas são salvas em volumes compartilhados.

```
Usuário → [API] → [RabbitMQ] → [Worker] → [MongoDB/Volumes]
```

## Configuração do Ambiente

### Pré-requisitos
- Docker e Docker Compose
- Node.js >= 18 (para desenvolvimento local)

### Variáveis de Ambiente
Consulte os arquivos `.env.example` em `src/api/` e `src/worker/` para todas as variáveis necessárias. Exemplos principais:

```
MONGODB_URI=mongodb://mongo:27017/image-optimizer
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
PORT=3000
UPLOAD_DIR=/tmp/uploads
NODE_ENV=development
OPTIMIZE_LOW_WIDTH=320
OPTIMIZE_LOW_QUALITY=40
OPTIMIZE_MEDIUM_WIDTH=640
OPTIMIZE_MEDIUM_QUALITY=70
OPTIMIZE_HIGH_WIDTH=1280
OPTIMIZE_HIGH_QUALITY=90
```

### Subindo o Projeto

1. Copie os arquivos de exemplo de ambiente:
   ```zsh
   cp src/api/.env.example src/api/.env
   cp src/worker/.env.example src/worker/.env
   ```
2. Suba os serviços com Docker Compose:
   ```zsh
   docker-compose up --build
   ```
   Isso irá iniciar MongoDB, RabbitMQ, API e Worker.

### Desenvolvimento Local (sem Docker)
1. Instale as dependências:
   ```zsh
   npm install
   ```
2. Inicie MongoDB e RabbitMQ localmente.
3. Inicie a API:
   ```zsh
   npm run start:api
   ```
4. Inicie o Worker:
   ```zsh
   npm run start:worker
   ```

## Executando os Testes

```zsh
npm test
```

## Exemplos de Uso da API

### Upload de Imagem
```zsh
curl -F "image=@/caminho/para/sua-imagem.jpg" http://localhost:3000/api/upload
```
**Resposta:**
```json
{
  "task_id": "<id-da-tarefa>",
  "status": "PENDING"
}
```

### Consultar Status da Tarefa
```zsh
curl http://localhost:3000/api/status/<id-da-tarefa>
```
**Resposta:**
```json
{
  "taskId": "...",
  "originalFilename": "...",
  "status": "COMPLETED",
  "originalMetadata": { ... },
  "processedAt": "...",
  "versions": {
    "low": { "path": "...", ... },
    "medium": { "path": "...", ... },
    "high": { "path": "...", ... }
  }
}
```

### Health Check
```zsh
curl http://localhost:3000/api/health
```

### Coleção Postman
Importe o arquivo `PostmanCollection.json` para testar todos os endpoints facilmente.

## Decisões de Design e Trade-offs
- **Processamento Assíncrono**: O uso de RabbitMQ desacopla o upload do processamento, melhorando escalabilidade e resiliência.
- **Persistência de Arquivos**: Imagens são salvas em volumes compartilhados para facilitar acesso entre API e worker.
- **Escalabilidade**: API e worker podem ser escalados separadamente.
- **Tratamento de Erros**: Middleware centralizado para logs e respostas padronizadas.
