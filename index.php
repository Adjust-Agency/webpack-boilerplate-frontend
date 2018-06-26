<?php $manifest = json_decode(file_get_contents(__DIR__ . '/dist/manifest.json'), true) ?>
<!doctype html>
<html class="no-js" lang="" >
    <head>
        
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        
        <title></title>
        
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <link rel="stylesheet" href="/dist/css/main.css?cache=<?= !empty($manifest['main']) ? $manifest['main'] : mt_rand(0,999999) ?>">
        
    </head>
    <body>
		
        <h1 style="margin:3em;font-family:sans-serif;text-transform:uppercase;" >Adjust Webpack Boilerplate</h1>

        <script src="/dist/js/vendor.js?cache=<?= !empty($manifest['vendor']) ? $manifest['vendor'] : mt_rand(0,999999) ?>"></script> 
        <script src="/dist/js/main.js?cache=<?= !empty($manifest['main']) ? $manifest['main'] : mt_rand(0,999999) ?>"></script>
    </body>
</html>