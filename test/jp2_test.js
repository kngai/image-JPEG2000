// load modules
global.PDFJS = {};
var fs = require('fs');
var vm = require('vm');
vm.runInThisContext(fs.readFileSync('./dist/jpx.js', 'utf8') + '');

function testJp2Decode(filename) {
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
    var referenceFileAsByteArray = new Uint8Array(referenceFileAsBuffer);

    //compare pixel by pixel
    var numDiff = 0;
    var cumDiff = 0;
    for (var i = 0; i < height * width; i++) {
        if (Math.abs(referenceFileAsByteArray[i] - decodedPixelData[i]) > 0) {
            numDiff++;
            cumDiff += Math.pow(referenceValue - decodedPixelData[i], 2);
        }
    }

    return {
        numDiff: numDiff,
        cumDiff: cumDiff,
        decodeTime: (endTime - startTime),
        numSamples: (height * width * componentsCount),
    }

}

exports.peppers_lossless = function (test) {
    var result = testJp2Decode('peppers.lossless')
    test.ok(result.decodeTime < 500, "Decode time is slow (>500ms)");
    test.ok(result.numDiff === 0, 'Output does not match reference. ' + result.numDiff + ' / ' + result.numSamples + ' degraded pixels. MSE=' + result.cumDiff / result.numSamples);
    test.done();
};

exports.peppers_10 = function (test) {
    var result = testJp2Decode('peppers.10')
    test.ok(result.decodeTime < 500, "Decode time is slow (>500ms)");
    test.ok(result.numDiff === 0, 'Output does not match reference. ' + result.numDiff + ' / ' + result.numSamples + ' degraded pixels. MSE=' + result.cumDiff / result.numSamples);
    test.done();
};

exports.cameraman_lossless = function (test) {
    var result = testJp2Decode('cameraman.lossless')
    test.ok(result.decodeTime < 500, "Decode time is slow (>500ms)");
    test.ok(result.numDiff === 0, 'Output does not match reference. ' + result.numDiff + ' / ' + result.numSamples + ' degraded pixels. MSE=' + result.cumDiff / result.numSamples);
    test.done();
};

exports.cameraman_10 = function (test) {
    var result = testJp2Decode('cameraman.10')
    test.ok(result.decodeTime < 500, "Decode time is slow (>500ms)");
    test.ok(result.numDiff === 0, 'Output does not match reference. ' + result.numDiff + ' / ' + result.numSamples + ' degraded pixels. MSE=' + result.cumDiff / result.numSamples);
    test.done();
};


exports.subsampling_1 = function (test) {
    var result = testJp2Decode('subsampling_1')
    test.ok(result.decodeTime < 500, "Decode time is slow (>500ms)");
    test.ok(result.numDiff === 0, 'Output does not match reference. ' + result.numDiff + ' / ' + result.numSamples + ' degraded pixels. MSE=' + result.cumDiff / result.numSamples);
    test.done();
};

exports.subsampling_2 = function (test) {
    var result = testJp2Decode('subsampling_2')
    test.ok(result.decodeTime < 800, "Decode time is slow (>800ms)");
    test.ok(result.numDiff === 0, 'Output does not match reference. ' + result.numDiff + ' / ' + result.numSamples + ' degraded pixels. MSE=' + result.cumDiff / result.numSamples);
    test.done();
};
