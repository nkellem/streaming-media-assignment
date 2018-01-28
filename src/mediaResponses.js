const fs = require('fs');
const path = require('path');

const getParty = (request, response) => {
  const file = path.resolve(__dirname, '../client/party.mp4');

  getFileStats(file, request, response, 'video/mp4');
};

const getBird = (request, response) => {
  const file = path.resolve(__dirname, '../client/bird.mp4');

  getFileStats(file, request, response, 'video/mp4');
};

const getBling = (request, response) => {
  const file = path.resolve(__dirname, '../client/bling.mp3');

  getFileStats(file, request, response, 'audio/mpeg');
}

const getFileStats = (file, request, response, fileType) => {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let range = request.headers.range;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    writeStreamResponseHeader(response, fileType, chunksize, `bytes  ${start}-${end}/${total}`, 'bytes');

    return openStream(file, start, end, response);
  });
};

const writeStreamResponseHeader = (response, contentType, chunksize, contentRange, acceptRange) => {
  response.writeHead(206, {
    'Content-Range': contentRange,
    'Accept-Ranges': acceptRange,
    'Content-Length': chunksize,
    'Content-Type': contentType,
  });
};

const openStream = (file, start, end, response) => {
  const stream = fs.createReadStream(file, { start, end });

  stream.on('open', () => {
    stream.pipe(response);
  });

  return stream;
};

module.exports.getParty = getParty;
module.exports.getBird = getBird;
module.exports.getBling = getBling;
