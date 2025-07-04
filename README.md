# Sistema de Chat - Arquitetura Distribuída de Microsserviços

Este projeto é um sistema de chat baseado em arquitetura de microsserviços. Ele permite que os usuários se registrem, façam login, enviem mensagens e recebam notificações em tempo real. Cada funcionalidade principal é gerenciada por um microsserviço independente, comunicando-se entre si por meio de um API Gateway e RabbitMQ como broker de mensagens.

Este foi um trabalho desenvolvido para a disciplina de Sistemas Distribuídos no CEFET-MG.

### Integrantes

- Nasser Rafael França Kilesse (20193018051)
- Guilherme Moreira de Carvalho (20183017767)

## Arquitetura

A arquitetura do sistema é composta por 3 microsserviços, um API Gateway e um broker de mensagens. A comunicação entre os microsserviços é feita por meio de requisições HTTP e mensagens assíncronas.

![Arquitetura](./docs/images/architecture.png)

### Componentes principais

- API Gateway: Encaminha as solicitações dos usuários para os microsserviços apropriados.
- User Service: Gerencia autenticação, registro e detalhes dos usuários.
- Chat Service: Gerencia mensagens entre os usuários.
- Notification Service: Envia notificações via push ou email.
- RabbitMQ: Broker de mensagens para comunicação assíncrona entre os serviços.
- MongoDB: Banco de dados usado pelos microsserviços para armazenar dados.

### Tecnologias utilizadas

- Node.js: Plataforma para execução dos serviços.
- TypeScript: Linguagem utilizada para maior segurança e produtividade.
- Express.js: Framework para criação de APIs RESTful.
- CloudeAMQP: Serviço de hospedagem do RabbitMQ.
- MongoDB: Banco de dados NoSQL.
- Brevo: Serviço de envio de notificações via push e email.
- Prometheus + Grafana: Monitoramento e visualização das métricas dos serviços.
- Docker: Containerização dos microsserviços.
- JMeter: Ferramenta para testes de carga.
- Web Postman: Ferramenta para testes de API.

### Microsserviço: User Service

O user-service gerencia:

- Registro de novos usuários.
- Login e autenticação JWT.
- Recuperação de informações dos usuários.

### Microsserviço: Chat Service

O chat-service gerencia:

- Envio de mensagens entre usuários.
- Recuperação de mensagens de um usuário específico.

### Microsserviço: Notification Service

O notification-service gerencia:

- Consumo de mensagens do RabbitMQ.
- Envio de notificações via push ou email.

### API Gateway

O API Gateway é responsável por encaminhar as solicitações dos usuários para os microsserviços apropriados.

## Configuração dos Serviços Utilizados

1.  MongoDB:

    - Use o [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) para configurar um cluster gratuito.

    - Configure o seu cluster e insira o seguinte IP na lista de permissões de rede para poder acessar o banco usando qualquer conexão:

    ```bash
    0.0.0.0/0
    ```

    - Clique em "Conectar", selecione "Drivers" e copie a URI de conexão fornecida pelo Atlas e configure no `.env` de cada microsserviço. Lembre-se de trocar o username e password para os que você usou ao configurar o seu banco:

    ```bash
    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chat-app?retryWrites=true&w=majority
    ```

2.  CloudAMQP:

    - Crie uma conta em [CloudAMQP](https://www.cloudamqp.com/).

    - Crie uma nova instância RabbitMQ:

    - Escolha um plano gratuito ou pago.

    - Copie a URL da instância (exemplo: amqp://user:password@hostname/vhost).

    - Configure a URL no arquivo `.env` de cada microsserviço:

    ```bash
    MESSAGE_BROKER_URL=amqp://user:password@hostname/vhost
    ```

3.  Brevo (antigo SendinBlue):

    - Crie uma conta no [Brevo](https://www.brevo.com/pt/).

    - Gere uma chave API no menu "SMTP & API" no canto superior direito.

    - Configure as variáveis no arquivo `.env` do `notification-service`:

    ```bash
    SENDINBLUE_APIKEY="{{YOUR_SENDINBLUE_APIKEY}}"
    SMTP_HOST="smtp-relay.brevo.com"
    SMTP_PORT=587
    SMTP_USER="{{YOUR_SENDINBLUE_ACCOUNT_EMAIL}}"
    SMTP_PASS="{{YOUR_SENDINBLUE_PASSWORD}}"
    EMAIL_FROM="{{YOUR_EMAIL_SOURCE}}"
    ```

4.  JWT Secret:

    - Configure uma chave secreta para assinar os tokens JWT no arquivo `.env` dos microsserviços:

    ```bash
    JWT_SECRET="your_secret_key"
    ```

## Executar o Projeto

### Requisitos

- Node.js `v22.x` ou superior.
- [Docker](https://www.docker.com/) e Docker Compose (Docker Desktop para windows).

### Montar imagem do frontend

Na pasta raiz do projeto, execute o seguinte comando para montar a imagem do frontend:

```bash
docker build -t frontend:latest ./chat-web-app
```

### Montar imagens do backend e subir containers

Após configurar as variáveis de ambiente, execute o seguinte comando para montar as imagens dos microsserviços e subir os containers:

```bash
docker-compose down -v --rmi 'all' && docker-compose up --build -d
```

### Acessar o frontend

Abra o navegador e acesse `http://localhost:85`.

### Encerrar os containers

Para encerrar os containers, execute o seguinte comando:

```bash
docker-compose down -v
```

## Observabilidade

### Prometheus e Grafana

O Prometheus é um sistema de monitoramento e alerta de código aberto que coleta métricas de sistemas e serviços. O Grafana é uma plataforma de análise e visualização de métricas.

Para acessar o Prometheus, acesse `http://localhost:9090`.

Para acessar o Grafana, acesse `http://localhost:3000` (usuário: `admin`, senha: `senha_segura`).

Antes, é necessário configurar o Prometheus no Grafana:

1.  Adicione o Prometheus como fonte de dados:

    - Acesse `http://localhost:3000/connections/datasources`.
    - Adicione uma fonte de dados Prometheus.
    - Configure a URL do Prometheus: `http://prometheus:9090` (esse é o endereço do prometheus na rede interna do Docker).

2.  Importe o dashboard:

    - Acesse `http://localhost:3000/dashboard/import`.
    - Importe o dashboard `./grafana/Express App-1739115774474.json` para visualizar as métricas dos microsserviços, como tempo de resposta, e quantidade de requisições.
    - Importe o dashboard `./grafana/node-exporter-full.json` para visualizar as métricas do sistema, como uso de CPU, memória e disco.

3.  Com o jmeter instalado, execute o seguinte comando para realizar testes de carga:

    ```bash
    jmeter -n -t test-plan-10.jmx -l resultados.jtl -e -o relatorio/
    ```
