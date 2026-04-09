<?php
$key = 'xai-rV2Vs19fJe8UeuUC1sBiXMPTjfrcEo3C7DLxT09T1BXF8O9Yx9wlQpBHNNkv64Lycs7zjwccD5pbI24o';
$ch = curl_init('https://api.x.ai/v1/models');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key],
]);
$r = curl_exec($ch);
$data = json_decode($r, true);
if (!isset($data['data'])) { echo $r; exit(1); }
foreach ($data['data'] as $m) {
    echo $m['id'] . PHP_EOL;
}
