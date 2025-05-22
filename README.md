# Image Optimizer

## Descrição

O Image Optimizer é uma solução baseada em microsserviços para upload, processamento e otimização de imagens. Ele permite que usuários façam upload de imagens, que são então processadas de forma assíncrona, gerando versões otimizadas em diferentes qualidades e tamanhos. O sistema utiliza Node.js, Express, MongoDB, RabbitMQ e Sharp, com arquitetura limpa e desacoplada entre API e worker.

## Fluxo

- **API**: Recebe uploads, armazena metadados e envia tarefas para a fila RabbitMQ.
- **Worker**: Consome tarefas da fila, processa as imagens (gera versões low, medium, high) e atualiza o status no MongoDB.
- **MongoDB**: Armazena informações das tarefas e metadados das imagens.
- **RabbitMQ**: Gerencia a fila de processamento assíncrono.
- **Volumes**: Imagens originais e otimizadas são salvas em volumes compartilhados.
- **Retry**: Sistema de retentativas automáticas para tarefas que falharem durante o processamento.

```
           ┌──── (retry) ────┐
           │                 ↓
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

## Design e Arquitetura

O projeto segue princípios da Clean Architecture, buscando separar regras de negócio, casos de uso, interfaces e detalhes de infraestrutura. Veja como isso se reflete na estrutura e decisões do projeto:

### Estrutura de Pastas

- `domain/`: Contém entidades, interfaces de repositórios e serviços, totalmente independentes de frameworks e infraestrutura. É o núcleo do negócio.
- `infrastructure/`: Implementações concretas de repositórios, serviços de mensageria, logger, banco de dados, etc. Depende de frameworks e bibliotecas externas.
- `api/` e `worker/`: Camadas de interface (controllers, rotas, inicialização), responsáveis por receber requisições, orquestrar casos de uso e injetar dependências.
- `utils/`: Utilitários e middlewares genéricos, organizados por funcionalidade:
  - `errors/`: Tratamento de erros e exceções personalizado
  - `image/`: Processamento e manipulação de imagens
  - `retry/`: Mecanismo de retentativas para operações falhas

### Princípios e Padrões Utilizados

- **Inversão de Dependência**: Casos de uso e domínio dependem apenas de interfaces, nunca de implementações concretas.
- **Repository Pattern**: Abstrai o acesso a dados, facilitando troca de banco e testes.
- **Singleton**: Serviços de conexão (ex: banco, mensageria) garantem instância única.
- **Dependency Injection**: Implementações concretas são injetadas na borda do sistema (ex: controllers, server).
- **Middleware**: Logging e tratamento de erros centralizados.

### Sistema de Retry

O sistema implementa um mecanismo básico de retry para tarefas que falham:

- Quando uma tarefa falha, é registrado um contador de tentativas (`retryCount`).
- Se o contador não ultrapassar o máximo (3 tentativas), a tarefa é reenviada para a mesma fila de processamento.
- Cada retentativa ocorre com um backoff exponencial (1s, 2s, 4s) para evitar sobrecarga.
- A tarefa mantém o status `FAILED` durante as retentativas, mas com uma mensagem indicando qual tentativa está em andamento.
- Após exceder o número máximo de tentativas, a tarefa permanece como `FAILED` definitivamente.

### Justificativa da Estrutura

- O domínio não depende de nada externo, facilitando testes e manutenção.
- Infraestrutura fica isolada, podendo ser trocada sem afetar regras de negócio.
- API e Worker compartilham apenas o que for necessário do domínio e das interfaces, mantendo baixo acoplamento.
- Utilitários e middlewares ficam fora do domínio, evitando poluição do núcleo do negócio.
- API e Worker foram separados visando escalabilidade separada (diferentes Dockerfiles). Foi mantido no mesmo projeto, sob o mesmo package.json, pois acabam compartilhando muito entre si como o domínio e infraestutura.
