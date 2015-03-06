// load modules
global.PDFJS = {};
var fs = require('fs');
var vm = require('vm');
var dicomParser = require('../node_modules/dicom-parser/dist/dicomParser');
vm.runInThisContext(fs.readFileSync('./dist/jpx.js', 'utf8') + '');

function testDcmDecode(filename) {
    //load dicom file using
    var dicomFileAsBuffer = fs.readFileSync('./test/data/' + filename + '.dcm');
    var dicomFileAsByteArray = new Uint8Array(dicomFileAsBuffer);
    var dataSet = dicomParser.parseDicom(dicomFileAsByteArray);
    var patientName = dataSet.string('x00100010');


    //Extract embedded JPEG2000 stream
    var imageBaseOffset = dataSet.elements.x7fe00010.dataOffset + 16;
    var layer1 = dataSet.uint32('x00691012');
    var layer2 = dataSet.uint32('x00691013');
    var layer3 = dataSet.uint32('x00691014');
    var jpxData = dicomFileAsByteArray.subarray(imageBaseOffset, layer3);

    //decode JPEG2000 steam
    var jpxImage = new global.JpxImage();
    var startTime = Date.now();
    jpxImage.parse(jpxData);
    var endTime = Date.now();
    var componentsCount = jpxImage.componentsCount;
    var tileCount = jpxImage.tiles.length;
    var tileComponents = jpxImage.tiles[0];
    var decodedPixelData = tileComponents.items;
    var height = jpxImage.height;
    var width = jpxImage.width;
    var j2kDecodeTime = (endTime - startTime);

    //load reference raw file
    var referenceFileAsBuffer = fs.readFileSync('./test/data/' + filename + '.raw');

    //compare pixel by pixel
    var numDiff = 0;
    var cumDiff = 0;
    for (var i = 0; i < height * width; i++) {
        referenceValue = referenceFileAsBuffer.readInt16LE(i * 2);
        if (Math.abs(referenceValue - decodedPixelData[i]) > 0) {
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

exports.dcm_00000 = function (test) {
    var result = testDcmDecode('000000')
    test.ok(result.decodeTime < 500, "Decode time is slow (>300ms)");
    test.ok(result.numDiff === 0, 'Output does not match reference. ' + result.numDiff + ' / ' + result.numSamples + ' degraded pixels. MSE=' + result.cumDiff / result.numSamples);
    test.done();
};
