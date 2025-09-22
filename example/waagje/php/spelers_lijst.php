<?php
include './functions.php';
$PDOcon = connectToDatabase();
$extra  = "TRUE";
if (isset($_GET['ActiveOnly'])) {
    $extra = "Actief";
}
$sql     = "SELECT SpelersNaam FROM Spelers WHERE $extra ORDER BY SpelersNaam";
$records = $PDOcon->query($sql)->fetchAll();
header("Content-Type: application/json; charset=UTF-8");
echo json_encode($records);