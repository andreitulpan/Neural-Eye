using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace NeuralEye.Services
{
    public class WebSocketHandler : IWebSocketHandler
    {
        private readonly ConcurrentBag<WebSocket> _sockets = new();

        public Task AddSocketAsync(WebSocket socket)
        {
            _sockets.Add(socket);
            return Task.CompletedTask;
        }

        public Task RemoveSocketAsync(WebSocket socket)
        {
            _sockets.TryTake(out socket);
            return Task.CompletedTask;
        }

        public async Task BroadcastAsync(byte[] data)
        {
            var tasks = _sockets
                .Where(ws => ws.State == WebSocketState.Open)
                .Select(ws => ws.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Binary, true, CancellationToken.None));

            await Task.WhenAll(tasks);
        }
    }
}
