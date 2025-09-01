<?php
include './functions.php';
$PDOcon = connectToDatabase();
// need more time I think. Set to 120 seconds
ini_set('max_execution_time', '120');
// initialize cURL
$curl_handle = curl_init();
// set curl options
curl_setopt_array($curl_handle, [CURLOPT_URL => 'https://kaktussoft.nl/waagje/php/partij_voegtoe.php', CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true]);
// process all records that have to be imported
foreach ($PDOcon->query("SELECT * FROM importData ORDER BY datum,ID") as $formData) {
    // define all form fields to POST. Extra POST fields (ID and wachtwoord) are not used by PDO in partij_voegtoe.php
    $formData['wachtwoord'] = MANAGEMENTPWD;
    curl_setopt($curl_handle, CURLOPT_POSTFIELDS, $formData);
    // execute
    $response = curl_exec($curl_handle);
    // check for error
    if (curl_errno($curl_handle)) {
        echo "cURL-fout record {$formData['ID']}: " . curl_error($curl_handle) . '<br>';
        continue;
    }
    if ($response !== '{"message":"Partij succesvol ingevoerd."}') {
        // display record number and response
        echo "record {$formData['ID']}: {$response}<br>";
    }
}
echo 'Klaar!<br>';