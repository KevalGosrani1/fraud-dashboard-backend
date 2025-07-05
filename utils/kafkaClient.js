// kafka.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'fraud-dashboard',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

async function connectProducer() {
  try {
    await producer.connect();
    console.log('✅ Kafka producer connected');
  } catch (err) {
    console.error('❌ Kafka producer failed to connect:', err);
  }
}

module.exports = { producer, connectProducer };
