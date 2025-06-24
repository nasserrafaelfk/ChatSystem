import { collectDefaultMetrics, Registry, Counter } from 'prom-client';
import promBundle from 'express-prom-bundle';
import { Request, Response } from 'express';

// Configuração do registry
const registry = new Registry();
collectDefaultMetrics({ register: registry });

// Middleware para métricas HTTP
const metricsMiddleware = promBundle({
  autoregister: false,
  includeMethod: true,
  includePath: true,
  customLabels: { service: process.env.SERVICE_NAME },
  promRegistry: registry,
});

const userDetailsRequests = new Counter({
  name: "user_details_requests_total",
  help: "Total de requisições para detalhes do usuário",
  labelNames: ["status"], // Sucesso ou falha
});

const notificationsSent = new Counter({
  name: "notifications_sent_total",
  help: "Total de notificações enviadas",
  labelNames: ["type"], // Tipo de notificação
});

registry.registerMetric(userDetailsRequests);
registry.registerMetric(notificationsSent);

// Endpoint separado para métricas
const metricsEndpoint = (req: Request, res: Response) => {
  res.set('Content-Type', registry.contentType);
  registry.metrics().then(data => res.send(data));
};

export { metricsMiddleware, metricsEndpoint, registry, userDetailsRequests, notificationsSent };