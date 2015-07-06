// load modules
global.PDFJS = {};
var fs = require('fs');
var vm = require('vm');
vm.runInThisContext(fs.readFileSync('./dist/jpx.js', 'utf8') + '');

function testJp2Decode(filename, test, lossless) {
    //load jp2 file using
    var jp2FileAsBuffer = fs.readFileSync('./test/data/' + filename + '.jpc');
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
    var referenceFileAsByteArray = new Uint8Array(referenceFileAsBuffer);

    //compare pixel by pixel
    var numDiff = 0;
    var cumDiff = 0;
    var maxErr = 0;
    for (var i = 0; i < height * width; i++) {
        if (Math.abs(referenceFileAsByteArray[i] - decodedPixelData[i]) > 0) {
            numDiff++;
            cumDiff += Math.pow(referenceFileAsByteArray[i] - decodedPixelData[i], 2);
            if (Math.abs(referenceFileAsByteArray[i] - decodedPixelData[i]) > maxErr) {
                maxErr = Math.abs(referenceFileAsByteArray[i] - decodedPixelData[i]);
            }
        }
    }

    if ((lossless ? maxErr === 0 : maxErr <= 1)) {
        fs.writeFileSync('./test/out_' + filename + '.raw', new Buffer(decodedPixelData));
    }

    var numSamples = (height * width * componentsCount);
    test.ok((lossless ? maxErr === 0 : maxErr <= 1), numDiff + ' / ' + numSamples + ' degraded pixels, MSE=' + cumDiff / numSamples + ' Max err= ' + maxErr);

    return {
        numDiff: numDiff,
        cumDiff: cumDiff,
        maxErr: maxErr,
        decodeTime: (endTime - startTime),
        numSamples: numSamples,
    }

}

exports.saturn = function (test) {
    var result = testJp2Decode('saturn', test, true)
    test.done();
};
