namespace NeuralEye.Services
{
    public interface ILatestImageStore
    {
        byte[]? LatestImage { get; set; }

        public void AppendImageChunk(byte[] chunk);
    }
}
