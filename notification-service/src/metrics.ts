import client from 'prom-client';
import promBundle from 'express-prom-bundle';
import { Request, Response } from 'express';

const { collectDefaultMetrics, Registry } = client;

// Configuração do registry
export const registry = new Registry();
collectDefaultMetrics({ register: registry });

// Middleware para métricas HTTP
export const metricsMiddleware = promBundle({
  autoregister: false,
  includeMethod: true,
  includePath: true,
  customLabels: { service: process.env.SERVICE_NAME },
  promRegistry: registry
});

const notificationsProcessed = new client.Counter({
  name: 'notifications_processed_total',
  help: 'Total number of notifications processed',
  labelNames: ['type', 'status']
});

const notificationsSent = new client.Counter({
  name: 'notifications_sent_total',
  help: 'Total number of notifications sent',
  labelNames: ['method']
});

export const rabbitmqMessagesProcessed = new client.Counter({
  name: 'rabbitmq_messages_processed_total',
  help: 'Total de mensagens processadas pelo RabbitMQ',
  labelNames: ['queue', 'status']
});

export const rabbitmqConnectionStatus = new client.Gauge({
  name: 'rabbitmq_connection_status',
  help: 'Status da conexão AMQP (1 = conectado, 0 = desconectado)'
});

registry.registerMetric(notificationsProcessed);
registry.registerMetric(notificationsSent);
registry.registerMetric(rabbitmqMessagesProcessed);
registry.registerMetric(rabbitmqConnectionStatus);

// Endpoint separado para métricas
export const metricsEndpoint = (req: Request, res: Response) => {
  res.set('Content-Type', registry.contentType);
  registry.metrics().then(data => res.send(data));
};

export { notificationsProcessed, notificationsSent };
