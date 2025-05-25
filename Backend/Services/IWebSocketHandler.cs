using System.Net.WebSockets;

namespace NeuralEye.Services
{
    public interface IWebSocketHandler
    {
        Task AddSocketAsync(WebSocket socket);
        Task RemoveSocketAsync(WebSocket socket);
        Task BroadcastAsync(byte[] data);
    }
}
