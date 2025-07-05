// consumer.js
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "fraud-dashboard-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "fraud-report-group" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "fraud-reports", fromBeginning: true });

  console.log("🚀 Kafka consumer is listening for fraud reports...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`📥 Received message: ${message.value.toString()}`);
      // You can process the message here, e.g., trigger alerts
    },
  });
};

run().catch(console.error);
