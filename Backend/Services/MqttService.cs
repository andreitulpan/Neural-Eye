using Microsoft.AspNetCore.Http;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Server;

namespace NeuralEye.Services
{
    public class MqttService : IHostedService
    {
        private readonly ILatestImageStore _imageStore;
        private IMqttClient? _client;
        private readonly IWebSocketHandler _webSocketHandler;
        private readonly IConfiguration _configuration;

        public MqttService(ILatestImageStore imageStore, IWebSocketHandler webSocketHandler, IConfiguration configuration)
        {
            _imageStore = imageStore;
            _webSocketHandler = webSocketHandler;
            _configuration = configuration;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var factory = new MqttFactory();
            _client = factory.CreateMqttClient();

            _client.ApplicationMessageReceivedAsync += async e =>
            {
                var topicParts = e.ApplicationMessage.Topic.Split('/');

                var chunkId = Int32.Parse(topicParts[3]);
                var totalChunks = Int32.Parse(topicParts[4]);

                var bytes = e.ApplicationMessage.PayloadSegment.ToArray();
                
                if (_imageStore.LatestImage == null && chunkId != 0)
                {
                    Console.WriteLine($"Received chunk {chunkId} but no previous image found. Ignoring this chunk.");
                    return;
                }

                if (chunkId == 0)
                {
                    _imageStore.LatestImage = bytes;
                } 
                else if (totalChunks - 1 == chunkId)
                {
                    Console.WriteLine("Broadcasting complete image to WebSocket clients");
                    await _webSocketHandler.BroadcastAsync(_imageStore.LatestImage!);
                }
                else
                {
                    _imageStore.AppendImageChunk(bytes);
                }

                Console.WriteLine($"Appended chunk {chunkId}");
            };

            var user = _configuration["MQTT:User"];
            var password = _configuration["MQTT:Password"];
            var server = _configuration["MQTT:Server"];
            var port = Int32.Parse(_configuration["MQTT:Port"]!);

            var options = new MqttClientOptionsBuilder()
                .WithTcpServer(server, port)
                .WithCredentials(user, password)
                .Build();

            await _client.ConnectAsync(options, cancellationToken);
            await _client.SubscribeAsync(new MqttClientSubscribeOptionsBuilder()
                .WithTopicFilter("esp32-cam/jpeg/#")
                .Build());

            Console.WriteLine("MQTT client connected and subscribed");
        }


        public async Task StopAsync(CancellationToken cancellationToken)
        {
            if (_client != null)
            {
                await _client.DisconnectAsync(new MqttClientDisconnectOptions(), cancellationToken);
            }
        }
    }
}
