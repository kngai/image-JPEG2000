// load modules
var fs = require('fs');
var Module = require('../dist/js/libopenjpeg.js');

function testJp2Decode(filename, test, lossless) {
    //load jp2 file using
    var jp2FileAsBuffer = fs.readFileSync('./test/data/' + filename + '.jp2');
    var jp2FileAsByteArray = new Uint8Array(jp2FileAsBuffer);

    //decode JPEG2000 steam
    var startTime = Date.now();
    image = Module.opj_decode(jp2FileAsByteArray)
    if (image === undefined) {
        test.ok(false, 'decoding failed');
        return;
    }
    var endTime = Date.now();
    var componentsCount = image.nbChannels;
    var decodedPixelData = image.pixelData;
    var height = image.sy;
    var width = image.sx;

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

    if ((lossless ? maxErr === 0 : maxErr <= 2)) {
        fs.writeFileSync('./test/out_' + filename + '.raw', new Buffer(decodedPixelData));
    }

    var numSamples = (height * width * componentsCount);
    test.ok((lossless ? maxErr === 0 : maxErr <= 2), numDiff + ' / ' + numSamples + ' degraded pixels, MSE=' + cumDiff / numSamples + ' Max err= ' + maxErr);

    return {
        numDiff: numDiff,
        cumDiff: cumDiff,
        maxErr: maxErr,
        decodeTime: (endTime - startTime),
        numSamples: numSamples,
    }

}

exports.peppers_lossless = function (test) {
    var result = testJp2Decode('peppers.lossless', test, true)
    test.done();
};

exports.peppers_10 = function (test) {
    var result = testJp2Decode('peppers.10', test, false)
    test.done();
};

exports.cameraman_lossless = function (test) {
    var result = testJp2Decode('cameraman.lossless', test, true)
    test.done();
};

exports.cameraman_10 = function (test) {
    var result = testJp2Decode('cameraman.10', test, false)
    test.done();
};
