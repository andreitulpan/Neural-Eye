namespace NeuralEye.Services
{
    public interface IMqttService
    {
        public Task<string> ReceiveMessage();
    }
}
