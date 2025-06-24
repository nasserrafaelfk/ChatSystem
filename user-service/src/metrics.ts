import { collectDefaultMetrics, Registry, Counter } from 'prom-client';
import promBundle from 'express-prom-bundle';
import { Request, Response } from 'express';

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

export const userDetailsRequests = new Counter({
  name: "user_details_requests_total",
  help: "Total de requisições recebidas na fila USER_DETAILS_REQUEST",
  labelNames: ["status"], // Sucesso ou falha
});

export const userDetailsResponses = new Counter({
  name: "user_details_responses_total",
  help: "Total de respostas enviadas na fila USER_DETAILS_RESPONSE",
  labelNames: ["status"], // Sucesso ou falha
});

registry.registerMetric(userDetailsRequests);
registry.registerMetric(userDetailsResponses);

// Endpoint separado para métricas
export const metricsEndpoint = (req: Request, res: Response) => {
  res.set('Content-Type', registry.contentType);
  registry.metrics().then(data => res.send(data));
};
