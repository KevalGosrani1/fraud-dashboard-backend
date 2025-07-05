// utils/producer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'fraud-dashboard',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log('✅ Kafka producer connected');
}

async function sendMessage(topic, message) {
  await producer.send({
    topic: 'fraud-reports',
    messages: [{ value: JSON.stringify(message) }]
  });
  console.log(`📤 Kafka message sent to topic "${topic}"`);
}

module.exports = {
  connectProducer,
  sendMessage
};
