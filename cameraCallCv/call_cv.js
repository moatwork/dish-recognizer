// Config here
const VISION_API_IMG_ENDPOINT = " https://dish1.cognitiveservices.azure.com/customvision/v3.0/Prediction/28d8ff9b-1770-4b47-ac91-e24128a6b36d/classify/iterations/Iteration1/image";
const VISION_API_KEY = '61b82cd30f7742e49b94cb61b685c7fe';
//const POST_ENDPOINT = "https://functions-app-demo.azurewebsites.net/api/cameraFunction";
const MAX_SIZE = 1200;
const JPEG_QUAL = 0.7;

$('#file').on('change', function (e) {
  var file = e.target.files[0];

  if (file) {
    if (/^image\//i.test(file.type)) {
      processFile(file);
    } else {
      alert('Not a valid image!');
    }
  }
});

function processFile(file) {

  $("#msg").html('Uploading please wait...');
  $("#msg").show();

  // Load the image
  var reader = new FileReader();
  reader.onload = function (readerEvent) {
    var image = new Image();
    image.onload = function (imageEvent) {

      // Resize the image
      var canvas = document.createElement('canvas')
      var width = image.width
      var height = image.height
      if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
      } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
      }
      // Draw resized into canvas
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
      var dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUAL);

      // Display on page (with real img element)
      $('#img').attr('src', dataUrl);

      // Now HTTP POST to endpoint
      fetch(dataUrl).then(function(resp) {
          return resp.arrayBuffer();
      }).then(function(buf) {
          $.ajax({
              url: VISION_API_IMG_ENDPOINT,
              type: "POST",
              contentType: "application/octet-stream",
              processData: false,
              data: new Uint8Array(buf),
              headers: {"Prediction-Key": VISION_API_KEY},
              // If good or bad, display message
              success: function (resp) {
                  $("#msg").html(JSON.stringify(resp));
              },
              error: function (xhr, status, error) {
                  $("#msg").html(status+' '+error);
              }
          });
      });

    }
    image.src = readerEvent.target.result;
  }

  reader.readAsDataURL(file);
}