import amqp, { Channel, Connection } from "amqplib";
import config from "../config/configs";
import { FCMService } from "./FCMService";
import { EmailService } from "./EmailService";
import { UserStatusStore } from "../utils";
import { notificationsProcessed, notificationsSent, rabbitmqConnectionStatus, rabbitmqMessagesProcessed } from "../metrics";

class RabbitMQService {
  private channel!: Channel;
  private fcmService = new FCMService();
  private emailService = new EmailService();
  private userStatusStore = new UserStatusStore();
  private connection!: Connection;

  constructor() {
    this.init();
  }

  async init() {
    // const connection = await amqp.connect(config.msgBrokerURL!);
    try {
      this.connection = await amqp.connect(config.msgBrokerURL!);
      rabbitmqConnectionStatus.set(1); // Conexão bem-sucedida

      this.channel = await this.connection.createChannel();
      await this.consumeNotification();

      this.connection.on('close', () => {
        rabbitmqConnectionStatus.set(0);
      });

    } catch (error) {
      rabbitmqConnectionStatus.set(0);
      throw error;
    }
  }

  async consumeNotification() {
    await this.channel.assertQueue(config.queue.notifications);
    this.channel.consume(config.queue.notifications, async (msg) => {
      if (msg) {
        try {
          const {
            type,
            userId,
            message,
            userEmail,
            userToken,
            fromName,
          } = JSON.parse(msg.content.toString());

          notificationsProcessed.inc({ type, status: 'received' });

          if (type === "MESSAGE_RECEIVED") {
            const isUserOnline = this.userStatusStore.isUserOnline(userId);

            if (isUserOnline && userToken) {
              try {
                await this.fcmService.sendPushNotification(userToken, message);
                notificationsSent.inc({ method: 'push' });
                notificationsProcessed.inc({ type, status: 'sent_push' });
              } catch (error) {
                notificationsProcessed.inc({ type, status: 'failed_push' });
                console.error('Failed to send push notification:', error);
              }
            } else if (userEmail) {
              try {
                await this.emailService.sendEmail(
                  userEmail,
                  `New Message from ${fromName}`,
                  message
                );
                notificationsSent.inc({ method: 'email' });
                notificationsProcessed.inc({ type, status: 'sent_email' });
              } catch (error) {
                notificationsProcessed.inc({ type, status: 'failed_email' });
                console.error('Failed to send email:', error);
              }
            } else {
              notificationsProcessed.inc({ type, status: 'undeliverable' });
            }
          }

          this.channel.ack(msg);

          rabbitmqMessagesProcessed.inc({
            queue: config.queue.notifications,
            status: 'success'
          });
        } catch (error) {
          rabbitmqMessagesProcessed.inc({
            queue: config.queue.notifications,
            status: 'failed'
          });
        }
      }
    });
  }
}

export const rabbitMQService = new RabbitMQService();
