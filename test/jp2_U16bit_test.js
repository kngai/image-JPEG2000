// load modules
global.PDFJS = {};
var fs = require('fs');
var vm = require('vm');
vm.runInThisContext(fs.readFileSync('./dist/jpx.js', 'utf8') + '');

function testJp2Decode(filename, test, lossless) {
    //load jp2 file using
    var jp2FileAsBuffer = fs.readFileSync('./test/data/' + filename + '.jp2');
    var jp2FileAsByteArray = new Uint8Array(jp2FileAsBuffer);

    //decode JPEG2000 steam
    var jpxImage = new global.JpxImage();
    var startTime = Date.now();
    jpxImage.parse(jp2FileAsByteArray);
    var endTime = Date.now();
    var componentsCount = jpxImage.componentsCount;
    var tileCount = jpxImage.tiles.length;
    var tileComponents = jpxImage.tiles[0];
    var decodedPixelData = tileComponents.items;
    var height = jpxImage.height;
    var width = jpxImage.width;

    //load reference raw file
    var referenceFileAsBuffer = fs.readFileSync('./test/data/' + filename + '.raw');


    //compare pixel by pixel
    var numDiff = 0;
    var cumDiff = 0;
    var maxErr = 0;
    for (var i = 0; i < height * width; i++) {
        referenceValue = referenceFileAsBuffer.readUInt16LE(i * 2);
        if (Math.abs(referenceValue - decodedPixelData[i]) > 0) {
            numDiff++;
            cumDiff += Math.pow(referenceValue - decodedPixelData[i], 2);
            if (Math.abs(referenceValue - decodedPixelData[i]) > maxErr) {
                maxErr = Math.abs(referenceValue - decodedPixelData[i]);
            }
        }
    }

    //write output
    var buf = new Buffer(height * width * 2);
    for (var i = 0; i < height * width; i++) {
        buf.writeUInt16LE(decodedPixelData[i], i * 2);
    }
    fs.writeFileSync('./test/out_' + filename + '.raw', buf);

    var numSamples = (height * width * componentsCount);

    test.ok((lossless ? maxErr === 0 : maxErr <= 1), numDiff + ' / ' + numSamples + ' degraded pixels, MSE=' + cumDiff / numSamples + ' Max err= ' + maxErr);
    return {
        numDiff: numDiff,
        cumDiff: cumDiff,
        decodeTime: (endTime - startTime),
        numSamples: numSamples,
    }
}

exports.file_860AE501 = function (test) {
    var result = testJp2Decode('860AE501.dcm', test, true)
    test.done();
};

exports.file_unexpectedEOF = function (test) {
    var result = testJp2Decode('unexpectedEOF', test, true)
    test.done();
};

exports.file_lossyhdr = function (test) {
    var result = testJp2Decode('lossyhdr.dcm', test, false)
    test.done();
};
