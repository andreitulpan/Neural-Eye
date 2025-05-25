namespace NeuralEye.Services
{
    public class LatestImageStore : ILatestImageStore
    {
        private byte[]? _latestImage = null;
        private readonly Lock _lock = new();

        public void AppendImageChunk(byte[] chunk)
        {
            lock (_lock)
            {
                if (_latestImage == null)
                {
                    _latestImage = chunk;
                }
                else
                {
                    // Combine existing bytes with new chunk
                    var combined = new byte[_latestImage.Length + chunk.Length];
                    Buffer.BlockCopy(_latestImage, 0, combined, 0, _latestImage.Length);
                    Buffer.BlockCopy(chunk, 0, combined, _latestImage.Length, chunk.Length);
                    _latestImage = combined;
                }
            }
        }

        public byte[]? LatestImage
        {
            get
            {
                lock (_lock)
                {
                    return _latestImage;
                }
            }
            set
            {
                lock (_lock)
                {
                    _latestImage = value;
                }
            }
        }
    }
}
